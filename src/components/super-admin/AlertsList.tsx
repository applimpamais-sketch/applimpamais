import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/hooks/useDatabaseMetrics';

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 text-emerald-500">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Todos os recursos estão saudáveis</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        Alertas de Capacidade
      </h3>
      
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg',
            alert.type === 'critical' 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          )}
        >
          {alert.type === 'critical' ? (
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <span className="text-sm">{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
