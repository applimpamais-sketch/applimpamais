import { ReactNode } from 'react';
import { useTenantLimits, TenantUsage } from '@/hooks/useTenantLimits';
import { LockedFeatureCard } from './LockedFeatureCard';

type FeatureKey = keyof TenantUsage['features'];

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showLockedCard?: boolean;
}

/**
 * Componente que bloqueia acesso a features baseado no plano do tenant.
 * 
 * Uso:
 * <FeatureGate feature="whatsapp_bot">
 *   <WhatsAppDashboard />
 * </FeatureGate>
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showLockedCard = true 
}: FeatureGateProps) {
  const { hasFeature, isLoading, plano } = useTenantLimits();

  // Durante carregamento, mostrar children para evitar flash
  if (isLoading) {
    return <>{children}</>;
  }

  const hasAccess = hasFeature(feature);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showLockedCard) {
      return <LockedFeatureCard feature={feature} currentPlan={plano} />;
    }
    
    return null;
  }

  return <>{children}</>;
}

// Componente para verificar múltiplas features (OR)
interface MultiFeatureGateProps {
  features: FeatureKey[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean; // Se true, precisa de todas as features
}

export function MultiFeatureGate({ 
  features, 
  children, 
  fallback,
  requireAll = false 
}: MultiFeatureGateProps) {
  const { hasFeature, isLoading } = useTenantLimits();

  if (isLoading) {
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? features.every(f => hasFeature(f))
    : features.some(f => hasFeature(f));

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// Hook para uso programático
export function useFeatureAccess(feature: FeatureKey) {
  const { hasFeature, isLoading, plano } = useTenantLimits();
  
  return {
    hasAccess: hasFeature(feature),
    isLoading,
    currentPlan: plano,
  };
}
