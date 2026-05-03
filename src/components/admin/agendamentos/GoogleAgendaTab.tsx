import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useTenantContext } from '@/hooks/useTenantContext';

interface GoogleAgendaTabProps {
  calendarId?: string;
}

export default function GoogleAgendaTab({ calendarId }: GoogleAgendaTabProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const queryClient = useQueryClient();
  const { tenant } = useTenantContext();

  const effectiveCalendarId = calendarId || import.meta.env.VITE_GOOGLE_CALENDAR_ID;

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        body: {
          tenant_id: tenant?.id,
          calendarId: effectiveCalendarId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setSyncResult(data);
        setLastSync(data.synced_at);
        toast.success(`Sincronização concluída! ${data.imported} importados, ${data.updated} atualizados.`);
        queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      toast.error(`Erro na sincronização: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const iframeUrl = effectiveCalendarId
    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(effectiveCalendarId)}&ctz=America/Sao_Paulo&wkst=1&bgcolor=%23ffffff&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0`
    : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <img
                src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png"
                alt="Google Calendar"
                className="h-5 w-5"
              />
              Google Agenda
            </CardTitle>
            <div className="flex items-center gap-2">
              {lastSync && (
                <span className="text-xs text-muted-foreground">
                  Última sync: {new Date(lastSync).toLocaleString('pt-BR')}
                </span>
              )}
              <Button onClick={handleSync} disabled={syncing} size="sm" className="gap-2">
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {syncResult && (
          <CardContent className="pt-0">
            <div className="flex gap-4 text-sm flex-wrap">
              <span className="text-muted-foreground">
                Eventos: <strong>{syncResult.total_events}</strong>
              </span>
              <span className="text-green-600">
                Importados: <strong>{syncResult.imported}</strong>
              </span>
              <span className="text-blue-600">
                Atualizados: <strong>{syncResult.updated}</strong>
              </span>
              <span className="text-muted-foreground">
                Ignorados: <strong>{syncResult.skipped}</strong>
              </span>
              {syncResult.errors && (
                <span className="text-destructive">
                  Erros: <strong>{syncResult.errors.length}</strong>
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="overflow-hidden">
        {iframeUrl ? (
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            <iframe
              src={iframeUrl}
              className="absolute inset-0 w-full h-full border-0"
              title="Google Calendar"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        ) : (
          <CardContent className="py-16 text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">Google Agenda não configurada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure a variável <code className="bg-muted px-1 rounded">VITE_GOOGLE_CALENDAR_ID</code> com o ID do seu calendário para visualizar o iframe.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                A sincronização via API continua disponível se as credenciais estiverem configuradas.
              </p>
            </div>
            <Button onClick={handleSync} disabled={syncing} variant="outline" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              Tentar Sincronizar via API
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
