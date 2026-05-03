import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LimitIndicatorProps {
  atual: number;
  limite: number | null;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LimitIndicator({
  atual,
  limite,
  label,
  showPercent = false,
  size = 'md',
  className,
}: LimitIndicatorProps) {
  // Se limite é null, é ilimitado
  if (limite === null) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {label && <span className="text-sm text-muted-foreground">{label}:</span>}
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          {atual} / ∞
        </Badge>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((atual / limite) * 100));
  const remaining = limite - atual;

  // Determinar status baseado na porcentagem
  const getStatus = () => {
    if (percent >= 100) return 'critical';
    if (percent >= 80) return 'warning';
    return 'ok';
  };

  const status = getStatus();

  const statusColors = {
    ok: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    warning: 'text-amber-600 bg-amber-50 border-amber-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
  };

  const progressColors = {
    ok: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  const StatusIcon = {
    ok: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
  }[status];

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className={cn('flex items-center justify-between', sizeClasses[size])}>
        <div className="flex items-center gap-2">
          {label && <span className="text-muted-foreground">{label}</span>}
          <Badge 
            variant="outline" 
            className={cn('font-medium', statusColors[status])}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {atual} / {limite}
          </Badge>
        </div>
        
        {showPercent && (
          <span className={cn('font-medium', {
            'text-emerald-600': status === 'ok',
            'text-amber-600': status === 'warning',
            'text-red-600': status === 'critical',
          })}>
            {percent}%
          </span>
        )}
      </div>
      
      <div className="relative">
        <Progress 
          value={percent} 
          className={cn('h-2', {
            'h-1.5': size === 'sm',
            'h-3': size === 'lg',
          })}
        />
        <div 
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all',
            progressColors[status]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {status === 'critical' && (
        <p className="text-xs text-red-600">
          Limite atingido! Faça upgrade para adicionar mais.
        </p>
      )}
      
      {status === 'warning' && (
        <p className="text-xs text-amber-600">
          Próximo do limite ({remaining} restantes)
        </p>
      )}
    </div>
  );
}

// Componente compacto para uso em formulários
interface LimitBadgeProps {
  atual: number;
  limite: number | null;
  className?: string;
}

export function LimitBadge({ atual, limite, className }: LimitBadgeProps) {
  if (limite === null) {
    return (
      <Badge variant="outline" className={cn('bg-primary/10', className)}>
        {atual} / ∞
      </Badge>
    );
  }

  const percent = Math.round((atual / limite) * 100);
  const isFull = atual >= limite;
  const isNearLimit = percent >= 80;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        className,
        isFull && 'bg-red-50 text-red-600 border-red-200',
        isNearLimit && !isFull && 'bg-amber-50 text-amber-600 border-amber-200',
        !isNearLimit && 'bg-emerald-50 text-emerald-600 border-emerald-200',
      )}
    >
      {atual} / {limite}
    </Badge>
  );
}
