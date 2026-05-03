import { startOfDay, endOfDay, startOfYesterday, endOfYesterday, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import type { PeriodType } from '@/components/admin/PeriodFilter';

/**
 * Hook utilitário para converter PeriodType em range de datas
 * Centraliza a lógica de conversão de período para evitar duplicação
 */
export function usePeriodDateRange(
  period: PeriodType,
  customRange?: { start: Date; end: Date }
): { start: Date; end: Date } | null {
  const now = new Date();

  switch (period) {
    case 'hoje':
      return { start: startOfDay(now), end: endOfDay(now) };
    
    case 'ontem':
      return { start: startOfYesterday(), end: endOfYesterday() };
    
    case '7dias':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    
    case 'mes':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    
    case 'mes-passado':
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    
    case 'personalizado':
      return customRange || null;
    
    case 'maximo':
    default:
      return null; // Sem filtro de data
  }
}
