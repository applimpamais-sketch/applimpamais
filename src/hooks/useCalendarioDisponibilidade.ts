import { useQuery } from '@tanstack/react-query';
import { fetchCalendarioDisponibilidade } from '@/services/api';
import { addDays, startOfToday } from 'date-fns';
import { useTenantContext } from '@/hooks/useTenantContext';
import { RC_LIMPA_MAIS_TENANT_ID } from '@/constants/tenant';

export function useCalendarioDisponibilidade() {
  const { tenantId } = useTenantContext();
  // Para visitantes públicos (sem auth), buscar dados do tenant operacional RC Limpa Mais
  // Para usuários autenticados, usar o tenant do contexto
  const effectiveTenantId = tenantId || RC_LIMPA_MAIS_TENANT_ID;
  const today = startOfToday();
  const endDate = addDays(today, 120);
  
  return useQuery({
    queryKey: ['calendario', today.toISOString(), endDate.toISOString(), effectiveTenantId],
    queryFn: () => fetchCalendarioDisponibilidade(today, endDate, effectiveTenantId),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
