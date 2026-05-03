// Helpers para WhatsApp Bot - Interfaces e formatadores
import { SITE_DOMAIN, PARTNER_PORTAL_URL, ADMIN_URL, getPartnerLink, getAdminAgendamentoLink } from "./siteConfig.ts";

export interface FuncionarioBot { id: string; nome: string; telefone_whatsapp: string; ativo: boolean; tenant_id?: string; }
export interface TecnicoBot { id: string; nome: string; telefone: string; tenant_id?: string | null; }
export interface ParceiroBot { id: string; nome: string; codigo: string; telefone: string; saldo_disponivel: number; total_ganhos: number; }
export interface DadosAgendamentoExtraidos { nome_cliente: string; telefone: string; endereco: string; bairro: string; cidade: string; cep?: string; data_agendamento: string; periodo?: string; itens: { name: string; details: string; price: number; quantity: number }[]; valor_total: number; observacoes?: string; is_locacao?: boolean; }
export interface DadosFinanceiros { tipo: 'despesa' | 'receita'; valor: number; descricao: string; categoria: string; data: string; forma_pagamento?: string; observacoes?: string; confianca: number; }
export interface AvaliacaoConfig { google_reviews_url: string; facebook_reviews_url: string; nota_minima_review: number; mensagem_pedido_nota: string; mensagem_nota_alta: string; mensagem_nota_baixa: string; }

const CAT_MAP: Record<string, string> = { 'aluguel': 'fixas', 'conta': 'fixas', 'luz': 'fixas', 'energia': 'fixas', 'água': 'fixas', 'internet': 'fixas', 'telefone': 'fixas', 'condomínio': 'fixas', 'combustível': 'combustivel', 'combustivel': 'combustivel', 'gasolina': 'combustivel', 'diesel': 'combustivel', 'etanol': 'combustivel', 'alcool': 'combustivel', 'álcool': 'combustivel', 'gnv': 'combustivel', 'abastec': 'combustivel', 'posto': 'combustivel', 'frete': 'combustivel', 'transporte': 'combustivel', 'uber': 'combustivel', 'produto': 'produtos_insumos', 'insumo': 'produtos_insumos', 'material': 'produtos_insumos', 'químico': 'produtos_insumos', 'limpeza': 'produtos_insumos', 'estoque': 'produtos_insumos', 'máquina': 'equipamentos', 'maquina': 'equipamentos', 'equipamento': 'equipamentos', 'manutenção': 'equipamentos', 'manutencao': 'equipamentos', 'reparo': 'equipamentos', 'conserto': 'equipamentos', 'peça': 'equipamentos', 'salário': 'salarios', 'salario': 'salarios', 'comissão': 'salarios', 'comissao': 'salarios', 'pagamento': 'salarios', 'funcionário': 'salarios', 'funcionario': 'salarios', 'marketing': 'marketing', 'publicidade': 'marketing', 'propaganda': 'marketing', 'anúncio': 'marketing', 'anuncio': 'marketing', 'facebook': 'marketing', 'instagram': 'marketing', 'google': 'marketing', 'imposto': 'impostos', 'taxa': 'impostos', 'tributo': 'impostos', 'darf': 'impostos', 'das': 'impostos', 'inss': 'impostos', 'icms': 'impostos', 'iss': 'impostos' };

export function mapearCategoria(cat: string, desc?: string): string { 
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Primeiro verifica a descrição (mais precisa)
  if (desc) { const ld = norm(desc); for (const [t, c] of Object.entries(CAT_MAP)) { if (ld.includes(norm(t))) return c; } }
  // Depois verifica a categoria da IA
  const lc = norm(cat); for (const [t, c] of Object.entries(CAT_MAP)) { if (lc.includes(norm(t))) return c; }
  return 'outras';
}

export function formatarDataBR(d: string): string { try { const [a, m, dia] = d.split('-'); return `${dia}/${m}/${a}`; } catch { return d; } }

export function detectarNota(msg: string): number | null { const t = msg.trim().toLowerCase(); const ps = [/^(\d+)$/, /^nota\s*(\d+)$/i, /^(\d+)\s*\/\s*10$/, /^(\d+)\s*pontos?$/i, /^(\d+)\s*estrelas?$/i, /^dou\s*(\d+)$/i, /^(\d+)\s*de\s*10$/i]; for (const p of ps) { const m = t.match(p); if (m) { const n = parseInt(m[1], 10); if (n >= 0 && n <= 10) return n; } } return null; }

export function detectarComandoAgendar(msg: string): boolean { const t = msg.trim().toLowerCase(); return t.startsWith("@agendar") || t.startsWith("@ agendar"); }

export function conversaAguardandoNota(ctx: any): boolean { return ctx?.aguardando_nota_avaliacao === true; }
export function conversaAguardandoFeedback(ctx: any): boolean { return ctx?.aguardando_feedback_negativo === true; }

const CAT_LABELS: Record<string, string> = { 'fixas': 'Aluguel e Contas Fixas', 'combustivel': 'Combustível e Frete', 'produtos_insumos': 'Produtos e Insumos', 'equipamentos': 'Equipamentos e Manutenção', 'salarios': 'Salários e Comissões', 'marketing': 'Marketing e Publicidade', 'impostos': 'Impostos e Taxas', 'outras': 'Outras' };

export function formatarConfirmacaoFinanceira(d: DadosFinanceiros, tipo: 'texto' | 'imagem' | 'audio'): string {
  const e = d.tipo === 'despesa' ? '💸' : '💰'; 
  const l = d.tipo.toUpperCase(); 
  const tm = tipo === 'imagem' ? '📸 Nota fiscal' : tipo === 'audio' ? '🎤 Áudio' : '📝 Texto';
  
  const mensagem = `${e} *${l} IDENTIFICADA*\n\n${tm}\n\n💰 *Valor:* R$ ${d.valor.toFixed(2).replace('.', ',')}\n📦 *Categoria:* ${CAT_LABELS[d.categoria] || d.categoria}\n📋 *Descrição:* ${d.descricao}\n📅 *Data:* ${formatarDataBR(d.data)}${d.forma_pagamento ? `\n💳 *Pagamento:* ${d.forma_pagamento.replace('_', ' ')}` : ''}${d.observacoes ? `\n📝 *Obs:* ${d.observacoes}` : ''}\n\n🎯 *Confiança:* ${d.confianca}%\n\n━━━━━━━━━━━━━━━━━━━━━━\nResponda *SIM* para confirmar\nResponda *NÃO* para cancelar`;
  
  // Alerta de baixa confiança para o usuário revisar os dados
  if (d.confianca < 30) {
    return `⚠️ *ATENÇÃO - BAIXA CONFIANÇA*\n\n${mensagem}\n\n⚡ *Verifique os dados antes de confirmar!*`;
  }
  
  return mensagem;
}

export function formatarMensagemAjudaTecnico(): string { 
  return `🔧 *Comandos Técnicos:*

📋 *Agenda:*
• @agenda - Serviços de hoje
• @semana - Próximos 7 dias
• @proximo - Próximo serviço
• @rota - Endereços do dia

✅ *Execução:*
• @concluir [código] - Finalizar serviço
• @mapa [código] - Abrir no Maps
• @historico - Últimos concluídos

📞 @ajuda - Mostra isto`; 
}

export function formatarMensagemAjudaParceiro(): string { 
  return `🤝 *Comandos Parceiros:*

💰 *Financeiro:*
• @saldo - Ver saldo disponível
• @conversoes - Últimas vendas
• @sacar [valor] - Solicitar saque
• @historico - Saques anteriores
• @ranking - Sua posição

📈 *Marketing:*
• @link - Seu link de indicação
• @qrcode - Seu QR Code
• @materiais - Material promocional

📞 @ajuda - Mostra isto`; 
}

export function formatarMensagemAjuda(): string { 
  return `👋 *Comandos Atendentes:*

📅 *Agenda:*
• @hoje - Serviços de hoje
• @semana - Próximos 7 dias
• @pendentes - Aguardando confirmação
• @pagos - Pagamentos recebidos

📋 *Gestão:*
• @agendar - Iniciar agendamento progressivo
• @agendar + dados - Criar agendamento direto
• @pronto - Verificar dados da sessão
• @cancelar - Cancelar sessão ativa
• @buscar [nome/tel] - Buscar cliente
• @status [código] - Consultar serviço
• @resumo - Dashboard do dia

💰 *Financeiro:*
• @despesas - Gastos de hoje
• Envie texto/foto/áudio para registrar

✅ sim | ❌ não/cancelar | ✏️ editar
📞 @ajuda - Mostra isto`; 
}

export function formatarAgendaTecnico(s: any[]): string {
  if (s.length === 0) return `📋 *Sua Agenda de Hoje*\n\nNenhum serviço agendado! 🎉`;
  const sf = s.map((x, i) => { const it = Array.isArray(x.itens_carrinho) ? x.itens_carrinho.map((y: any) => y.name || y.nome).join(", ") : "Serviços"; return `*${i + 1}. ${x.order_code}*\n⏰ ${x.horario || "A definir"}\n👤 ${x.nome_cliente}\n📍 ${x.endereco}, ${x.bairro}\n💰 R$ ${x.valor_total?.toFixed(2).replace('.', ',')}`; }).join("\n\n");
  return `📋 *Agenda de Hoje* (${s.length})\n\n${sf}\n\n━━━━━━━━━━━━━━━━━━━━━━\nUse *@concluir [código]* para finalizar`;
}

export function formatarProximoServico(s: any): string {
  if (!s) return `🔜 *Próximo Serviço*\n\nNenhum pendente! 🎉`;
  const it = Array.isArray(s.itens_carrinho) ? s.itens_carrinho.map((i: any) => `• ${i.name || i.nome}`).join("\n") : "• Serviços";
  return `🔜 *Próximo Serviço*\n\n📋 *Código:* ${s.order_code}\n⏰ *Horário:* ${s.horario || "A definir"}\n👤 *Cliente:* ${s.nome_cliente}\n📱 *Tel:* ${s.telefone}\n📍 ${s.endereco}, ${s.bairro} - ${s.cidade}\n\n🧹 *Serviços:*\n${it}\n\n💰 *Valor:* R$ ${s.valor_total?.toFixed(2).replace('.', ',')}`;
}

export function formatarSaldoParceiro(p: ParceiroBot): string { return `💰 *Seu Saldo*\n\n👤 ${p.nome}\n🏷️ Código: ${p.codigo}\n\n💵 *Disponível:* R$ ${p.saldo_disponivel.toFixed(2).replace('.', ',')}\n📈 *Total Ganhos:* R$ ${p.total_ganhos.toFixed(2).replace('.', ',')}`; }

export function formatarLinkParceiro(p: ParceiroBot): string { return `🔗 *Seu Link de Indicação*\n\n📲 ${getPartnerLink(p.codigo)}\n🏷️ Código: ${p.codigo}\n\n💡 Seus clientes ganham *10% de desconto* e você *10% de comissão*!`; }

export function formatarConversoesParceiro(c: any[], p: ParceiroBot): string {
  if (c.length === 0) return `📊 *Suas Conversões*\n\nNenhuma ainda. Compartilhe seu link!\n🔗 ${getPartnerLink(p.codigo)}`;
  const cf = c.slice(0, 5).map((x, i) => { const d = new Date(x.created_at).toLocaleDateString('pt-BR'); const ic = x.status === 'aprovada' ? '✅' : x.status === 'pendente' ? '⏳' : '❌'; return `${i + 1}. ${ic} R$ ${x.valor_comissao?.toFixed(2).replace('.', ',')} - ${d}`; }).join("\n");
  return `📊 *Últimas Conversões*\n\n${cf}\n\n💰 *Saldo:* R$ ${p.saldo_disponivel.toFixed(2).replace('.', ',')}`;
}

export function formatarQRCodeParceiro(p: ParceiroBot): string { return `📱 *Seu QR Code*\n\nBaixe em: ${PARTNER_PORTAL_URL}/materiais\n🏷️ Código: ${p.codigo}\n🔗 Link: ${getPartnerLink(p.codigo)}`; }

export function detectarLocacao(msg: string, itens?: { name: string }[]): boolean {
  const keywords = ['aluguel', 'alugar', 'locação', 'locacao', 'locar', 'extratora', 'diária', 'diaria', 'semanal', 'final de semana', 'fds', 'máquina', 'maquina'];
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const msgNorm = norm(msg);
  if (keywords.some(k => msgNorm.includes(norm(k)))) return true;
  if (itens) { for (const i of itens) { const n = norm(i.name); if (keywords.some(k => n.includes(norm(k)))) return true; } }
  return false;
}

export function formatarRespostaSucesso(d: DadosAgendamentoExtraidos, oc: string, nome: string): string {
  const isLoc = d.is_locacao || false;
  const titulo = isLoc ? '✅ *LOCAÇÃO CRIADA!*' : '✅ *AGENDAMENTO CRIADO!*';
  const iconeServicos = isLoc ? '🔧 *Itens de Locação:*' : '🧹 *Serviços:*';
  const it = d.itens.map(x => `• ${x.name} - R$ ${x.price.toFixed(2).replace('.', ',')}`).join('\n');
  return `${titulo}\n\n📋 *Código:* ${oc}\n👤 *Cliente:* ${d.nome_cliente}\n📱 *Tel:* ${d.telefone}\n📅 *Data:* ${formatarDataBR(d.data_agendamento)}${d.periodo ? ` - ${d.periodo}` : ''}\n🏠 *Local:* ${d.endereco}, ${d.bairro} - ${d.cidade}\n💰 *Valor:* R$ ${d.valor_total.toFixed(2).replace('.', ',')}\n\n${iconeServicos}\n${it}\n\n🔗 *Conferir:* ${getAdminAgendamentoLink(oc)}\n\n👔 Criado por: ${nome}`;
}

export function formatarRespostaErro(erros: string[]): string { return `❌ *DADOS INCOMPLETOS*\n\nFaltando:\n${erros.map(e => `• ${e}`).join('\n')}\n\n📋 Use *@ajuda* para ver o formato correto.`; }

// ========== FASE 1: NOVOS FORMATADORES ==========

function statusIcon(status: string): string {
  const icons: Record<string, string> = {
    'pendente': '⏳', 'confirmado': '✅', 'em_andamento': '🔧', 'concluido': '🏁', 'cancelado': '❌', 'pago': '💰'
  };
  return icons[status] || '📋';
}

// FUNCIONÁRIOS
export function formatarAgendamentosHoje(lista: any[]): string {
  if (lista.length === 0) return "📅 *Agenda de Hoje*\n\nNenhum serviço agendado! 🎉";
  
  const pendentes = lista.filter(a => a.status === 'pendente').length;
  const confirmados = lista.filter(a => a.status === 'confirmado').length;
  const concluidos = lista.filter(a => a.status === 'concluido').length;
  const total = lista.reduce((s, a) => s + (a.valor_total || 0), 0);
  
  const items = lista.map((a, i) => 
    `${i+1}. *${a.order_code}* - ${a.nome_cliente}\n   📍 ${a.bairro} | ⏰ ${a.horario || 'A definir'} | ${statusIcon(a.status)}`
  ).join("\n\n");
  
  return `📅 *Agenda de Hoje* (${lista.length} serviços)\n\n⏳ Pendentes: ${pendentes} | ✅ Confirmados: ${confirmados} | 🏁 Concluídos: ${concluidos}\n💰 Valor total: R$ ${total.toFixed(2).replace('.', ',')}\n\n━━━━━━━━━━━━━━━━━━━━━━\n${items}`;
}

export function formatarAgendamentosPendentes(lista: any[]): string {
  if (lista.length === 0) return "⏳ *Pendentes de Confirmação*\n\nNenhum serviço pendente! 🎉";
  
  const total = lista.reduce((s, a) => s + (a.valor_total || 0), 0);
  
  const items = lista.map((a, i) => {
    const data = formatarDataBR(a.data_agendamento);
    return `${i+1}. *${a.order_code}*\n   👤 ${a.nome_cliente} | 📱 ${a.telefone}\n   📅 ${data} | 📍 ${a.bairro}\n   💰 R$ ${(a.valor_total || 0).toFixed(2).replace('.', ',')}`;
  }).join("\n\n");
  
  return `⏳ *Pendentes de Confirmação* (${lista.length})\n\n💰 Valor total: R$ ${total.toFixed(2).replace('.', ',')}\n\n━━━━━━━━━━━━━━━━━━━━━━\n${items}\n\n📞 Entre em contato para confirmar!`;
}

export function formatarResumoFinanceiro(resumo: { hoje: { total: number; qtd: number; pendentes: number; confirmados: number; concluidos: number }; ontem: { total: number; qtd: number }; despesasHoje: number }): string {
  const variacaoValor = resumo.ontem.total > 0 ? ((resumo.hoje.total - resumo.ontem.total) / resumo.ontem.total * 100) : 0;
  const seta = variacaoValor >= 0 ? '📈' : '📉';
  const variacaoTxt = variacaoValor !== 0 ? ` (${seta} ${variacaoValor > 0 ? '+' : ''}${variacaoValor.toFixed(0)}%)` : '';
  
  const lucroHoje = resumo.hoje.total - resumo.despesasHoje;
  
  return `📊 *Dashboard do Dia*\n\n📅 *HOJE*\n• Serviços: ${resumo.hoje.qtd}${variacaoTxt}\n   ⏳ ${resumo.hoje.pendentes} pend. | ✅ ${resumo.hoje.confirmados} conf. | 🏁 ${resumo.hoje.concluidos} concl.\n• Receita: R$ ${resumo.hoje.total.toFixed(2).replace('.', ',')}\n• Despesas: R$ ${resumo.despesasHoje.toFixed(2).replace('.', ',')}\n• Lucro: R$ ${lucroHoje.toFixed(2).replace('.', ',')}\n\n📆 *ONTEM*\n• Serviços: ${resumo.ontem.qtd}\n• Receita: R$ ${resumo.ontem.total.toFixed(2).replace('.', ',')}`;
}

// TÉCNICOS
export function formatarAgendaSemana(lista: any[]): string {
  if (lista.length === 0) return "📅 *Agenda da Semana*\n\nNenhum serviço agendado nos próximos 7 dias! 🎉";
  
  const porDia: Record<string, any[]> = {};
  lista.forEach(a => {
    const dia = a.data_agendamento;
    if (!porDia[dia]) porDia[dia] = [];
    porDia[dia].push(a);
  });
  
  const diasFormatados = Object.entries(porDia).map(([dia, servicos]) => {
    const dataFormatada = formatarDataBR(dia);
    const servicosStr = servicos.map((s, i) => 
      `   ${i+1}. ${s.order_code} - ${s.nome_cliente} (${s.horario || 'A definir'}) ${statusIcon(s.status)}`
    ).join('\n');
    return `📆 *${dataFormatada}* (${servicos.length})\n${servicosStr}`;
  }).join('\n\n');
  
  const totalValor = lista.reduce((s, a) => s + (a.valor_total || 0), 0);
  
  return `📅 *Agenda da Semana* (${lista.length} serviços)\n💰 Total: R$ ${totalValor.toFixed(2).replace('.', ',')}\n\n━━━━━━━━━━━━━━━━━━━━━━\n${diasFormatados}`;
}

export function formatarRotaDia(lista: any[]): string {
  if (lista.length === 0) return "🗺️ *Rota do Dia*\n\nNenhum serviço agendado para hoje! 🎉";
  
  const items = lista.map((a, i) => {
    const endereco = `${a.endereco}, ${a.bairro} - ${a.cidade}`;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    return `*${i+1}. ${a.order_code}* (${a.horario || 'A definir'})\n👤 ${a.nome_cliente}\n📱 ${a.telefone}\n📍 ${endereco}\n🗺️ ${mapsLink}`;
  }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n');
  
  return `🗺️ *Rota do Dia* (${lista.length} paradas)\n\n${items}\n\n💡 Clique nos links para abrir no Google Maps`;
}

// PARCEIROS
export function formatarSolicitacaoSaque(sucesso: boolean, erro?: string, valor?: number): string {
  if (!sucesso) return `❌ *Erro no Saque*\n\n${erro}\n\n💡 Verifique seu saldo com @saldo`;
  return `✅ *Saque Solicitado!*\n\n💰 Valor: R$ ${(valor || 0).toFixed(2).replace('.', ',')}\n📋 Status: Aguardando processamento\n\n⏳ Prazo: até 3 dias úteis\n\n💡 Use @saldo para acompanhar`;
}

export function formatarRankingParceiro(ranking: { posicao: number; total: number; meusDados: { nome: string; ganhos: number; conversoes: number }; top3: { nome: string; ganhos: number }[] }): string {
  const medalhas = ['🥇', '🥈', '🥉'];
  const top3Str = ranking.top3.map((p, i) => 
    `${medalhas[i]} ${p.nome}: R$ ${p.ganhos.toFixed(2).replace('.', ',')}`
  ).join('\n');
  
  const minhaPos = ranking.posicao <= 3 ? medalhas[ranking.posicao - 1] : `#${ranking.posicao}`;
  
  return `🏆 *Ranking de Parceiros*\n\n*Top 3:*\n${top3Str}\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n*Sua Posição:* ${minhaPos} de ${ranking.total}\n💰 Total ganho: R$ ${ranking.meusDados.ganhos.toFixed(2).replace('.', ',')}\n🎯 Conversões: ${ranking.meusDados.conversoes}\n\n🚀 Continue indicando para subir no ranking!`;
}

// ========== FASE 2: NOVOS FORMATADORES ==========

// FUNCIONÁRIOS - @buscar
export function formatarResultadoBusca(lista: any[], termo: string): string {
  if (lista.length === 0) return `🔍 *Busca: "${termo}"*\n\nNenhum resultado encontrado.\n\n💡 Tente buscar por nome, telefone ou código.`;
  
  const items = lista.map((a, i) => {
    const data = formatarDataBR(a.data_agendamento);
    return `${i+1}. *${a.order_code}* - ${a.nome_cliente}\n   📱 ${a.telefone} | 📍 ${a.bairro || 'N/A'}\n   📅 ${data} | ${statusIcon(a.status)}\n   💰 R$ ${(a.valor_total || 0).toFixed(2).replace('.', ',')}`;
  }).join('\n\n');
  
  return `🔍 *Resultados para "${termo}"* (${lista.length} encontrados)\n\n${items}\n\n━━━━━━━━━━━━━━━━━━━━━━\nUse @status [código] para mais detalhes`;
}

// FUNCIONÁRIOS - @status
export function formatarStatusAgendamento(ag: any): string {
  if (!ag) return `❌ *Agendamento não encontrado*\n\nVerifique o código ou nome e tente novamente.`;
  
  const itens = Array.isArray(ag.itens_carrinho) 
    ? ag.itens_carrinho.map((i: any) => `• ${i.name || i.nome} - R$ ${(i.price || i.preco || 0).toFixed(2).replace('.', ',')}`).join('\n')
    : '• Serviços';
  
  const tecnico = ag.tecnico_nome ? `🔧 *Técnico:* ${ag.tecnico_nome}` : '🔧 *Técnico:* Não atribuído';
  
  return `📋 *AGENDAMENTO ${ag.order_code}*

👤 *Cliente:* ${ag.nome_cliente}
📱 *Telefone:* ${ag.telefone}
📍 *Endereço:* ${ag.endereco}
   ${ag.bairro || ''} - ${ag.cidade || ''}${ag.cep ? `\n   CEP: ${ag.cep}` : ''}

📅 *Data:* ${formatarDataBR(ag.data_agendamento)}
⏰ *Horário:* ${ag.horario || 'A definir'}
${tecnico}

🧹 *Serviços:*
${itens}

💰 *Valor Total:* R$ ${(ag.valor_total || 0).toFixed(2).replace('.', ',')}${ag.valor_desconto ? `\n🏷️ *Desconto:* R$ ${ag.valor_desconto.toFixed(2).replace('.', ',')}` : ''}${ag.cupom_codigo ? ` (${ag.cupom_codigo})` : ''}
${statusIcon(ag.status)} *Status:* ${ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}
📝 *Origem:* ${ag.origem || 'site'}`;
}

// FUNCIONÁRIOS - @semana (visão geral)
export function formatarAgendamentosSemanaFuncionario(lista: any[]): string {
  if (lista.length === 0) return "📅 *Próximos 7 Dias*\n\nNenhum serviço agendado! 🎉";
  
  const porDia: Record<string, any[]> = {};
  lista.forEach(a => {
    const dia = a.data_agendamento;
    if (!porDia[dia]) porDia[dia] = [];
    porDia[dia].push(a);
  });
  
  const diasFormatados = Object.entries(porDia).map(([dia, servicos]) => {
    const dataFormatada = formatarDataBR(dia);
    const valorDia = servicos.reduce((s, a) => s + (a.valor_total || 0), 0);
    const servicosStr = servicos.map((s, i) => 
      `   ${i+1}. ${s.order_code} - ${s.nome_cliente} ${statusIcon(s.status)}`
    ).join('\n');
    return `📆 *${dataFormatada}* (${servicos.length}) - R$ ${valorDia.toFixed(2).replace('.', ',')}\n${servicosStr}`;
  }).join('\n\n');
  
  const totalValor = lista.reduce((s, a) => s + (a.valor_total || 0), 0);
  const pendentes = lista.filter(a => a.status === 'pendente').length;
  const confirmados = lista.filter(a => a.status === 'confirmado').length;
  
  return `📅 *Próximos 7 Dias* (${lista.length} serviços)\n💰 Total: R$ ${totalValor.toFixed(2).replace('.', ',')}\n⏳ ${pendentes} pend. | ✅ ${confirmados} conf.\n\n━━━━━━━━━━━━━━━━━━━━━━\n${diasFormatados}`;
}

// FUNCIONÁRIOS - @pagos
export function formatarPagamentosRecentes(dados: { lista: any[]; total: number }): string {
  if (dados.lista.length === 0) return "💰 *Pagamentos Recebidos Hoje*\n\nNenhum pagamento registrado! 📭";
  
  const items = dados.lista.map((p, i) => {
    const hora = p.data_pagamento ? new Date(p.data_pagamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const forma = p.forma_pagamento ? (p.forma_pagamento === 'pix' ? '💳 PIX' : p.forma_pagamento === 'dinheiro' ? '💵 Dinheiro' : `💳 ${p.forma_pagamento}`) : '💳';
    const ag = p.agendamentos;
    return `${i+1}. ${ag?.order_code || 'N/A'} - ${ag?.nome_cliente || 'Cliente'}\n   ${forma} | R$ ${(p.valor_pago || 0).toFixed(2).replace('.', ',')} | ${hora}`;
  }).join('\n\n');
  
  return `💰 *Pagamentos Recebidos Hoje* (${dados.lista.length})\n\n${items}\n\n━━━━━━━━━━━━━━━━━━━━━━\n💵 *Total:* R$ ${dados.total.toFixed(2).replace('.', ',')}`;
}

// FUNCIONÁRIOS - @despesas
export function formatarDespesasHojeFuncionario(dados: { lista: any[]; total: number }): string {
  if (dados.lista.length === 0) return "💸 *Despesas de Hoje*\n\nNenhuma despesa registrada! 🎉";
  
  const CAT_LABELS: Record<string, string> = { 'fixas': 'Aluguel e Fixas', 'combustivel': 'Combustível', 'produtos_insumos': 'Produtos', 'equipamentos': 'Equipamentos', 'salarios': 'Salários', 'marketing': 'Marketing', 'impostos': 'Impostos', 'outras': 'Outras' };
  
  const items = dados.lista.map((d, i) => {
    const forma = d.forma_pagamento ? (d.forma_pagamento === 'pix' ? '💳 PIX' : d.forma_pagamento === 'dinheiro' ? '💵 Dinheiro' : `💳 ${d.forma_pagamento}`) : '';
    return `${i+1}. ${d.descricao} - R$ ${(d.valor || 0).toFixed(2).replace('.', ',')}\n   🏷️ ${CAT_LABELS[d.categoria] || d.categoria}${forma ? ` | ${forma}` : ''}`;
  }).join('\n\n');
  
  return `💸 *Despesas de Hoje* (${dados.lista.length})\n\n${items}\n\n━━━━━━━━━━━━━━━━━━━━━━\n💰 *Total:* R$ ${dados.total.toFixed(2).replace('.', ',')}`;
}

// TÉCNICOS - @historico
export function formatarHistoricoTecnico(lista: any[]): string {
  if (lista.length === 0) return "📜 *Histórico de Serviços*\n\nNenhum serviço concluído ainda! 🚀";
  
  const items = lista.map((a, i) => {
    const data = a.concluido_em ? new Date(a.concluido_em).toLocaleDateString('pt-BR') : formatarDataBR(a.data_agendamento);
    return `${i+1}. ${a.order_code} - ${a.nome_cliente}\n   📅 ${data} | 📍 ${a.bairro || 'N/A'}\n   💰 R$ ${(a.valor_total || 0).toFixed(2).replace('.', ',')}`;
  }).join('\n\n');
  
  const totalValor = lista.reduce((s, a) => s + (a.valor_total || 0), 0);
  
  return `📜 *Últimos Serviços Concluídos*\n\n${items}\n\n━━━━━━━━━━━━━━━━━━━━━━\n🏁 Total: ${lista.length} serviços | 💰 R$ ${totalValor.toFixed(2).replace('.', ',')}`;
}

// TÉCNICOS - @mapa
export function formatarLinkMapa(ag: any): string {
  if (!ag) return `❌ *Agendamento não encontrado*\n\nVerifique o código e tente novamente.`;
  
  const endereco = `${ag.endereco}, ${ag.bairro || ''} - ${ag.cidade || ''}${ag.cep ? ` ${ag.cep}` : ''}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
  
  return `🗺️ *Localização ${ag.order_code}*

👤 ${ag.nome_cliente}
📍 ${ag.endereco}
   ${ag.bairro || ''} - ${ag.cidade || ''}${ag.cep ? `\n   CEP: ${ag.cep}` : ''}

🔗 *Abrir no Google Maps:*
${mapsLink}`;
}

// PARCEIROS - @historico (saques)
export function formatarHistoricoSaques(lista: any[], saldoAtual: number): string {
  if (lista.length === 0) return `📜 *Histórico de Saques*\n\nNenhum saque realizado ainda.\n\n💰 *Saldo atual:* R$ ${saldoAtual.toFixed(2).replace('.', ',')}\n💡 Use @sacar [valor] para solicitar`;
  
  const statusIcons: Record<string, string> = { 'solicitado': '⏳', 'processando': '🔄', 'pago': '✅', 'rejeitado': '❌' };
  
  const items = lista.map((s, i) => {
    const data = new Date(s.created_at).toLocaleDateString('pt-BR');
    const icon = statusIcons[s.status] || '📋';
    return `${i+1}. ${icon} R$ ${(s.valor || 0).toFixed(2).replace('.', ',')} - ${data}\n   Status: ${s.status.charAt(0).toUpperCase() + s.status.slice(1)}`;
  }).join('\n\n');
  
  return `📜 *Histórico de Saques*\n\n${items}\n\n━━━━━━━━━━━━━━━━━━━━━━\n💰 *Saldo atual:* R$ ${saldoAtual.toFixed(2).replace('.', ',')}`;
}

// PARCEIROS - @materiais
export function formatarMateriaisParceiro(parceiro: { codigo: string; nome: string }): string {
  return `📦 *Materiais Promocionais*

Acesse seu portal de parceiro para baixar:
🔗 ${PARTNER_PORTAL_URL}/materiais

*Disponível:*
• 🖼️ Banners para redes sociais
• 📱 Stories prontos
• 🎴 QR Code personalizado
• 📄 Folhetos digitais

━━━━━━━━━━━━━━━━━━━━━━
🏷️ Seu código: *${parceiro.codigo}*
💡 Clientes ganham *10% OFF* usando seu link!`;
}
