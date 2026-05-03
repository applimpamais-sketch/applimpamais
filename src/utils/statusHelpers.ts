/**
 * Status que indicam que o serviço foi finalizado e/ou pago
 */
export const STATUS_FINALIZADO = ['concluido', 'pago'];

/**
 * Status que devem ser contabilizados na receita realizada
 * IMPORTANTE: 'reembolsado' NÃO está aqui - será subtraído
 */
export const STATUS_RECEITA_REALIZADA = ['concluido', 'pago'];

/**
 * Status que indicam agendamento ativo (ainda a fazer)
 */
export const STATUS_ATIVO = ['pendente', 'confirmado', 'em_andamento'];

/**
 * Status que representam reembolso (deve subtrair da receita)
 */
export const STATUS_REEMBOLSADO = ['reembolsado'];

/**
 * Status válidos para agendamentos
 */
export const STATUS_VALIDOS = [
  'pendente',
  'confirmado',
  'em_andamento',
  'concluido',
  'pago',
  'reembolsado',
  'cancelado'
];

/**
 * Verifica se um agendamento está finalizado
 */
export function isFinalized(status: string): boolean {
  return STATUS_FINALIZADO.includes(status);
}

/**
 * Verifica se um agendamento deve contar na receita realizada
 */
export function shouldCountRevenue(status: string): boolean {
  return STATUS_RECEITA_REALIZADA.includes(status);
}

/**
 * Verifica se um agendamento está ativo
 */
export function isActive(status: string): boolean {
  return STATUS_ATIVO.includes(status);
}

/**
 * Verifica se um agendamento foi reembolsado
 */
export function isRefunded(status: string): boolean {
  return STATUS_REEMBOLSADO.includes(status);
}
