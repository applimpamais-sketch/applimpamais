import { useQuery } from '@tanstack/react-query';
import { fetchServicos } from '@/services/api';

export function useServicos(categoria?: string) {
  return useQuery({
    queryKey: ['servicos', categoria],
    queryFn: () => fetchServicos(categoria),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
