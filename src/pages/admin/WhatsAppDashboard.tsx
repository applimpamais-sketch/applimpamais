import { useEffect } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { WhatsAppStatsCard } from '@/components/admin/WhatsAppStatsCard';
import { WhatsAppLogsList } from '@/components/admin/WhatsAppLogsList';
import { WhatsAppUsageChart } from '@/components/admin/WhatsAppUsageChart';
import { WhatsAppTypeChart } from '@/components/admin/WhatsAppTypeChart';
import { useWhatsAppRealtimeLogs, useWhatsAppLogsStats } from '@/hooks/useWhatsAppRealtimeLogs';
import { MessageCircle, CheckCircle, XCircle, ShieldAlert, Activity } from 'lucide-react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { toast } from 'sonner';
import { FeatureGate } from '@/components/admin/FeatureGate';

function WhatsAppDashboardContent() {
  const { logs, realtimeLog, isLoading } = useWhatsAppRealtimeLogs();
  const { stats, isLoading: isLoadingStats } = useWhatsAppLogsStats();

  // Notificar quando uma nova mensagem chegar
  useEffect(() => {
    if (realtimeLog) {
      const status = realtimeLog.processamento_status;
      
      if (status === 'sucesso') {
        toast.success('✅ Nova despesa processada via WhatsApp', {
          description: `De: ${realtimeLog.telefone_remetente}`,
        });
      } else if (status === 'erro') {
        toast.error('❌ Erro ao processar mensagem WhatsApp', {
          description: realtimeLog.erro_mensagem || 'Erro desconhecido',
        });
      } else if (status === 'nao_autorizado') {
        toast.warning('⚠️ Tentativa não autorizada', {
          description: `De: ${realtimeLog.telefone_remetente}`,
        });
      }
    }
  }, [realtimeLog]);

  if (isLoading || isLoadingStats) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageHeader
        title="Dashboard WhatsApp"
        subtitle="Monitoramento em tempo real do processamento de despesas via WhatsApp"
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <WhatsAppStatsCard
          title="Total Processado"
          value={stats?.total || 0}
          icon={MessageCircle}
          description="Todas as mensagens"
          color="blue"
        />
        <WhatsAppStatsCard
          title="Sucesso"
          value={stats?.sucesso || 0}
          icon={CheckCircle}
          description={`${stats?.taxaSucesso.toFixed(1)}% de taxa`}
          color="green"
        />
        <WhatsAppStatsCard
          title="Erros"
          value={stats?.erro || 0}
          icon={XCircle}
          description="Falhas no processamento"
          color="red"
        />
        <WhatsAppStatsCard
          title="Não Autorizado"
          value={stats?.naoAutorizado || 0}
          icon={ShieldAlert}
          description="Tentativas bloqueadas"
          color="yellow"
        />
        <WhatsAppStatsCard
          title="Processando"
          value={stats?.processando || 0}
          icon={Activity}
          description="Em andamento"
          color="blue"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <WhatsAppUsageChart data={stats?.porTelefone || {}} />
        <WhatsAppTypeChart data={stats?.porTipo || {}} />
      </div>

      {/* Lista de Logs em Tempo Real */}
      <WhatsAppLogsList logs={logs} realtimeLog={realtimeLog} />
    </>
  );
}

export default function WhatsAppDashboard() {
  return (
    <AdminContainer>
      <FeatureGate feature="whatsapp_bot">
        <WhatsAppDashboardContent />
      </FeatureGate>
    </AdminContainer>
  );
}
