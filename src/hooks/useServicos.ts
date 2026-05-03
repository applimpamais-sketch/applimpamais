import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import { fetchServicos, type Servico } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContext } from '@/hooks/useTenantContext';
import { usePublicTenantId } from '@/hooks/usePublicTenantId';
import type { Database } from '@/integrations/supabase/types';

export function useServicos(categoria?: string) {
  const { user } = useAuth();
  const { tenantId: tenantIdFromAuth, isLoading: isLoadingTenantContext } = useTenantContext();
  const { data: tenantIdFromDomain, isLoading: isLoadingPublicTenant } = usePublicTenantId({ enabled: !user });

  const effectiveTenantId = user ? tenantIdFromAuth : (tenantIdFromDomain ?? null);
  const isLoadingTenantResolution = user ? isLoadingTenantContext : isLoadingPublicTenant;

  const supabaseForPublicCatalog = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    return createClient<Database>(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          'x-tenant-id': effectiveTenantId || '',
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }, [effectiveTenantId]);

  return useQuery({
    queryKey: ['servicos', categoria, effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [] as Servico[];

      if (user) {
        return fetchServicos(categoria, effectiveTenantId);
      }

      let query = supabaseForPublicCatalog
        .from('servicos')
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Servico[];
    },
    enabled: !!effectiveTenantId && !isLoadingTenantResolution,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
