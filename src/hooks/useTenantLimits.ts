import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SaasPlano = 'starter' | 'professional' | 'enterprise';

export interface ResourceUsage {
  atual: number;
  limite: number | null;
}

export interface TenantUsage {
  plano: SaasPlano;
  tecnicos: ResourceUsage;
  agendamentos_mes: ResourceUsage;
  cupons: ResourceUsage;
  funcionarios_bot: ResourceUsage;
  membros_dashboard: ResourceUsage;
  storage_mb: { limite: number | null };
  features: {
    whatsapp_bot: boolean;
    relatorios_avancados: boolean;
    api_access: boolean;
    white_label?: boolean;
  };
}

export interface PlanLimits {
  id: string;
  plano: SaasPlano;
  max_tecnicos: number | null;
  max_agendamentos_mes: number | null;
  max_cupons: number | null;
  max_templates_whatsapp: number | null;
  max_funcionarios_bot: number | null;
  max_membros_dashboard: number | null;
  max_storage_mb: number | null;
  features: Record<string, boolean>;
}

export function useTenantLimits(tenantId?: string) {
  const { user } = useAuth();

  // Buscar tenant_id do usuário se não foi fornecido
  const { data: userTenantId } = useQuery({
    queryKey: ['user-tenant-id', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar tenant_id:', error);
        return null;
      }
      
      return data?.tenant_id ?? null;
    },
    enabled: !!user?.id && !tenantId,
  });

  const effectiveTenantId = tenantId || userTenantId;

  // Buscar uso e limites do tenant
  const { data: usage, isLoading, refetch } = useQuery({
    queryKey: ['tenant-usage', effectiveTenantId],
    queryFn: async (): Promise<TenantUsage | null> => {
      if (!effectiveTenantId) return null;
      
      const { data, error } = await supabase.rpc('get_tenant_usage', {
        p_tenant_id: effectiveTenantId
      });
      
      if (error) {
        console.error('Erro ao buscar uso do tenant:', error);
        return null;
      }
      
      return data as unknown as TenantUsage;
    },
    enabled: !!effectiveTenantId,
    staleTime: 1000 * 60, // 1 minuto
  });

  // Verificar se pode adicionar recurso
  const canAdd = (resource: keyof Omit<TenantUsage, 'plano' | 'features' | 'storage_mb'>): boolean => {
    if (!usage) return true;
    
    const resourceData = usage[resource];
    if (!resourceData || resourceData.limite === null) return true;
    
    return resourceData.atual < resourceData.limite;
  };

  // Verificar se está próximo do limite (>= 80%)
  const isNearLimit = (resource: keyof Omit<TenantUsage, 'plano' | 'features' | 'storage_mb'>): boolean => {
    if (!usage) return false;
    
    const resourceData = usage[resource];
    if (!resourceData || resourceData.limite === null) return false;
    
    return resourceData.atual >= resourceData.limite * 0.8;
  };

  // Verificar se está no limite (100%)
  const isAtLimit = (resource: keyof Omit<TenantUsage, 'plano' | 'features' | 'storage_mb'>): boolean => {
    if (!usage) return false;
    
    const resourceData = usage[resource];
    if (!resourceData || resourceData.limite === null) return false;
    
    return resourceData.atual >= resourceData.limite;
  };

  // Obter texto de uso (ex: "2/5")
  const getUsageText = (resource: keyof Omit<TenantUsage, 'plano' | 'features' | 'storage_mb'>): string => {
    if (!usage) return '-';
    
    const resourceData = usage[resource];
    if (!resourceData) return '-';
    
    if (resourceData.limite === null) {
      return `${resourceData.atual} / ∞`;
    }
    
    return `${resourceData.atual} / ${resourceData.limite}`;
  };

  // Verificar se feature está disponível
  const hasFeature = (feature: keyof TenantUsage['features']): boolean => {
    if (!usage?.features) return false;
    return !!usage.features[feature];
  };

  // Obter porcentagem de uso
  const getUsagePercent = (resource: keyof Omit<TenantUsage, 'plano' | 'features' | 'storage_mb'>): number => {
    if (!usage) return 0;
    
    const resourceData = usage[resource];
    if (!resourceData || resourceData.limite === null) return 0;
    
    return Math.min(100, Math.round((resourceData.atual / resourceData.limite) * 100));
  };

  return {
    tenantId: effectiveTenantId,
    usage,
    isLoading,
    refetch,
    canAdd,
    isNearLimit,
    isAtLimit,
    getUsageText,
    getUsagePercent,
    hasFeature,
    plano: usage?.plano || null,
  };
}

// Hook para buscar limites de todos os planos (para comparação)
export function usePlanLimits() {
  return useQuery({
    queryKey: ['plan-limits'],
    queryFn: async (): Promise<PlanLimits[]> => {
      const { data, error } = await supabase
        .from('saas_plan_limits')
        .select('*')
        .order('max_tecnicos', { ascending: true, nullsFirst: false });
      
      if (error) {
        console.error('Erro ao buscar limites de planos:', error);
        return [];
      }
      
      return data as PlanLimits[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
