import { useQuery } from '@tanstack/react-query';
import { fetchCalendarioDisponibilidade } from '@/services/api';
import { addDays, startOfToday } from 'date-fns';
import { useTenantContext } from '@/hooks/useTenantContext';

export function useCalendarioDisponibilidade() {
  const { tenantId } = useTenantContext();
  const effectiveTenantId = tenantId ?? null;
  const today = startOfToday();
  const endDate = addDays(today, 120);
  
  return useQuery({
    queryKey: ['calendario', today.toISOString(), endDate.toISOString(), effectiveTenantId],
    queryFn: () => fetchCalendarioDisponibilidade(today, endDate, effectiveTenantId),
    enabled: !!effectiveTenantId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
