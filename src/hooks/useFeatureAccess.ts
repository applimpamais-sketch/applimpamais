/**
 * Hook centralizado para verificação de features e limites.
 * Usa as RPCs do banco para decisões, não calcula localmente.
 * 
 * IMPORTANTE: Este é o hook oficial para governança de planos.
 * Todos os outros hooks (useTenantLimits, useTenantModules) devem usar este internamente.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from './useTenantContext';
import { toast } from '@/hooks/use-toast';

// Tipos de resposta das RPCs
export interface FeatureCheckResult {
  allowed: boolean;
  reason: 'PLAN_FEATURE' | 'FEATURE_FLAG' | 'UPGRADE_REQUIRED' | 'FEATURE_DISABLED' | 'TENANT_INACTIVE' | 'NO_TENANT' | 'TENANT_NOT_FOUND' | 'PLAN_NOT_FOUND';
  message: string;
  current_plan?: string;
  expires_at?: string;
}

export interface ResourceLimitResult {
  allowed: boolean;
  reason: 'OK' | 'UNLIMITED' | 'NEAR_LIMIT' | 'LIMIT_EXCEEDED' | 'NO_TENANT';
  message?: string;
  current: number;
  limit: number | null;
  warning?: boolean;
  upgrade_url?: string;
}

// Features disponíveis
export type FeatureKey = 
  | 'whatsapp_bot'
  | 'relatorios_avancados'
  | 'api_access'
  | 'white_label';

// Recursos com limite
export type ResourceKey = 
  | 'tecnicos'
  | 'agendamentos_mes'
  | 'cupons'
  | 'funcionarios_bot'
  | 'membros_dashboard'
  | 'storage_mb';

/**
 * Hook principal para verificar acesso a features.
 * Usa a RPC can_use_feature() do banco.
 */
export function useFeatureAccess(featureKey: FeatureKey) {
  const { tenant } = useTenantContext();
  const tenantId = tenant?.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['feature-access', featureKey, tenantId],
    queryFn: async (): Promise<FeatureCheckResult> => {
      if (!tenantId) {
        return {
          allowed: false,
          reason: 'NO_TENANT',
          message: 'Usuário não vinculado a empresa',
        };
      }

      const { data, error } = await supabase.rpc('can_use_feature', {
        p_feature_key: featureKey,
        p_tenant_id: tenantId,
      });

      if (error) {
        console.error('Erro ao verificar feature:', error);
        return {
          allowed: false,
          reason: 'PLAN_NOT_FOUND',
          message: 'Erro ao verificar acesso',
        };
      }

      // Cast through unknown for JSON response
      return data as unknown as FeatureCheckResult;
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60, // 1 minuto
  });

  const hasAccess = data?.allowed ?? false;
  const needsUpgrade = data?.reason === 'UPGRADE_REQUIRED';
  const isDisabled = data?.reason === 'FEATURE_DISABLED';

  return {
    hasAccess,
    needsUpgrade,
    isDisabled,
    isLoading,
    reason: data?.reason,
    message: data?.message,
    currentPlan: data?.current_plan,
    expiresAt: data?.expires_at,
    refetch,
  };
}

/**
 * Hook para verificar limite de recursos.
 * Usa a RPC check_resource_limit() do banco.
 */
export function useResourceLimit(resourceKey: ResourceKey, autoRefresh = true) {
  const { tenant } = useTenantContext();
  const tenantId = tenant?.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['resource-limit', resourceKey, tenantId],
    queryFn: async (): Promise<ResourceLimitResult> => {
      if (!tenantId) {
        return {
          allowed: false,
          reason: 'NO_TENANT',
          current: 0,
          limit: null,
        };
      }

      const { data, error } = await supabase.rpc('check_resource_limit', {
        p_resource_key: resourceKey,
        p_tenant_id: tenantId,
        p_increment: 0,
      });

      if (error) {
        console.error('Erro ao verificar limite:', error);
        return {
          allowed: true,
          reason: 'OK',
          current: 0,
          limit: null,
        };
      }

      // Cast through unknown for JSON response
      return data as unknown as ResourceLimitResult;
    },
    enabled: !!tenantId,
    staleTime: autoRefresh ? 1000 * 30 : 1000 * 60 * 5, // 30s ou 5min
  });

  const canAdd = data?.allowed ?? true;
  const isUnlimited = data?.reason === 'UNLIMITED';
  const isNearLimit = data?.reason === 'NEAR_LIMIT';
  const isAtLimit = data?.reason === 'LIMIT_EXCEEDED';
  const currentUsage = data?.current ?? 0;
  const maxLimit = data?.limit;

  // Texto formatado de uso
  const usageText = isUnlimited 
    ? `${currentUsage} / ∞` 
    : `${currentUsage} / ${maxLimit ?? '?'}`;

  // Porcentagem de uso
  const usagePercent = isUnlimited || !maxLimit 
    ? 0 
    : Math.min(100, Math.round((currentUsage / maxLimit) * 100));

  return {
    canAdd,
    isUnlimited,
    isNearLimit,
    isAtLimit,
    currentUsage,
    maxLimit,
    usageText,
    usagePercent,
    isLoading,
    refetch,
  };
}

/**
 * Hook para validar antes de uma ação.
 * Retorna funções para validar e mostrar erros.
 */
export function useFeatureValidation() {
  const queryClient = useQueryClient();

  /**
   * Valida se pode usar uma feature e mostra erro se não.
   */
  const validateFeature = async (featureKey: FeatureKey): Promise<boolean> => {
    const { data, error } = await supabase.rpc('can_use_feature', {
      p_feature_key: featureKey,
    });

    const result = data as unknown as FeatureCheckResult | null;

    if (error || !result?.allowed) {
      toast({
        title: 'Recurso não disponível',
        description: result?.message || 'Esta funcionalidade não está disponível no seu plano.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  /**
   * Valida se pode adicionar recurso (verifica limite).
   */
  const validateResourceLimit = async (
    resourceKey: ResourceKey, 
    increment = 1
  ): Promise<boolean> => {
    const { data, error } = await supabase.rpc('check_resource_limit', {
      p_resource_key: resourceKey,
      p_increment: increment,
    });

    if (error) {
      console.error('Erro ao validar limite:', error);
      return true; // Permitir em caso de erro
    }

    const result = data as unknown as ResourceLimitResult;

    if (!result.allowed) {
      toast({
        title: 'Limite atingido',
        description: result.message || `Você atingiu o limite de ${resourceKey}.`,
        variant: 'destructive',
      });
      return false;
    }

    // Aviso se está perto do limite
    if (result.warning) {
      toast({
        title: 'Atenção',
        description: result.message,
        variant: 'default',
      });
    }

    return true;
  };

  /**
   * Valida feature E limite combinados.
   */
  const validateFeatureAndLimit = async (
    featureKey: FeatureKey,
    resourceKey?: ResourceKey,
    increment = 1
  ): Promise<boolean> => {
    // Primeiro valida feature
    const featureOk = await validateFeature(featureKey);
    if (!featureOk) return false;

    // Se tem recurso para validar, valida limite
    if (resourceKey) {
      return await validateResourceLimit(resourceKey, increment);
    }

    return true;
  };

  /**
   * Atualiza métricas de uso do tenant.
   */
  const refreshUsageMetrics = async (): Promise<void> => {
    try {
      await supabase.rpc('refresh_tenant_usage_metrics', {
        p_tenant_id: null, // Usa tenant do usuário
      });
      
      // Invalida queries de limite
      queryClient.invalidateQueries({ queryKey: ['resource-limit'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-usage'] });
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    }
  };

  return {
    validateFeature,
    validateResourceLimit,
    validateFeatureAndLimit,
    refreshUsageMetrics,
  };
}

/**
 * Hook para registrar ações no log de atividades.
 */
export function useActivityLog() {
  const mutation = useMutation({
    mutationFn: async (params: {
      action: string;
      resourceType?: string;
      resourceId?: string;
      details?: Record<string, unknown>;
    }) => {
      // Convert details to JSON-compatible format
      const jsonDetails = params.details 
        ? JSON.parse(JSON.stringify(params.details)) 
        : null;

      const { data, error } = await supabase.rpc('log_tenant_action', {
        p_action: params.action,
        p_resource_type: params.resourceType || null,
        p_resource_id: params.resourceId || null,
        p_details: jsonDetails,
      });

      if (error) {
        console.error('Erro ao registrar ação:', error);
        throw error;
      }

      return data;
    },
  });

  const logAction = (
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, unknown>
  ) => {
    mutation.mutate({ action, resourceType, resourceId, details });
  };

  return { logAction, isLogging: mutation.isPending };
}
