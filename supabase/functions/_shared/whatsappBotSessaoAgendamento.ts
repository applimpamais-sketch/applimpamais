// Sessão de agendamento progressivo - acumula dados de múltiplas mensagens
import type { DadosAgendamentoExtraidos } from "./whatsappBotHelpers.ts";
import { formatarDataBR } from "./whatsappBotHelpers.ts";

interface DadosParciais {
  nome_cliente?: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  servico?: string;
  data_agendamento?: string;
  periodo?: string;
  valor?: number;
  is_locacao?: boolean;
}

interface Sessao {
  id: string;
  funcionario_telefone: string;
  funcionario_bot_id: string;
  tenant_id: string | null;
  dados_parciais: DadosParciais;
  campos_preenchidos: string[];
  campos_faltando: string[];
  status: string;
}

const CAMPOS_OBRIGATORIOS = ['nome', 'telefone', 'endereco', 'servico', 'data'];
const TTL_MINUTOS = 30;

// Buscar sessão ativa do funcionário
export async function buscarSessaoAtiva(sb: any, telefone: string): Promise<Sessao | null> {
  const { data } = await sb
    .from("agendamento_sessoes")
    .select("*")
    .eq("funcionario_telefone", telefone)
    .eq("status", "coletando")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (!data) return null;
  
  // Verificar TTL
  const criado = new Date(data.created_at).getTime();
  const agora = Date.now();
  if (agora - criado > TTL_MINUTOS * 60 * 1000) {
    await sb.from("agendamento_sessoes").update({ status: "expirado", updated_at: new Date().toISOString() }).eq("id", data.id);
    return null;
  }
  
  return data as Sessao;
}

// Buscar sessão aguardando confirmação
export async function buscarSessaoConfirmacao(sb: any, telefone: string): Promise<Sessao | null> {
  const { data } = await sb
    .from("agendamento_sessoes")
    .select("*")
    .eq("funcionario_telefone", telefone)
    .eq("status", "aguardando_confirmacao")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (!data) return null;
  return data as Sessao;
}

// Criar nova sessão
export async function criarSessao(sb: any, telefone: string, funcId: string, tenantId: string | null): Promise<Sessao> {
  // Fechar sessões anteriores
  await sb.from("agendamento_sessoes")
    .update({ status: "cancelado", updated_at: new Date().toISOString() })
    .eq("funcionario_telefone", telefone)
    .in("status", ["coletando", "aguardando_confirmacao"]);
  
  const { data } = await sb.from("agendamento_sessoes").insert({
    funcionario_telefone: telefone,
    funcionario_bot_id: funcId,
    tenant_id: tenantId,
    dados_parciais: {},
    campos_preenchidos: [],
    campos_faltando: [...CAMPOS_OBRIGATORIOS],
    status: "coletando",
  }).select().single();
  
  return data as Sessao;
}

// Cancelar sessão
export async function cancelarSessao(sb: any, sessaoId: string): Promise<void> {
  await sb.from("agendamento_sessoes")
    .update({ status: "cancelado", updated_at: new Date().toISOString() })
    .eq("id", sessaoId);
}

// Extrair campos parciais de uma mensagem usando IA
export async function extrairCamposParciais(msg: string, apiKey: string): Promise<DadosParciais> {
  const ano = new Date().getFullYear();
  const prompt = `Analise esta mensagem e extraia APENAS os dados presentes. NÃO invente dados que não estão na mensagem.
Responda SOMENTE com JSON válido contendo apenas os campos encontrados:
{
  "nome_cliente": "nome completo se presente",
  "telefone": "número com DDD se presente (formato: 5531...)",
  "endereco": "endereço se presente",
  "bairro": "bairro se presente ou extraído do endereço",
  "cidade": "cidade se presente (BH/Beagá = Belo Horizonte)",
  "cep": "CEP se presente",
  "servico": "tipo de serviço (limpeza sofá, impermeabilização, etc) se presente",
  "data_agendamento": "data no formato YYYY-MM-DD se presente (ano padrão: ${ano})",
  "periodo": "Manhã ou Tarde se mencionado",
  "valor": número se mencionado,
  "is_locacao": true se mencionar aluguel/locação/extratora/diária
}
IMPORTANTE: Retorne {} se nenhum dado relevante for encontrado. Não inclua campos com valor null.

MENSAGEM:
${msg}`;

  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash-lite", messages: [{ role: "user", content: prompt }], stream: false }),
    });
    if (r.ok) {
      const d = await r.json();
      const c = d.choices?.[0]?.message?.content || "";
      const jm = c.match(/\{[\s\S]*\}/);
      if (jm) {
        const parsed = JSON.parse(jm[0]);
        // Limpar campos null/undefined/vazios
        const clean: DadosParciais = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (v !== null && v !== undefined && v !== "") {
            (clean as any)[k] = v;
          }
        }
        // Normalizar telefone
        if (clean.telefone) {
          let tel = clean.telefone.replace(/\D/g, '');
          if (!tel.startsWith('55')) tel = '55' + tel;
          clean.telefone = tel;
        }
        // Normalizar cidade
        if (clean.cidade && /bh|beag[áa]/i.test(clean.cidade)) {
          clean.cidade = "Belo Horizonte";
        }
        return clean;
      }
    }
  } catch (e) {
    console.error("[extrairCamposParciais] Erro:", e);
  }
  
  // Fallback: regex simples
  return extrairCamposRegex(msg);
}

// Fallback regex para extrair campos
function extrairCamposRegex(msg: string): DadosParciais {
  const result: DadosParciais = {};
  
  // Telefone
  const telMatch = msg.match(/(?:(?:\+?55\s?)?(?:\(?0?\d{2}\)?\s?))?\d{4,5}[-.\s]?\d{4}/);
  if (telMatch) {
    let tel = telMatch[0].replace(/\D/g, '');
    if (!tel.startsWith('55') && tel.length >= 10) tel = '55' + tel;
    if (tel.length >= 12) result.telefone = tel;
  }
  
  // Data
  const dataMatch = msg.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (dataMatch) {
    const dia = dataMatch[1].padStart(2, '0');
    const mes = dataMatch[2].padStart(2, '0');
    let ano = dataMatch[3] || new Date().getFullYear().toString();
    if (ano.length === 2) ano = '20' + ano;
    result.data_agendamento = `${ano}-${mes}-${dia}`;
  }
  
  // Amanhã / hoje
  const lower = msg.toLowerCase();
  if (/\bamanh[ãa]\b/i.test(lower)) {
    const d = new Date(); d.setDate(d.getDate() + 1);
    result.data_agendamento = d.toISOString().split('T')[0];
  }
  if (/\bhoje\b/i.test(lower)) {
    result.data_agendamento = new Date().toISOString().split('T')[0];
  }
  
  // Período
  if (/\bmanh[ãa]\b/i.test(lower)) result.periodo = "Manhã";
  if (/\btarde\b/i.test(lower)) result.periodo = "Tarde";
  
  return result;
}

// Fazer merge dos dados novos com os existentes
export function mergeDadosParciais(existente: DadosParciais, novos: DadosParciais): { dados: DadosParciais; preenchidos: string[]; faltando: string[] } {
  const merged = { ...existente };
  
  // Merge: novos dados sobrescrevem
  for (const [k, v] of Object.entries(novos)) {
    if (v !== null && v !== undefined && v !== "") {
      (merged as any)[k] = v;
    }
  }
  
  // Defaults
  if (!merged.bairro && merged.endereco) merged.bairro = "Não informado";
  if (!merged.cidade) merged.cidade = "Belo Horizonte";
  
  // Calcular campos preenchidos/faltando
  const preenchidos: string[] = [];
  const faltando: string[] = [];
  
  if (merged.nome_cliente) preenchidos.push('nome'); else faltando.push('nome');
  if (merged.telefone) preenchidos.push('telefone'); else faltando.push('telefone');
  if (merged.endereco) preenchidos.push('endereco'); else faltando.push('endereco');
  if (merged.servico) preenchidos.push('servico'); else faltando.push('servico');
  if (merged.data_agendamento) preenchidos.push('data'); else faltando.push('data');
  
  return { dados: merged, preenchidos, faltando };
}

// Atualizar sessão com novos dados
export async function atualizarSessao(sb: any, sessaoId: string, dados: DadosParciais, preenchidos: string[], faltando: string[]): Promise<void> {
  const status = faltando.length === 0 ? "aguardando_confirmacao" : "coletando";
  await sb.from("agendamento_sessoes").update({
    dados_parciais: dados,
    campos_preenchidos: preenchidos,
    campos_faltando: faltando,
    status,
    updated_at: new Date().toISOString(),
  }).eq("id", sessaoId);
}

// Formatar mensagem de progresso
export function formatarProgresso(dados: DadosParciais, preenchidos: string[], faltando: string[]): string {
  const linhas: string[] = [];
  
  if (dados.nome_cliente) linhas.push(`✅ *Nome:* ${dados.nome_cliente}`);
  if (dados.telefone) linhas.push(`✅ *Telefone:* ${dados.telefone}`);
  if (dados.endereco) {
    let end = dados.endereco;
    if (dados.bairro && dados.bairro !== "Não informado") end += `, ${dados.bairro}`;
    if (dados.cidade) end += ` - ${dados.cidade}`;
    linhas.push(`✅ *Endereço:* ${end}`);
  }
  if (dados.servico) linhas.push(`✅ *Serviço:* ${dados.servico}`);
  if (dados.data_agendamento) {
    let dataStr = formatarDataBR(dados.data_agendamento);
    if (dados.periodo) dataStr += ` - ${dados.periodo}`;
    linhas.push(`✅ *Data:* ${dataStr}`);
  }
  if (dados.valor) linhas.push(`✅ *Valor:* R$ ${dados.valor.toFixed(2).replace('.', ',')}`);
  
  const labelMap: Record<string, string> = { nome: 'nome', telefone: 'telefone', endereco: 'endereço', servico: 'serviço', data: 'data' };
  
  if (faltando.length > 0) {
    linhas.push(`\n⏳ *Faltam:* ${faltando.map(f => labelMap[f] || f).join(', ')}`);
  }
  
  return linhas.join('\n');
}

// Formatar resumo completo para confirmação
export function formatarResumoSessao(dados: DadosParciais): string {
  let end = dados.endereco || '';
  if (dados.bairro && dados.bairro !== "Não informado") end += `, ${dados.bairro}`;
  if (dados.cidade) end += ` - ${dados.cidade}`;
  
  let dataStr = dados.data_agendamento ? formatarDataBR(dados.data_agendamento) : '';
  if (dados.periodo) dataStr += ` - ${dados.periodo}`;
  
  const valorStr = dados.valor ? `R$ ${dados.valor.toFixed(2).replace('.', ',')}` : 'A definir';
  
  return `📋 *RESUMO DO AGENDAMENTO*\n\n👤 *Nome:* ${dados.nome_cliente}\n📱 *Telefone:* ${dados.telefone}\n📍 *Endereço:* ${end}\n🛋️ *Serviço:* ${dados.servico}\n📅 *Data:* ${dataStr}\n💰 *Valor:* ${valorStr}\n\n━━━━━━━━━━━━━━━━━━━━━━\nResponda *SIM* para confirmar\nResponda *NÃO* para cancelar\nOu envie mais dados para corrigir`;
}

// Converter dados parciais para DadosAgendamentoExtraidos
export function sessaoParaDadosAgendamento(dados: DadosParciais): DadosAgendamentoExtraidos {
  return {
    nome_cliente: dados.nome_cliente || '',
    telefone: dados.telefone || '',
    endereco: dados.endereco || '',
    bairro: dados.bairro || 'Não informado',
    cidade: dados.cidade || 'Belo Horizonte',
    cep: dados.cep,
    data_agendamento: dados.data_agendamento || '',
    periodo: dados.periodo,
    itens: [{
      name: dados.servico || 'Serviço de limpeza',
      details: dados.servico || 'Conforme agendamento',
      price: dados.valor || 0,
      quantity: 1,
    }],
    valor_total: dados.valor || 0,
    is_locacao: dados.is_locacao,
  };
}
