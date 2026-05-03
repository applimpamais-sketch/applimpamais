/**
 * Componente para proteger ações que têm limite de recursos.
 * Mostra UI apropriada quando limite é atingido.
 */

import { ReactNode } from 'react';
import { useResourceLimit, ResourceKey } from '@/hooks/useFeatureAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lock, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceLimitGuardProps {
  resource: ResourceKey;
  children: ReactNode;
  showUsageBar?: boolean;
  onUpgrade?: () => void;
}

const RESOURCE_LABELS: Record<ResourceKey, { singular: string; plural: string }> = {
  tecnicos: { singular: 'técnico', plural: 'técnicos' },
  agendamentos_mes: { singular: 'agendamento este mês', plural: 'agendamentos este mês' },
  cupons: { singular: 'cupom', plural: 'cupons' },
  funcionarios_bot: { singular: 'funcionário do bot', plural: 'funcionários do bot' },
  membros_dashboard: { singular: 'membro da equipe', plural: 'membros da equipe' },
  storage_mb: { singular: 'MB de armazenamento', plural: 'MB de armazenamento' },
};

/**
 * Barra de uso do recurso
 */
export function ResourceUsageBar({ 
  resource, 
  showLabel = true,
  className,
}: { 
  resource: ResourceKey; 
  showLabel?: boolean;
  className?: string;
}) {
  const { usageText, usagePercent, isNearLimit, isAtLimit, isUnlimited, isLoading } = useResourceLimit(resource);
  const labels = RESOURCE_LABELS[resource];

  if (isLoading) {
    return <div className={cn("h-2 bg-muted rounded animate-pulse", className)} />;
  }

  if (isUnlimited) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        <span className="font-medium">{usageText}</span>
        {showLabel && <span className="ml-1">{labels.plural}</span>}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground capitalize">{labels.plural}</span>
          <span className={cn(
            "font-medium",
            isAtLimit && "text-destructive",
            isNearLimit && !isAtLimit && "text-amber-600"
          )}>
            {usageText}
          </span>
        </div>
      )}
      <Progress 
        value={usagePercent} 
        className={cn(
          "h-2",
          isAtLimit && "[&>div]:bg-destructive",
          isNearLimit && !isAtLimit && "[&>div]:bg-amber-500"
        )} 
      />
    </div>
  );
}

/**
 * Guard que bloqueia ações quando limite é atingido
 */
export function ResourceLimitGuard({ 
  resource, 
  children, 
  showUsageBar = true,
  onUpgrade,
}: ResourceLimitGuardProps) {
  const { 
    canAdd, 
    isAtLimit, 
    isNearLimit, 
    usageText, 
    isLoading 
  } = useResourceLimit(resource);
  const labels = RESOURCE_LABELS[resource];

  if (isLoading) {
    return <>{children}</>;
  }

  // Pode adicionar - mostra children normalmente
  if (canAdd) {
    return (
      <>
        {isNearLimit && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Você está próximo do limite de {labels.plural} ({usageText})
            </span>
          </div>
        )}
        {showUsageBar && <ResourceUsageBar resource={resource} className="mb-4" />}
        {children}
      </>
    );
  }

  // Limite atingido - mostra card de upgrade
  return (
    <Card className="border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-muted/30 to-muted/10">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 relative">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        
        <Badge variant="destructive" className="mx-auto mb-2">
          Limite Atingido
        </Badge>
        
        <CardTitle className="text-xl">
          Limite de {labels.plural} atingido
        </CardTitle>
        <CardDescription className="text-base">
          Você está usando {usageText}. Faça upgrade para adicionar mais.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ResourceUsageBar resource={resource} showLabel={false} />
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Planos superiores oferecem limites maiores ou ilimitados
          </p>
        </div>

        <Button 
          onClick={onUpgrade || (() => {
            window.open('https://wa.me/5531999999999?text=Olá! Preciso aumentar meu limite de ' + labels.plural, '_blank');
          })}
          className="w-full gap-2"
          size="lg"
        >
          <Sparkles className="w-4 h-4" />
          Fazer Upgrade
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Badge inline mostrando uso
 */
export function ResourceUsageBadge({ 
  resource,
  className,
}: { 
  resource: ResourceKey;
  className?: string;
}) {
  const { usageText, isNearLimit, isAtLimit, isUnlimited } = useResourceLimit(resource);

  if (isUnlimited) {
    return (
      <Badge variant="secondary" className={className}>
        ∞ Ilimitado
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isAtLimit ? "destructive" : isNearLimit ? "outline" : "secondary"}
      className={cn(
        isNearLimit && !isAtLimit && "border-amber-500 text-amber-700",
        className
      )}
    >
      {usageText}
    </Badge>
  );
}
