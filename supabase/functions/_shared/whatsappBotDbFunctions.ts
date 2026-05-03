// Funções de Database para WhatsApp Bot
import type { FuncionarioBot, TecnicoBot, ParceiroBot, AvaliacaoConfig, DadosAgendamentoExtraidos, DadosFinanceiros } from "./whatsappBotHelpers.ts";
import { detectarLocacao } from "./whatsappBotHelpers.ts";

function applyTenantFilter(query: any, tenantId?: string | null) {
  return tenantId ? query.eq("tenant_id", tenantId) : query;
}

/**
 * Normaliza telefone brasileiro gerando TODAS as variantes possíveis para matching robusto.
 * Cobre 16+ formatos: com/sem +55, com/sem DDD, com/sem 9º dígito, com/sem formatação.
 * 
 * Formatos aceitos:
 * - 9XXXXXXXX (9 dígitos - local)
 * - DD9XXXXXXXX (11 dígitos - DDD + celular com 9)
 * - DDXXXXXXXX (10 dígitos - DDD + celular sem 9 / fixo)
 * - 55DD9XXXXXXXX (13 dígitos - país + DDD + celular)
 * - 55DDXXXXXXXX (12 dígitos - país + DDD + sem 9)
 * - +55 (DD) 9XXXX-XXXX (formatado)
 * - 0XX DD 9XXXX-XXXX (com operadora)
 */
function normalizeBrPhoneVariants(raw: string): string[] {
  // Remove tudo que não é dígito
  let digits = raw.replace(/\D/g, '');
  const variants = new Set<string>();
  
  // Se vazio, retorna array vazio
  if (!digits) return [];
  
  // Guardar original (sem formatação)
  variants.add(digits);
  
  // 1. Remover prefixo de país (+55 ou 55) - aceita 12+ dígitos
  if (digits.startsWith('55') && digits.length >= 12) {
    const semPais = digits.substring(2);
    variants.add(semPais);
    digits = semPais; // Continuar com versão sem país
  }
  
  // 2. Remover código de operadora (0XX) se existir
  if (digits.startsWith('0') && digits.length >= 11) {
    if (digits.length >= 13) {
      // 0XX + DDD + número (13+ dígitos)
      const semOperadora = digits.substring(3);
      variants.add(semOperadora);
      digits = semOperadora;
    } else {
      // Apenas 0 inicial (0 + 10-11 dígitos)
      const semZero = digits.substring(1);
      variants.add(semZero);
      digits = semZero;
    }
  }
  
  // Agora `digits` deve ter 10 ou 11 dígitos (DDD + número local)
  variants.add(digits);
  
  // 3. Gerar variantes com/sem o 9º dígito
  if (digits.length === 10) {
    // 10 dígitos: DDD (2) + número local (8)
    // Adicionar 9 após DDD para celulares novos
    const ddd = digits.substring(0, 2);
    const local = digits.substring(2);
    const com9 = ddd + '9' + local; // 11 dígitos
    variants.add(com9);
  } else if (digits.length === 11 && digits.charAt(2) === '9') {
    // 11 dígitos com 9: DDD (2) + 9 + número (8)
    // Gerar versão sem o 9
    const ddd = digits.substring(0, 2);
    const local = digits.substring(3); // Pula o 9
    const sem9 = ddd + local; // 10 dígitos
    variants.add(sem9);
  }
  
  // 4. Adicionar versões COM prefixo 55 para matching com banco
  const baseVariants = Array.from(variants);
  for (const v of baseVariants) {
    if (!v.startsWith('55') && (v.length === 10 || v.length === 11)) {
      variants.add('55' + v);
    }
  }
  
  return Array.from(variants);
}

/**
 * Verifica se há interseção entre dois conjuntos de variantes de telefone
 */
function phoneVariantsMatch(variants1: string[], variants2: string[]): boolean {
  const set2 = new Set(variants2);
  return variants1.some(v => set2.has(v));
}

export async function verificarFuncionarioBot(sb: any, tel: string, tenantId?: string | null): Promise<FuncionarioBot | null> {
  try {
    const incomingVariants = normalizeBrPhoneVariants(tel);
    console.log(`📱 [verificarFuncionarioBot] Incoming: ${tel} -> variants: ${JSON.stringify(incomingVariants)}`);
    
    const funcionariosQuery = applyTenantFilter(
      sb.from("funcionarios_bot").select("id, nome, telefone_whatsapp, ativo, tenant_id").eq("ativo", true),
      tenantId,
    );
    const { data, error } = await funcionariosQuery;
    if (error || !data) {
      console.log(`❌ [verificarFuncionarioBot] Erro ao buscar funcionários: ${error?.message || 'sem dados'}`);
      return null;
    }
    
    const found = data.find((f: FuncionarioBot) => {
      const dbVariants = normalizeBrPhoneVariants(f.telefone_whatsapp);
      const match = phoneVariantsMatch(incomingVariants, dbVariants);
      if (match) {
        console.log(`✅ [verificarFuncionarioBot] Match: ${f.nome} (${f.telefone_whatsapp}) -> dbVariants: ${JSON.stringify(dbVariants)}`);
      }
      return match;
    });
    
    if (!found) {
      console.log(`❌ [verificarFuncionarioBot] Nenhum match. Funcionários ativos: ${data.map((f: any) => `${f.nome}:${f.telefone_whatsapp}`).join(', ')}`);
    }
    
    return found || null;
  } catch (e) {
    console.error(`💥 [verificarFuncionarioBot] Erro:`, e);
    return null;
  }
}

export async function verificarTecnicoBot(sb: any, tel: string): Promise<TecnicoBot | null> {
  try {
    const incomingVariants = normalizeBrPhoneVariants(tel);
    const { data: tecs, error } = await sb.from("profiles").select("id, nome_completo, telefone").not("telefone", "is", null);
    if (error || !tecs) return null;
    for (const t of tecs) {
      const dbVariants = normalizeBrPhoneVariants(t.telefone || "");
      if (phoneVariantsMatch(incomingVariants, dbVariants)) {
        const { data: rd } = await sb.from("user_roles").select("role").eq("user_id", t.id).eq("role", "tecnico").maybeSingle();
        if (rd) return { id: t.id, nome: t.nome_completo || "Técnico", telefone: t.telefone };
      }
    }
    return null;
  } catch { return null; }
}

export async function verificarParceiroBot(sb: any, tel: string): Promise<ParceiroBot | null> {
  try {
    const incomingVariants = normalizeBrPhoneVariants(tel);
    console.log(`📱 [verificarParceiroBot] Incoming: ${tel} -> variants: ${JSON.stringify(incomingVariants)}`);
    
    const { data: ps, error } = await sb.from("parceiros").select("id, nome, codigo_referencia, telefone, saldo_disponivel, total_ganhos, status").eq("status", "ativo");
    if (error || !ps) return null;
    
    const p = ps.find((x: any) => {
      const dbVariants = normalizeBrPhoneVariants(x.telefone || "");
      const match = phoneVariantsMatch(incomingVariants, dbVariants);
      if (match) console.log(`✅ [verificarParceiroBot] Match found: ${x.nome} (${x.telefone})`);
      return match;
    });
    
    return p ? { id: p.id, nome: p.nome || "Parceiro", codigo: p.codigo_referencia, telefone: p.telefone, saldo_disponivel: p.saldo_disponivel || 0, total_ganhos: p.total_ganhos || 0 } : null;
  } catch { return null; }
}

export async function buscarAgendaTecnico(sb: any, tecId: string): Promise<any[]> {
  const hoje = new Date().toISOString().split('T')[0];
  const { data, error } = await sb.from("agendamentos").select("id, order_code, nome_cliente, telefone, endereco, bairro, cidade, horario, status, valor_total, itens_carrinho").eq("tecnico_id", tecId).eq("data_agendamento", hoje).in("status", ["confirmado", "em_andamento"]).order("horario", { ascending: true });
  return error ? [] : data || [];
}

export async function buscarProximoServico(sb: any, tecId: string): Promise<any | null> {
  const hoje = new Date().toISOString().split('T')[0];
  const { data } = await sb.from("agendamentos").select("id, order_code, nome_cliente, telefone, endereco, bairro, cidade, horario, status, valor_total, itens_carrinho").eq("tecnico_id", tecId).eq("data_agendamento", hoje).in("status", ["confirmado", "em_andamento"]).order("horario", { ascending: true }).limit(1).maybeSingle();
  return data;
}

export async function concluirServico(sb: any, tecId: string, cod: string): Promise<{ sucesso: boolean; mensagem: string }> {
  const { data: ag } = await sb.from("agendamentos").select("id, order_code, status, tecnico_id, nome_cliente").eq("tecnico_id", tecId).ilike("order_code", `%${cod}%`).maybeSingle();
  if (!ag) return { sucesso: false, mensagem: `Serviço "${cod}" não encontrado.` };
  if (ag.status === "concluido") return { sucesso: false, mensagem: `${ag.order_code} já concluído.` };
  const { error } = await sb.from("agendamentos").update({ status: "concluido", concluido_em: new Date().toISOString(), concluido_por: tecId }).eq("id", ag.id);
  return error ? { sucesso: false, mensagem: "Erro ao atualizar." } : { sucesso: true, mensagem: `✅ ${ag.order_code} (${ag.nome_cliente}) CONCLUÍDO!` };
}

export async function buscarConversoesParceiro(sb: any, pId: string): Promise<any[]> {
  const { data } = await sb.from("parceiro_conversoes").select("id, valor_servico, valor_comissao, status, created_at").eq("parceiro_id", pId).order("created_at", { ascending: false }).limit(10);
  return data || [];
}

// ========== FASE 1: NOVOS COMANDOS ==========

// FUNCIONÁRIOS
export async function buscarAgendamentosHoje(sb: any, tenantId?: string | null): Promise<any[]> {
  const hoje = new Date().toISOString().split('T')[0];
  const query = applyTenantFilter(
    sb.from("agendamentos").select("order_code, nome_cliente, telefone, horario, status, valor_total, bairro, cidade, tecnico_id").eq("data_agendamento", hoje),
    tenantId,
  ).order("horario", { ascending: true });
  const { data } = await query;
  return data || [];
}

export async function buscarAgendamentosPendentes(sb: any, tenantId?: string | null): Promise<any[]> {
  const query = applyTenantFilter(
    sb.from("agendamentos").select("order_code, nome_cliente, telefone, data_agendamento, horario, status, valor_total, bairro, created_at").eq("status", "pendente"),
    tenantId,
  ).order("created_at", { ascending: false }).limit(20);
  const { data } = await query;
  return data || [];
}

export async function buscarResumoFinanceiro(sb: any, tenantId?: string | null): Promise<{ hoje: { total: number; qtd: number; pendentes: number; confirmados: number; concluidos: number }; ontem: { total: number; qtd: number }; despesasHoje: number }> {
  const hoje = new Date().toISOString().split('T')[0];
  const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const { data: agHoje } = await applyTenantFilter(sb.from("agendamentos").select("status, valor_total").eq("data_agendamento", hoje), tenantId);
  const { data: agOntem } = await applyTenantFilter(sb.from("agendamentos").select("valor_total").eq("data_agendamento", ontem), tenantId);
  const { data: despHoje } = await applyTenantFilter(sb.from("despesas").select("valor").eq("data_despesa", hoje).eq("status", "paga"), tenantId);
  
  const listaHoje = agHoje || [];
  return {
    hoje: {
      total: listaHoje.reduce((s: number, a: any) => s + (a.valor_total || 0), 0),
      qtd: listaHoje.length,
      pendentes: listaHoje.filter((a: any) => a.status === 'pendente').length,
      confirmados: listaHoje.filter((a: any) => a.status === 'confirmado').length,
      concluidos: listaHoje.filter((a: any) => a.status === 'concluido').length
    },
    ontem: {
      total: (agOntem || []).reduce((s: number, a: any) => s + (a.valor_total || 0), 0),
      qtd: (agOntem || []).length
    },
    despesasHoje: (despHoje || []).reduce((s: number, d: any) => s + (d.valor || 0), 0)
  };
}

// TÉCNICOS
export async function buscarAgendaSemana(sb: any, tecId: string): Promise<any[]> {
  const hoje = new Date().toISOString().split('T')[0];
  const fim = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const { data } = await sb.from("agendamentos").select("id, order_code, nome_cliente, telefone, endereco, bairro, cidade, data_agendamento, horario, status, valor_total, itens_carrinho").eq("tecnico_id", tecId).gte("data_agendamento", hoje).lte("data_agendamento", fim).in("status", ["confirmado", "em_andamento", "pendente"]).order("data_agendamento", { ascending: true }).order("horario", { ascending: true });
  return data || [];
}

export async function buscarRotaDia(sb: any, tecId: string): Promise<any[]> {
  const hoje = new Date().toISOString().split('T')[0];
  const { data } = await sb.from("agendamentos").select("order_code, nome_cliente, telefone, endereco, bairro, cidade, horario, status, latitude, longitude").eq("tecnico_id", tecId).eq("data_agendamento", hoje).in("status", ["confirmado", "em_andamento"]).order("horario", { ascending: true });
  return data || [];
}

// PARCEIROS
export async function solicitarSaque(sb: any, parceiroId: string, valor: number): Promise<{ sucesso: boolean; erro?: string; saqueId?: string }> {
  try {
    // Buscar saldo atual
    const { data: parceiro } = await sb.from("parceiros").select("saldo_disponivel, nome").eq("id", parceiroId).single();
    if (!parceiro) return { sucesso: false, erro: "Parceiro não encontrado" };
    if (parceiro.saldo_disponivel < valor) return { sucesso: false, erro: `Saldo insuficiente. Disponível: R$ ${parceiro.saldo_disponivel.toFixed(2)}` };
    if (valor < 50) return { sucesso: false, erro: "Valor mínimo para saque: R$ 50,00" };
    
    // Criar solicitação de saque
    const { data: saque, error } = await sb.from("parceiro_saques").insert({
      parceiro_id: parceiroId,
      valor: valor,
      status: 'pendente'
    }).select().single();
    
    if (error) return { sucesso: false, erro: error.message };
    return { sucesso: true, saqueId: saque.id };
  } catch { return { sucesso: false, erro: "Erro ao processar saque" }; }
}

export async function buscarRankingParceiros(sb: any, parceiroId: string): Promise<{ posicao: number; total: number; meusDados: { nome: string; ganhos: number; conversoes: number }; top3: { nome: string; ganhos: number }[] }> {
  const { data: parceiros } = await sb.from("parceiros").select("id, nome, total_ganhos").eq("status", "ativo").order("total_ganhos", { ascending: false });
  const lista = parceiros || [];
  const meuIndex = lista.findIndex((p: any) => p.id === parceiroId);
  const meuParceiro = lista[meuIndex];
  
  const { data: minhasConv } = await sb.from("parceiro_conversoes").select("id").eq("parceiro_id", parceiroId).eq("status", "aprovada");
  
  return {
    posicao: meuIndex + 1,
    total: lista.length,
    meusDados: { 
      nome: meuParceiro?.nome || "Você", 
      ganhos: meuParceiro?.total_ganhos || 0,
      conversoes: (minhasConv || []).length
    },
    top3: lista.slice(0, 3).map((p: any) => ({ nome: p.nome, ganhos: p.total_ganhos || 0 }))
  };
}

// ========== FASE 2: NOVOS COMANDOS ==========

// FUNCIONÁRIOS - @buscar [termo]
export async function buscarAgendamentoPorTermo(sb: any, termo: string, tenantId?: string | null): Promise<any[]> {
  // Limpar termo para busca segura
  const termoNome = termo.trim();
  const termoTelefone = termo.replace(/\D/g, '');
  
  // Se termo parece ser telefone (só números e >= 8 dígitos), buscar por telefone
  if (termoTelefone.length >= 8) {
    const query = applyTenantFilter(
      sb.from("agendamentos")
      .select("order_code, nome_cliente, telefone, data_agendamento, horario, status, valor_total, bairro, cidade")
      .ilike("telefone", `%${termoTelefone}%`)
      .order("data_agendamento", { ascending: false })
      .limit(15),
      tenantId,
    );
    const { data } = await query;
    return data || [];
  }
  
  // Caso contrário, buscar por nome ou order_code
  const query = applyTenantFilter(
    sb.from("agendamentos")
    .select("order_code, nome_cliente, telefone, data_agendamento, horario, status, valor_total, bairro, cidade")
    .or(`nome_cliente.ilike.%${termoNome}%,order_code.ilike.%${termoNome}%`)
    .order("data_agendamento", { ascending: false })
    .limit(15),
    tenantId,
  );
  const { data } = await query;
  return data || [];
}

// FUNCIONÁRIOS - @status [código/nome]
export async function buscarStatusAgendamento(sb: any, codigo: string, tenantId?: string | null): Promise<any | null> {
  // Busca por order_code ou nome do cliente
  const baseQuery = applyTenantFilter(
    sb.from("agendamentos")
    .select("id, order_code, nome_cliente, telefone, endereco, bairro, cidade, cep, data_agendamento, horario, status, valor_total, valor_desconto, cupom_codigo, forma_pagamento, origem, itens_carrinho, tecnico_id, created_at")
    .or(`order_code.ilike.%${codigo}%,nome_cliente.ilike.%${codigo}%`)
    .order("created_at", { ascending: false })
    .limit(1),
    tenantId,
  );
  const { data } = await baseQuery.maybeSingle();
  
  if (data && data.tecnico_id) {
    const { data: tec } = await sb.from("profiles").select("nome_completo").eq("id", data.tecnico_id).maybeSingle();
    data.tecnico_nome = tec?.nome_completo || null;
  }
  
  return data;
}

// FUNCIONÁRIOS - @semana (próximos 7 dias - TODOS os agendamentos)
export async function buscarAgendamentosSemanaFuncionario(sb: any, tenantId?: string | null): Promise<any[]> {
  const hoje = new Date().toISOString().split('T')[0];
  const fim = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const query = applyTenantFilter(
    sb.from("agendamentos")
    .select("order_code, nome_cliente, telefone, data_agendamento, horario, status, valor_total, bairro")
    .gte("data_agendamento", hoje)
    .lte("data_agendamento", fim)
    .order("data_agendamento", { ascending: true })
    .order("horario", { ascending: true }),
    tenantId,
  );
  const { data } = await query;
  return data || [];
}

// FUNCIONÁRIOS - @pagos (pagamentos recebidos hoje)
export async function buscarPagamentosRecentes(sb: any, tenantId?: string | null): Promise<{ lista: any[]; total: number }> {
  const hoje = new Date().toISOString().split('T')[0];
  const query = applyTenantFilter(
    sb.from("pagamentos_agendamentos")
    .select("id, valor_pago, forma_pagamento, data_pagamento, agendamento_id, agendamentos(order_code, nome_cliente)")
    .eq("status", "pago")
    .gte("data_pagamento", `${hoje}T00:00:00`)
    .order("data_pagamento", { ascending: false })
    .limit(20),
    tenantId,
  );
  const { data } = await query;
  
  const lista = data || [];
  const total = lista.reduce((s: number, p: any) => s + (p.valor_pago || 0), 0);
  return { lista, total };
}

// FUNCIONÁRIOS - @despesas (despesas de hoje)
export async function buscarDespesasHojeFuncionario(sb: any, tenantId?: string | null): Promise<{ lista: any[]; total: number }> {
  const hoje = new Date().toISOString().split('T')[0];
  const query = applyTenantFilter(
    sb.from("despesas")
    .select("id, descricao, valor, categoria, forma_pagamento, data_despesa")
    .eq("data_despesa", hoje)
    .order("created_at", { ascending: false }),
    tenantId,
  );
  const { data } = await query;
  
  const lista = data || [];
  const total = lista.reduce((s: number, d: any) => s + (d.valor || 0), 0);
  return { lista, total };
}

// TÉCNICOS - @historico (últimos 10 concluídos)
export async function buscarHistoricoTecnico(sb: any, tecId: string): Promise<any[]> {
  const { data } = await sb.from("agendamentos")
    .select("order_code, nome_cliente, data_agendamento, bairro, valor_total, concluido_em")
    .eq("tecnico_id", tecId)
    .eq("status", "concluido")
    .order("concluido_em", { ascending: false })
    .limit(10);
  return data || [];
}

// TÉCNICOS - @mapa [código] (buscar agendamento para gerar link maps)
export async function buscarAgendamentoParaMapa(sb: any, tecId: string, codigo: string): Promise<any | null> {
  const { data } = await sb.from("agendamentos")
    .select("order_code, nome_cliente, endereco, bairro, cidade, cep, latitude, longitude")
    .eq("tecnico_id", tecId)
    .ilike("order_code", `%${codigo}%`)
    .maybeSingle();
  return data;
}

// PARCEIROS - @historico (histórico de saques)
export async function buscarHistoricoSaques(sb: any, parceiroId: string): Promise<any[]> {
  const { data } = await sb.from("parceiro_saques")
    .select("id, valor, status, metodo, created_at, processado_em")
    .eq("parceiro_id", parceiroId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data || [];
}

export async function carregarConfigAvaliacoes(sb: any, tenantId?: string | null): Promise<AvaliacaoConfig | null> {
  try {
    const query = applyTenantFilter(
      sb.from("integracoes").select("configuracao, status").eq("tipo", "avaliacoes"),
      tenantId,
    );
    const { data, error } = await query.maybeSingle();
    if (error || !data || data.status !== 'ativo') return null;
    const c = data.configuracao as Record<string, unknown>;
    return { google_reviews_url: (c?.google_reviews_url as string) || '', facebook_reviews_url: (c?.facebook_reviews_url as string) || '', nota_minima_review: (c?.nota_minima_review as number) || 8, mensagem_pedido_nota: (c?.mensagem_pedido_nota as string) || 'De 0 a 10?', mensagem_nota_alta: (c?.mensagem_nota_alta as string) || 'Obrigado! Avalie: {link}', mensagem_nota_baixa: (c?.mensagem_nota_baixa as string) || 'O que podemos melhorar?' };
  } catch { return null; }
}

export async function buscarLancamentoPendente(
  sb: any,
  tel: string,
  _tenantId?: string | null,
  funcionarioBotId?: string | null,
): Promise<any | null> {
  let query = sb.from("whatsapp_financeiro_log")
    .select("*")
    .eq("telefone_remetente", tel)
    .eq("processamento_status", "aguardando_confirmacao")
    .order("created_at", { ascending: false })
    .limit(1);
  if (funcionarioBotId) {
    query = query.eq("funcionario_bot_id", funcionarioBotId);
  }
  const { data } = await query.maybeSingle();
  return data;
}

export async function confirmarLancamento(
  sb: any,
  lanc: any,
  tenantId?: string | null,
  funcionarioBotId?: string | null,
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    if (funcionarioBotId && lanc.funcionario_bot_id && lanc.funcionario_bot_id !== funcionarioBotId) {
      return { sucesso: false, erro: "Lançamento não pertence ao funcionário autenticado" };
    }
    const an = lanc.analise_ia as DadosFinanceiros;
    
    // Buscar o user_id (profile) vinculado ao funcionário pelo telefone
    let createdBy: string | null = null;
    if (lanc.funcionario_bot_id) {
      // Buscar telefone do funcionário
      const funcQuery = applyTenantFilter(
        sb.from("funcionarios_bot").select("telefone_whatsapp").eq("id", lanc.funcionario_bot_id),
        tenantId,
      );
      const { data: func } = await funcQuery.single();
      if (func?.telefone_whatsapp) {
        // Buscar profile pelo telefone
        const profileQuery = applyTenantFilter(
          sb.from("profiles").select("id").eq("telefone_whatsapp", func.telefone_whatsapp),
          tenantId,
        );
        const { data: profile } = await profileQuery.single();
        if (profile) createdBy = profile.id;
      }
    }
    // Fallback: buscar pelo telefone_remetente diretamente
    if (!createdBy && lanc.telefone_remetente) {
      const tel = lanc.telefone_remetente.replace('@c.us', '');
      const variants = normalizeBrPhoneVariants(tel);
      const profilesQuery = applyTenantFilter(
        sb.from("profiles").select("id, telefone_whatsapp"),
        tenantId,
      );
      const { data: profiles } = await profilesQuery;
      if (profiles) {
        for (const p of profiles) {
          if (p.telefone_whatsapp) {
            const dbVariants = normalizeBrPhoneVariants(p.telefone_whatsapp);
            if (phoneVariantsMatch(variants, dbVariants)) {
              createdBy = p.id;
              break;
            }
          }
        }
      }
    }
    
    // Buscar tenant_id do funcionário
    let tenantId: string | null = null;
    if (lanc.funcionario_bot_id) {
      const funcTenantQuery = applyTenantFilter(
        sb.from("funcionarios_bot").select("tenant_id").eq("id", lanc.funcionario_bot_id),
        tenantId,
      );
      const { data: funcData } = await funcTenantQuery.single();
      if (funcData?.tenant_id) tenantId = funcData.tenant_id;
    }
    // Fallback: buscar tenant do profile
    if (!tenantId && createdBy) {
      const profTenantQuery = applyTenantFilter(
        sb.from("profiles").select("tenant_id").eq("id", createdBy),
        tenantId,
      );
      const { data: profData } = await profTenantQuery.single();
      if (profData?.tenant_id) tenantId = profData.tenant_id;
    }
    
    if (lanc.tipo_lancamento === 'despesa') {
      const funcNome = lanc.funcionario_nome || 'Funcionário';
      const { data: despesa, error } = await sb.from("despesas").insert({ 
        descricao: an.descricao, 
        valor: an.valor, 
        categoria: an.categoria, 
        data_despesa: an.data, 
        forma_pagamento: an.forma_pagamento || 'outros', 
        status: 'paga', 
        origem: 'whatsapp', 
        comprovante_url: lanc.arquivo_url || null, 
        observacoes: an.observacoes || `Via WhatsApp por ${funcNome} (${lanc.telefone_remetente})`,
        created_by: createdBy,
        tenant_id: tenantId,
      }).select('id').single();
      if (error) return { sucesso: false, erro: error.message };
      
      // Vincular despesa ao log
      if (despesa?.id) {
        let logUpdateQuery = sb.from("whatsapp_financeiro_log").update({ 
          despesa_id: despesa.id,
          processamento_status: "sucesso", 
          updated_at: new Date().toISOString() 
          }).eq("id", lanc.id);
        if (funcionarioBotId) {
          logUpdateQuery = logUpdateQuery.eq("funcionario_bot_id", funcionarioBotId);
        }
        await logUpdateQuery;
      }
    } else {
      let logUpdateQuery = sb.from("whatsapp_financeiro_log")
        .update({ processamento_status: "sucesso", updated_at: new Date().toISOString() })
        .eq("id", lanc.id);
      if (funcionarioBotId) {
        logUpdateQuery = logUpdateQuery.eq("funcionario_bot_id", funcionarioBotId);
      }
      await logUpdateQuery;
    }
    
    return { sucesso: true };
  } catch (e) { return { sucesso: false, erro: "Erro interno" }; }
}

export async function cancelarLancamento(
  sb: any,
  id: string,
  _tenantId?: string | null,
  funcionarioBotId?: string | null,
): Promise<boolean> {
  let query = sb.from("whatsapp_financeiro_log")
    .update({ processamento_status: "cancelado", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (funcionarioBotId) {
    query = query.eq("funcionario_bot_id", funcionarioBotId);
  }
  const { error } = await query;
  return !error;
}

export async function criarAgendamentoViaFuncionario(sb: any, d: DadosAgendamentoExtraidos, funcId: string): Promise<{ sucesso: boolean; orderCode?: string; agendamentoId?: string; erro?: string }> {
  try {
    const oc = `BOT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    let tel = d.telefone.replace(/\D/g, ''); if (tel.startsWith('55') && tel.length > 11) tel = tel.substring(2); if (tel.length < 10 || tel.length > 11) return { sucesso: false, erro: "Telefone inválido" };
    const itens = d.itens.map((i, idx) => ({ id: `func-${Date.now()}-${idx}`, name: i.name, details: i.details || i.name, price: i.price, quantity: i.quantity || 1 }));
    // Buscar tenant_id do funcionário
    const { data: funcTenant } = await sb.from("funcionarios_bot").select("tenant_id").eq("id", funcId).single();
    const tenantId = funcTenant?.tenant_id || null;
    // Detectar locação: usar flag da IA ou fallback por palavras-chave
    const isLocacao = d.is_locacao || detectarLocacao(d.itens.map(i => i.name).join(' '), d.itens);
    if (isLocacao) d.is_locacao = true;
    const { data: ag, error } = await sb.from("agendamentos").insert({ nome_cliente: d.nome_cliente, telefone: tel, endereco: d.endereco, bairro: d.bairro, cidade: d.cidade, cep: d.cep || null, data_agendamento: d.data_agendamento, horario: d.periodo === "Manhã" ? "08:00-12:00" : d.periodo === "Tarde" ? "13:00-18:00" : null, itens_carrinho: itens, valor_total: d.valor_total, status: "confirmado", origem: "atendente_whatsapp", order_code: oc, criado_manualmente: false, criado_por_funcionario_bot: funcId, tenant_id: tenantId, is_locacao: isLocacao }).select().single();
    if (error) return { sucesso: false, erro: error.message };
    return { sucesso: true, orderCode: oc, agendamentoId: ag.id };
  } catch { return { sucesso: false, erro: "Erro interno" }; }
}
