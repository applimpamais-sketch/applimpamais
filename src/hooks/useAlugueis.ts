import { useQuery } from '@tanstack/react-query';
import { fetchAlugueis } from '@/services/api';
import { useTenantContext } from '@/hooks/useTenantContext';

export function useAlugueis() {
  const { tenantId } = useTenantContext();
  
  return useQuery({
    queryKey: ['alugueis', tenantId],
    queryFn: () => fetchAlugueis(tenantId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!tenantId,
  });
}
