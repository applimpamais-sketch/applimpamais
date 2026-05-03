export const CATEGORIAS_DESPESAS = [
  { value: 'produtos_insumos', label: 'Produtos e Insumos', color: 'hsl(220, 91%, 50%)' },
  { value: 'equipamentos', label: 'Equipamentos e Manutenção', color: 'hsl(151, 80%, 51%)' },
  { value: 'marketing', label: 'Marketing e Publicidade', color: 'hsl(280, 80%, 60%)' },
  { value: 'salarios', label: 'Salários e Comissões', color: 'hsl(38, 92%, 50%)' },
  { value: 'fixas', label: 'Aluguel e Contas Fixas', color: 'hsl(0, 84%, 60%)' },
  { value: 'combustivel', label: 'Combustível e Frete', color: 'hsl(200, 80%, 50%)' },
  { value: 'impostos', label: 'Impostos e Taxas', color: 'hsl(340, 80%, 55%)' },
  { value: 'outras', label: 'Outras Despesas', color: 'hsl(240, 5%, 65%)' },
] as const;

export const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'maquininha', label: 'Maquininha' },
  { value: 'link_pagamento', label: 'Link de Pagamento' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'outros', label: 'Outros' },
] as const;

export const STATUS_DESPESA = [
  { value: 'pendente', label: 'Pendente', color: 'hsl(38, 92%, 50%)' },
  { value: 'paga', label: 'Paga', color: 'hsl(151, 80%, 51%)' },
  { value: 'vencida', label: 'Vencida', color: 'hsl(0, 84%, 60%)' },
] as const;

export const STATUS_META = [
  { value: 'em_andamento', label: 'Em Andamento', color: 'hsl(220, 91%, 50%)' },
  { value: 'atingida', label: 'Atingida', color: 'hsl(151, 80%, 51%)' },
  { value: 'nao_atingida', label: 'Não Atingida', color: 'hsl(0, 84%, 60%)' },
] as const;

export const CATEGORIAS_RECEITA = [
  { value: 'servicos_limpeza', label: 'Serviços de Limpeza', color: 'hsl(220, 91%, 50%)' },
  { value: 'servicos_impermeabilizacao', label: 'Impermeabilização', color: 'hsl(151, 80%, 51%)' },
  { value: 'aluguel_equipamentos', label: 'Aluguel de Equipamentos', color: 'hsl(280, 80%, 60%)' },
  { value: 'venda_produtos', label: 'Venda de Produtos', color: 'hsl(38, 92%, 50%)' },
  { value: 'outros_servicos', label: 'Outros Serviços', color: 'hsl(200, 80%, 50%)' },
] as const;

export function getCategoriaInfo(categoria: string) {
  return CATEGORIAS_DESPESAS.find(c => c.value === categoria) || CATEGORIAS_DESPESAS[CATEGORIAS_DESPESAS.length - 1];
}

export function getStatusDespesaInfo(status: string) {
  return STATUS_DESPESA.find(s => s.value === status) || STATUS_DESPESA[0];
}

export function getStatusMetaInfo(status: string) {
  return STATUS_META.find(s => s.value === status) || STATUS_META[0];
}

export function getCategoriaReceitaInfo(categoria: string) {
  return CATEGORIAS_RECEITA.find(c => c.value === categoria) || CATEGORIAS_RECEITA[0];
}

export function calcularDiferencaDias(data1: Date | string, data2: Date | string): number {
  const d1 = new Date(data1);
  const d2 = new Date(data2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calcularProjecao(
  historico: Array<{ valor: number; data: string }>,
  diasFuturos: number = 30
): number {
  if (historico.length < 2) return 0;
  
  // Calcular média de crescimento diário
  const valores = historico.map(h => h.valor);
  const soma = valores.reduce((acc, val) => acc + val, 0);
  const media = soma / valores.length;
  
  // Projeção simples baseada na média
  return media * diasFuturos;
}

export function calcularPercentualCrescimento(atual: number, anterior: number): number {
  if (anterior === 0) return atual > 0 ? 100 : 0;
  return ((atual - anterior) / anterior) * 100;
}

export function formatPercentual(valor: number): string {
  const sinal = valor >= 0 ? '+' : '';
  return `${sinal}${valor.toFixed(1)}%`;
}

export function isDespesaVencida(dataDespesa: string, status: string): boolean {
  if (status === 'paga') return false;
  const hoje = new Date();
  const data = new Date(dataDespesa);
  return data < hoje;
}

export function calcularSaldoAtual(receitas: number, despesas: number): number {
  return receitas - despesas;
}

export function calcularMargemLucro(receita: number, despesas: number): number {
  if (receita === 0) return 0;
  return ((receita - despesas) / receita) * 100;
}

export function getCorPorPercentual(percentual: number): string {
  if (percentual >= 100) return 'hsl(151, 80%, 51%)'; // Verde
  if (percentual >= 70) return 'hsl(38, 92%, 50%)'; // Amarelo
  return 'hsl(0, 84%, 60%)'; // Vermelho
}

export const STATUS_PAGAMENTO = [
  { value: 'pago', label: 'Pago', color: 'hsl(151, 80%, 51%)' },
  { value: 'parcial', label: 'Parcial', color: 'hsl(38, 92%, 50%)' },
  { value: 'pendente', label: 'Pendente', color: 'hsl(240, 5%, 65%)' },
  { value: 'inadimplente', label: 'Inadimplente', color: 'hsl(0, 84%, 60%)' },
] as const;

export function calcularStatusPagamento(
  valorTotal: number,
  valorPago: number,
  dataAgendamento: string
): 'pago' | 'parcial' | 'pendente' | 'inadimplente' {
  if (valorPago >= valorTotal) return 'pago';
  if (valorPago > 0) return 'parcial';

  const hoje = new Date();
  const dataAgend = new Date(dataAgendamento);

  if (dataAgend < hoje) return 'inadimplente';
  return 'pendente';
}

export function getStatusPagamentoInfo(status: string) {
  return STATUS_PAGAMENTO.find(s => s.value === status) || STATUS_PAGAMENTO[2];
}
