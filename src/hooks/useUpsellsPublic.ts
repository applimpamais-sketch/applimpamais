import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';
import { usePublicTenantId } from '@/hooks/usePublicTenantId';

export interface UpsellPublic {
  id: string;
  nome: string;
  preco: number;
  descricao?: string;
}

export function useUpsellsPublic(aplicavelA?: 'servicos' | 'locacoes') {
  const { data: tenantId } = usePublicTenantId();

  const supabaseForPublicUpsells = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    return createClient<Database>(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          'x-tenant-id': tenantId || '',
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }, [tenantId]);

  return useQuery({
    queryKey: ['upsells-public', aplicavelA, tenantId],
    queryFn: async () => {
      if (!tenantId) {
        return [] as UpsellPublic[];
      }

      let query = supabaseForPublicUpsells
        .from('upsells')
        .select('id, nome, preco, descricao')
        .eq('ativo', true)
        .eq('tenant_id', tenantId);
      
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
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
