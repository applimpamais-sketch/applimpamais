import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import { fetchAlugueis, type Aluguel } from '@/services/api';
import { useTenantContext } from '@/hooks/useTenantContext';
import { useAuth } from '@/hooks/useAuth';
import { usePublicTenantId } from '@/hooks/usePublicTenantId';
import type { Database } from '@/integrations/supabase/types';

export function useAlugueis() {
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
    queryKey: ['alugueis', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [] as Aluguel[];

      if (user) {
        return fetchAlugueis(effectiveTenantId);
      }

      const { data, error } = await supabaseForPublicCatalog
        .from('alugueis')
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;
      return data as Aluguel[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!effectiveTenantId && !isLoadingTenantResolution,
  });
}
