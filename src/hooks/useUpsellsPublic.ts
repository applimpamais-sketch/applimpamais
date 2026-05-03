import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UpsellPublic {
  id: string;
  nome: string;
  preco: number;
  descricao?: string;
}

export function useUpsellsPublic(aplicavelA?: 'servicos' | 'locacoes') {
  return useQuery({
    queryKey: ['upsells-public', aplicavelA],
    queryFn: async () => {
      let query = supabase
        .from('upsells')
        .select('id, nome, preco, descricao')
        .eq('ativo', true);
      
      if (aplicavelA) {
        query = query.contains('aplicavel_a', [aplicavelA]);
      }
      
      const { data, error } = await query.order('preco', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar upsells:', error);
        throw error;
      }
      
      return data as UpsellPublic[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
