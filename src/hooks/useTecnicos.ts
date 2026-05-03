import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface Tecnico {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string | null;
  avatar_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export function useTecnicos() {
  const { tenantId } = useTenantContext();
  
  return useQuery({
    queryKey: ['tecnicos', tenantId],
    queryFn: async (): Promise<Tecnico[]> => {
      if (!tenantId) return [];
      
      // Primeiro buscar user_ids com role tecnico QUE PERTENCEM AO TENANT
      // Buscar perfis do tenant primeiro
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', tenantId);
      
      if (profilesError) throw profilesError;
      
      if (!profiles || profiles.length === 0) return [];
      
      const profileIds = profiles.map(p => p.id);
      
      // Buscar user_ids com role tecnico dentro dos perfis do tenant
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'tecnico' as any)
        .in('user_id', profileIds);

      if (rolesError) throw rolesError;
      
      if (!userRoles || userRoles.length === 0) {
        return [];
      }

      const tecnicoIds = userRoles.map(r => r.user_id);

      // Buscar profiles dos técnicos
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome_completo, email, telefone, avatar_url, latitude, longitude, created_at')
        .in('id', tecnicoIds);

      if (error) throw error;
      return (data || []) as any as Tecnico[];
    },
    enabled: !!tenantId,
  });
}

export function useTecnicoStats(tecnicoId: string) {
  const { tenantId } = useTenantContext();
  
  return useQuery({
    queryKey: ['tecnico-stats', tecnicoId, tenantId],
    queryFn: async () => {
      if (!tenantId) return { servicosHoje: 0, servicosConcluidos: 0, valorTotal: 0, taxaConclusao: 0 };
      
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data: agendamentos, error } = await (supabase
        .from('agendamentos')
        .select('status, valor_total') as any)
        .eq('tecnico_id', tecnicoId)
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .gte('data_agendamento', hoje);

      if (error) throw error;

      const total = agendamentos?.length || 0;
      const concluidos = agendamentos?.filter((a: any) => a.status === 'concluido').length || 0;
      const valorTotal = agendamentos?.reduce((sum: number, a: any) => sum + Number(a.valor_total || 0), 0) || 0;

      return {
        servicosHoje: total,
        servicosConcluidos: concluidos,
        valorTotal,
        taxaConclusao: total > 0 ? Math.round((concluidos / total) * 100) : 0,
      };
    },
    enabled: !!tenantId && !!tecnicoId,
  });
}
