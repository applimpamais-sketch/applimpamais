import { useWhatsAppHealthCheck } from '@/hooks/useWhatsAppHealthCheck';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const instanceLabels: Record<string, string> = {
  bot: 'Bot WhatsApp',
  financeiro: 'WhatsApp Financeiro',
};

export default function WhatsAppHealthStatus() {
  const { checks, loading, allHealthy, anyUnhealthy, runManualCheck } = useWhatsAppHealthCheck();

  if (checks.length === 0 && !loading) return null;

  return (
    <Card className={cn(
      'transition-all',
      anyUnhealthy && 'border-destructive/50 shadow-destructive/10 shadow-md'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Status WhatsApp
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={runManualCheck}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {anyUnhealthy && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs">
              ⚠️ Uma ou mais instâncias WhatsApp estão desconectadas. Verifique o painel UltraMSG.
            </AlertDescription>
          </Alert>
        )}

        {checks.map((check) => (
          <div
            key={check.instance_type}
            className="flex items-center justify-between py-1.5"
          >
            <div className="flex items-center gap-2">
              {check.is_healthy ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive animate-pulse" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {instanceLabels[check.instance_type] || check.instance_type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {check.created_at
                    ? formatDistanceToNow(new Date(check.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })
                    : '—'}
                  {check.latency_ms > 0 && ` · ${check.latency_ms}ms`}
                </p>
              </div>
            </div>

            <Badge
              variant={check.is_healthy ? 'default' : 'destructive'}
              className={cn(
                'text-xs',
                check.is_healthy && 'bg-green-500 hover:bg-green-600'
              )}
            >
              {check.is_healthy ? 'Online' : check.status === 'not_configured' ? 'Não configurado' : 'Offline'}
            </Badge>
          </div>
        ))}

        {allHealthy && (
          <p className="text-xs text-green-600 dark:text-green-400 text-center pt-1">
            ✅ Todas as instâncias estão funcionando
          </p>
        )}
      </CardContent>
    </Card>
  );
}
