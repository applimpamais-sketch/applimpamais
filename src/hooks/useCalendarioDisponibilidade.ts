import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import { fetchCalendarioDisponibilidade, type CalendarioDisponibilidade } from '@/services/api';
import { addDays, startOfToday } from 'date-fns';
import { useTenantContext } from '@/hooks/useTenantContext';
import { useAuth } from '@/hooks/useAuth';
import { usePublicTenantId } from '@/hooks/usePublicTenantId';
import type { Database } from '@/integrations/supabase/types';

export function useCalendarioDisponibilidade() {
  const { user } = useAuth();
  const { tenantId: tenantIdFromAuth, isLoading: isLoadingTenantContext } = useTenantContext();
  const { data: tenantIdFromDomain, isLoading: isLoadingPublicTenant } = usePublicTenantId({ enabled: !user });

  const effectiveTenantId = user ? tenantIdFromAuth : (tenantIdFromDomain ?? null);
  const isLoadingTenantResolution = user ? isLoadingTenantContext : isLoadingPublicTenant;
  const today = startOfToday();
  const endDate = addDays(today, 120);

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
    queryKey: ['calendario', today.toISOString(), endDate.toISOString(), effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [] as CalendarioDisponibilidade[];

      if (user) {
        return fetchCalendarioDisponibilidade(today, endDate, effectiveTenantId);
      }

      const { data, error } = await supabaseForPublicCatalog
        .from('calendario_disponibilidade')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .gte('data', today.toISOString().split('T')[0])
        .lte('data', endDate.toISOString().split('T')[0])
        .order('data');

      if (error) throw error;
      return data as CalendarioDisponibilidade[];
    },
    enabled: !!effectiveTenantId && !isLoadingTenantResolution,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
