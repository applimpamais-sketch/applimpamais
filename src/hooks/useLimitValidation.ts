/**
 * Hook de validação de limites - Agora usa RPCs centralizadas.
 * 
 * IMPORTANTE: Este hook é um wrapper sobre useFeatureAccess para 
 * manter compatibilidade com código existente.
 */

import { toast } from '@/hooks/use-toast';
import { useTenantLimits, TenantUsage } from './useTenantLimits';
import { supabase } from '@/integrations/supabase/client';

type ResourceKey = keyof Omit<TenantUsage, 'plano' | 'features' | 'storage_mb'>;

const RESOURCE_LABELS: Record<ResourceKey, string> = {
  tecnicos: 'técnicos',
  agendamentos_mes: 'agendamentos do mês',
  cupons: 'cupons',
  funcionarios_bot: 'funcionários do bot',
  membros_dashboard: 'membros da equipe',
};

const PLAN_UPGRADE_MESSAGE: Record<ResourceKey, string> = {
  tecnicos: 'Faça upgrade para o plano Professional ou Enterprise para adicionar mais técnicos.',
  agendamentos_mes: 'Faça upgrade para o plano Professional para agendamentos ilimitados.',
  cupons: 'Faça upgrade para o plano Professional para cupons ilimitados.',
  funcionarios_bot: 'O plano Starter não inclui Bot WhatsApp. Faça upgrade para Professional.',
  membros_dashboard: 'Faça upgrade para adicionar mais membros à sua equipe.',
};

interface ValidationResult {
  canProceed: boolean;
  showWarning: () => void;
  showError: () => void;
}

interface ResourceLimitResponse {
  allowed: boolean;
  reason: string;
  message?: string;
  current: number;
  limit: number | null;
  warning?: boolean;
}

interface FeatureCheckResponse {
  allowed: boolean;
  reason: string;
  message?: string;
}

/**
 * Hook para validar limites antes de ações de criação.
 * Agora usa RPCs centralizadas do banco para decisões.
 * 
 * Uso:
 * const { validateLimit } = useLimitValidation();
 * 
 * const handleAdd = async () => {
 *   const validation = await validateLimitAsync('funcionarios_bot');
 *   if (!validation.canProceed) {
 *     validation.showError();
 *     return;
 *   }
 *   // Continuar com a criação
 * };
 */
export function useLimitValidation() {
  const { canAdd, isNearLimit, isAtLimit, getUsageText, usage, plano } = useTenantLimits();

  // Versão síncrona (usa dados em cache - para compatibilidade)
  const validateLimit = (resource: ResourceKey): ValidationResult => {
    const canProceed = canAdd(resource);
    const label = RESOURCE_LABELS[resource];
    const upgradeMessage = PLAN_UPGRADE_MESSAGE[resource];

    return {
      canProceed,
      showWarning: () => {
        if (isNearLimit(resource) && !isAtLimit(resource)) {
          toast({
            title: 'Quase no limite',
            description: `Você está quase atingindo o limite de ${label} (${getUsageText(resource)}).`,
            variant: 'default',
          });
        }
      },
      showError: () => {
        toast({
          title: 'Limite atingido',
          description: `Você atingiu o limite de ${label} do seu plano. ${upgradeMessage}`,
          variant: 'destructive',
        });
      },
    };
  };

  // NOVA versão assíncrona (consulta RPC diretamente - recomendada)
  const validateLimitAsync = async (
    resource: ResourceKey,
    increment = 1
  ): Promise<ValidationResult> => {
    const label = RESOURCE_LABELS[resource];
    const upgradeMessage = PLAN_UPGRADE_MESSAGE[resource];

    try {
      const { data, error } = await supabase.rpc('check_resource_limit', {
        p_resource_key: resource,
        p_increment: increment,
      });

      if (error) {
        console.error('Erro ao validar limite:', error);
        // Em caso de erro, permite prosseguir
        return {
          canProceed: true,
          showWarning: () => {},
          showError: () => {},
        };
      }

      const result = data as unknown as ResourceLimitResponse;

      return {
        canProceed: result.allowed,
        showWarning: () => {
          if (result.warning) {
            toast({
              title: 'Quase no limite',
              description: result.message || `Próximo do limite de ${label}.`,
              variant: 'default',
            });
          }
        },
        showError: () => {
          if (!result.allowed) {
            toast({
              title: 'Limite atingido',
              description: result.message || `Você atingiu o limite de ${label}. ${upgradeMessage}`,
              variant: 'destructive',
            });
          }
        },
      };
    } catch (err) {
      console.error('Erro ao validar limite:', err);
      return {
        canProceed: true,
        showWarning: () => {},
        showError: () => {},
      };
    }
  };

  // Validação com feature check combinado (síncrona - compatibilidade)
  const validateFeatureAndLimit = (
    feature: keyof TenantUsage['features'],
    resource?: ResourceKey
  ): ValidationResult => {
    const hasFeature = usage?.features?.[feature] ?? false;

    if (!hasFeature) {
      return {
        canProceed: false,
        showWarning: () => {},
        showError: () => {
          toast({
            title: 'Recurso não disponível',
            description: `Esta funcionalidade não está disponível no seu plano atual (${plano}). Faça upgrade para acessar.`,
            variant: 'destructive',
          });
        },
      };
    }

    if (resource) {
      return validateLimit(resource);
    }

    return {
      canProceed: true,
      showWarning: () => {},
      showError: () => {},
    };
  };

  // NOVA versão assíncrona combinada (recomendada)
  const validateFeatureAndLimitAsync = async (
    feature: string,
    resource?: ResourceKey,
    increment = 1
  ): Promise<ValidationResult> => {
    try {
      // Primeiro valida feature
      const { data: featureData, error: featureError } = await supabase.rpc('can_use_feature', {
        p_feature_key: feature,
      });

      if (featureError) {
        console.error('Erro ao validar feature:', featureError);
        return { canProceed: true, showWarning: () => {}, showError: () => {} };
      }

      const featureResult = featureData as unknown as FeatureCheckResponse;

      if (!featureResult.allowed) {
        return {
          canProceed: false,
          showWarning: () => {},
          showError: () => {
            toast({
              title: 'Recurso não disponível',
              description: featureResult.message || 'Faça upgrade para acessar.',
              variant: 'destructive',
            });
          },
        };
      }

      // Se passou na feature, valida limite (se especificado)
      if (resource) {
        return await validateLimitAsync(resource, increment);
      }

      return { canProceed: true, showWarning: () => {}, showError: () => {} };
    } catch (err) {
      console.error('Erro na validação:', err);
      return { canProceed: true, showWarning: () => {}, showError: () => {} };
    }
  };

  return {
    // Versões síncronas (compatibilidade)
    validateLimit,
    validateFeatureAndLimit,
    // Versões assíncronas (recomendadas)
    validateLimitAsync,
    validateFeatureAndLimitAsync,
    // Helpers
    canAdd,
    isNearLimit,
    isAtLimit,
    plano,
  };
}
