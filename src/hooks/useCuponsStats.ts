import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CuponsStats {
  totalAtivos: number;
  totalInativos: number;
  totalUsos: number;
  cupomMaisUsado: { codigo: string; usos: number } | null;
  descontoMedio: number;
  topCupons: Array<{ codigo: string; usos: number; desconto: number }>;
}

export function useCuponsStats() {
  return useQuery({
    queryKey: ['cupons-stats'],
    queryFn: async (): Promise<CuponsStats> => {
      const { data: cupons, error } = await supabase
        .from('cupons_desconto')
        .select('*')
        .order('uso_atual', { ascending: false });

      if (error) throw error;

      const totalAtivos = cupons?.filter(c => c.status === 'ativo').length || 0;
      const totalInativos = cupons?.filter(c => c.status === 'inativo').length || 0;
      const totalUsos = cupons?.reduce((sum, c) => sum + (c.uso_atual || 0), 0) || 0;
      
      const cupomMaisUsado = cupons && cupons.length > 0 && cupons[0].uso_atual > 0
        ? { codigo: cupons[0].codigo, usos: cupons[0].uso_atual }
        : null;

      const descontoMedio = cupons && cupons.length > 0
        ? cupons.reduce((sum, c) => sum + Number(c.desconto_percentual), 0) / cupons.length
        : 0;

      const topCupons = cupons
        ?.filter(c => c.uso_atual > 0)
        .slice(0, 5)
        .map(c => ({
          codigo: c.codigo,
          usos: c.uso_atual,
          desconto: Number(c.desconto_percentual)
        })) || [];

      return {
        totalAtivos,
        totalInativos,
        totalUsos,
        cupomMaisUsado,
        descontoMedio,
        topCupons
      };
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}
