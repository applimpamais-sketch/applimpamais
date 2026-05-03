import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  Tag, 
  MessageSquare, 
  Bot, 
  HardDrive,
  ArrowUpRight,
  Crown
} from 'lucide-react';
import { useTenantLimits, type TenantUsage } from '@/hooks/useTenantLimits';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TenantLimitsCardProps {
  tenantId?: string;
  onUpgrade?: () => void;
  compact?: boolean;
}

const planLabels: Record<string, { label: string; color: string }> = {
  starter: { label: 'Starter', color: 'bg-slate-100 text-slate-700' },
  professional: { label: 'Professional', color: 'bg-blue-100 text-blue-700' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700' },
};

export function TenantLimitsCard({ tenantId, onUpgrade, compact = false }: TenantLimitsCardProps) {
  const { usage, isLoading, getUsagePercent, isAtLimit, isNearLimit } = useTenantLimits(tenantId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className={compact ? 'pb-2' : undefined}>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Nenhum tenant associado
          </p>
        </CardContent>
      </Card>
    );
  }

  const planInfo = planLabels[usage.plano] || planLabels.starter;

  const resources = [
    { 
      key: 'tecnicos' as const, 
      label: 'Técnicos', 
      icon: Users,
      data: usage.tecnicos 
    },
    { 
      key: 'agendamentos_mes' as const, 
      label: 'Agendamentos/mês', 
      icon: Calendar,
      data: usage.agendamentos_mes 
    },
    { 
      key: 'cupons' as const, 
      label: 'Cupons ativos', 
      icon: Tag,
      data: usage.cupons 
    },
    { 
      key: 'funcionarios_bot' as const, 
      label: 'Funcionários Bot', 
      icon: Bot,
      data: usage.funcionarios_bot 
    },
    { 
      key: 'membros_dashboard' as const, 
      label: 'Membros', 
      icon: MessageSquare,
      data: usage.membros_dashboard 
    },
  ];

  const hasAnyLimit = resources.some(r => isAtLimit(r.key) || isNearLimit(r.key));

  return (
    <Card className={cn(hasAnyLimit && 'border-amber-200')}>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <CardTitle className={compact ? 'text-base' : undefined}>
              Limites do Plano
            </CardTitle>
          </div>
          <Badge className={planInfo.color}>{planInfo.label}</Badge>
        </div>
        {!compact && (
          <CardDescription>
            Uso atual de recursos do seu plano
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {resources.map(({ key, label, icon: Icon, data }) => {
          const percent = data.limite ? getUsagePercent(key) : 0;
          const atLimit = isAtLimit(key);
          const nearLimit = isNearLimit(key);
          
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    'w-4 h-4',
                    atLimit && 'text-red-500',
                    nearLimit && !atLimit && 'text-amber-500',
                    !nearLimit && 'text-muted-foreground'
                  )} />
                  <span className="text-muted-foreground">{label}</span>
                </div>
                <span className={cn(
                  'font-medium',
                  atLimit && 'text-red-600',
                  nearLimit && !atLimit && 'text-amber-600',
                )}>
                  {data.atual} / {data.limite ?? '∞'}
                </span>
              </div>
              
              {data.limite !== null && (
                <Progress 
                  value={percent} 
                  className={cn(
                    'h-1.5',
                    atLimit && '[&>div]:bg-red-500',
                    nearLimit && !atLimit && '[&>div]:bg-amber-500',
                  )}
                />
              )}
            </div>
          );
        })}

        {/* Storage */}
        <div className="space-y-1.5 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Storage</span>
            </div>
            <span className="font-medium">
              {usage.storage_mb.limite ? `${usage.storage_mb.limite} MB` : '∞'}
            </span>
          </div>
        </div>

        {/* Upgrade button */}
        {onUpgrade && usage.plano !== 'enterprise' && (
          <Button 
            onClick={onUpgrade} 
            variant="outline" 
            className="w-full mt-4"
            size={compact ? 'sm' : 'default'}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Fazer Upgrade
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
