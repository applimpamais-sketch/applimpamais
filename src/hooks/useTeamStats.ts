import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface TeamStats {
  total: number;
  admins: number;
  operadores: number;
  visualizadores: number;
}

export function useTeamStats() {
  const { tenantId } = useTenantContext();
  
  return useQuery({
    queryKey: ['team-stats', tenantId],
    queryFn: async (): Promise<TeamStats> => {
      if (!tenantId) {
        return { total: 0, admins: 0, operadores: 0, visualizadores: 0 };
      }
      
      // Primeiro buscar perfis do tenant
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', tenantId);
      
      if (profilesError) throw profilesError;
      
      if (!profiles || profiles.length === 0) {
        return { total: 0, admins: 0, operadores: 0, visualizadores: 0 };
      }
      
      const profileIds = profiles.map(p => p.id);
      
      // Buscar roles apenas dos usuários do tenant
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, user_id')
        .in('user_id', profileIds);

      if (error) throw error;

      const stats: TeamStats = {
        total: data.length,
        admins: data.filter(r => r.role === 'admin').length,
        operadores: data.filter(r => r.role === 'operador').length,
        visualizadores: data.filter(r => r.role === 'visualizador').length,
      };

      return stats;
    },
    enabled: !!tenantId,
  });
}
