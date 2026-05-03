import { useState } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import PushStatsCards from '@/components/admin/PushStatsCards';
import PushDevicesChart from '@/components/admin/PushDevicesChart';
import PushLogsTable from '@/components/admin/PushLogsTable';
import PushPermissionBanner from '@/components/admin/PushPermissionBanner';
import PeriodFilter, { type PeriodType } from '@/components/admin/PeriodFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePushStats } from '@/hooks/usePushStats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PushNotifications() {
  const [period, setPeriod] = useState<PeriodType>('7dias');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>();
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleTestNotification = async () => {
    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-onesignal-notification', {
        body: {
          tipo: 'test',
          agendamento: {
            nome_cliente: 'Teste do Sistema',
            valor_total: 0,
            data_agendamento: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      toast.success('Notificação de teste enviada!', {
        description: `Enviada para ${data.recipients || 0} dispositivo(s)`,
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      toast.error('Erro ao enviar notificação', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    } finally {
      setIsSendingTest(false);
    }
  };
  const { data: stats, isLoading } = usePushStats(period, customRange);

  if (isLoading || !stats) {
    return (
      <AdminContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Push Notifications"
            description="Monitoramento e estatísticas de notificações push"
          />
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleTestNotification}
              disabled={isSendingTest}
              className="gap-2"
              data-tour="push-testar"
            >
              {isSendingTest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              Testar Notificação
            </Button>
            <div data-tour="push-periodo">
            <PeriodFilter
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
            </div>
          </div>
        </div>

        {/* Banner de Status de Permissões */}
        <PushPermissionBanner />

        {/* KPIs */}
        <div data-tour="push-dispositivos">
          <PushStatsCards
            totalDispositivos={stats.totalDispositivos}
            taxaEntrega={stats.taxaEntrega}
            notificacoesEnviadas={stats.notificacoesEnviadas}
            dispositivosAtivos={stats.dispositivosAtivos}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Linha - Envios ao Longo do Tempo */}
          <Card className="lg:col-span-2 backdrop-blur-md bg-background/60 border border-border/50" data-tour="push-grafico">
            <CardHeader>
              <CardTitle className="text-base">Envios ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.historicoEnvios.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível para o período selecionado
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.historicoEnvios}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="data" 
                      tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sucesso" 
                      stroke="#34D399" 
                      name="Sucesso"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="falha" 
                      stroke="#EF4444" 
                      name="Falha"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Pizza - Distribuição por Dispositivo */}
          <PushDevicesChart
            android={stats.porDispositivo.android}
            ios={stats.porDispositivo.ios}
            desktop={stats.porDispositivo.desktop}
          />
        </div>

        {/* Tabela de Logs */}
        <PushLogsTable logs={stats.logsRecentes} />
      </div>
    </AdminContainer>
  );
}
