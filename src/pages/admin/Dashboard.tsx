import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, Calendar, DollarSign, TrendingUp, CreditCard, Target, MessageSquare, Download, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import DashboardKPICard from '@/components/admin/DashboardKPICard';
import AgendamentosRecentesList from '@/components/admin/AgendamentosRecentesList';
import TopRankingCard from '@/components/admin/TopRankingCard';
import TopOrigensChart from '@/components/admin/TopOrigensChart';
import RevenueChart from '@/components/admin/RevenueChart';
import PeriodFilter, { PeriodType } from '@/components/admin/PeriodFilter';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRealtimeAgendamentos } from '@/hooks/useRealtimeAgendamentos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ModernAreaChart from '@/components/admin/ModernAreaChart';
import { getServiceIcon } from '@/utils/dashboardHelpers';
import AdminContainer from '@/components/admin/AdminContainer';
import { toast } from '@/hooks/use-toast';
import { exportCatalogoToExcel } from '@/utils/exportCatalogoServicos';
import { Button } from '@/components/ui/button';
import WhatsAppJourneyTable from '@/components/admin/WhatsAppJourneyTable';
import WhatsAppHealthStatus from '@/components/admin/WhatsAppHealthStatus';

export default function Dashboard() {
  const [period, setPeriod] = useState<PeriodType>('hoje');
  const { stats, loading, refresh } = useDashboardStats(period);
  
  useRealtimeAgendamentos(() => {
    refresh();
    toast({
      title: '🔄 Atualização em tempo real',
      description: 'Novo agendamento recebido!',
    });
  });

  const totalBairros = stats.topBairros.reduce((sum, b) => sum + b.count, 0);
  const bairrosRanking = stats.topBairros.slice(0, 5).map(b => ({
    label: b.bairro,
    value: b.count,
    percentage: totalBairros > 0 ? Math.round((b.count / totalBairros) * 100) : 0,
  }));

  const servicosRanking = stats.topServicos.slice(0, 5).map(s => ({
    label: s.nome,
    value: s.quantidade,
    icon: getServiceIcon(s.nome),
  }));

  return (
    <AdminContainer>
      {/* Header com Filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2" data-tour="dashboard-header">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <div data-tour="period-filter">
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* LINHA 1: KPIs de Agendamentos (5 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <div data-tour="kpi-total-agendamentos">
              <DashboardKPICard
                title="Total de Agendamentos"
                value={stats.kpis.total}
                icon={CalendarDays}
                change={stats.kpis.totalVsAnterior}
                showChange={true}
              />
            </div>
            <DashboardKPICard
              title="Novos"
              value={stats.kpis.novos}
              icon={Clock}
              change={stats.kpis.novosVsAnterior}
              showChange={true}
            />
            <DashboardKPICard
              title="Concluídos"
              value={stats.kpis.concluidos}
              icon={CheckCircle2}
              change={stats.kpis.concluidosVsAnterior}
              showChange={true}
            />
            <DashboardKPICard
              title="Via Bot"
              value={stats.kpis.agendamentosViaBot}
              icon={MessageSquare}
              change={stats.kpis.agendamentosViaBotVsAnterior}
              showChange={true}
            />
            <DashboardKPICard
              title="Hoje"
              value={stats.kpis.hoje}
              icon={Calendar}
              change={stats.kpis.hojeVsOntem}
              showChange={true}
            />
          </>
        )}
      </div>

      {/* LINHA 2: KPIs Financeiros (4 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <div data-tour="kpi-receita">
              <DashboardKPICard
                title="Receita Realizada"
                value={formatCurrency(stats.kpis.receitaRealizada)}
                icon={DollarSign}
                change={stats.kpis.receitaRealizadaVsAnterior}
                showChange={true}
              />
            </div>
            <DashboardKPICard
              title="Receita Prevista"
              value={formatCurrency(stats.kpis.receitaPrevista)}
              icon={TrendingUp}
              change={stats.kpis.receitaPrevistaVsAnterior}
              showChange={true}
            />
            <DashboardKPICard
              title="Ticket Médio"
              value={formatCurrency(stats.kpis.ticketMedio)}
              icon={CreditCard}
              change={stats.kpis.ticketMedioVsAnterior}
              showChange={true}
            />
            <DashboardKPICard
              title="Taxa de Conversão"
              value={`${stats.kpis.taxaConversao.toFixed(1)}%`}
              icon={Target}
              change={stats.kpis.taxaConversaoVsAnterior}
              showChange={true}
            />
          </>
        )}
      </div>

      {/* LINHA 3: Gráficos (3 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div data-tour="chart-agendamentos">
          <ModernAreaChart 
            data={stats.last7Days} 
            period={period}
            loading={loading}
          />
        </div>

        <RevenueChart
          data={stats.last7DaysRevenue}
          period={period}
          loading={loading}
        />

        <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Agendamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : (
              <AgendamentosRecentesList agendamentos={stats.recentAgendamentos} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* LINHA 4: Rankings (3 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-[280px]" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <div data-tour="top-bairros">
              <TopRankingCard
                title="TOP BAIRROS"
                items={bairrosRanking}
                type="bairros"
                tooltip="Bairros com mais agendamentos"
              />
            </div>
            <div data-tour="top-servicos">
              <TopRankingCard
                title="TOP SERVIÇOS"
                items={servicosRanking}
                type="servicos"
                tooltip="Serviços mais solicitados"
              />
            </div>
            <TopOrigensChart data={stats.topOrigens} />
          </>
        )}
      </div>

      {/* LINHA 5: Ferramentas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Catálogo de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Exportar todos os serviços e aluguéis cadastrados em planilha Excel
            </p>
            <Button 
              onClick={() => {
                try {
                  const fileName = exportCatalogoToExcel();
                  toast({
                    title: '✅ Planilha exportada!',
                    description: `Arquivo ${fileName} baixado com sucesso`,
                  });
                } catch (error) {
                  toast({
                    title: '❌ Erro ao exportar',
                    description: 'Não foi possível gerar a planilha',
                    variant: 'destructive',
                  });
                }
              }}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Catálogo Excel
            </Button>
          </CardContent>
        </Card>
        <WhatsAppJourneyTable />
        <WhatsAppHealthStatus />
      </div>
    </AdminContainer>
  );
}
