import { useState } from 'react';
import { Activity, Users, DollarSign, ShoppingBag, ShoppingCart, FileCheck, CheckCircle2, Eye, CreditCard, TrendingUp, Target, Wallet, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { useLiveAnalytics } from '@/hooks/useLiveAnalytics';
import { useLiveViewHistory, type HistoryPeriod } from '@/hooks/useLiveViewHistory';
import { usePixelStats } from '@/hooks/usePixelStats';
import { useMarketingROAS } from '@/hooks/useMarketingROAS';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTenantContext } from '@/hooks/useTenantContext';
import { isRCLimpaMaisTenant } from '@/constants/tenant';
import { formatCurrency } from '@/utils/format';
import { formatCurrency as formatCurrencyDash } from '@/utils/dashboardHelpers';
import { format } from 'date-fns';
import { MiniSparkline } from '@/components/admin/MiniSparkline';
import DashboardKPICard from '@/components/admin/DashboardKPICard';
import PixelTrendChart from '@/components/admin/PixelTrendChart';
import PixelEventsTable from '@/components/admin/PixelEventsTable';
import PixelDebugger from '@/components/admin/PixelDebugger';
import FunilCompletoChart from '@/components/admin/FunilCompletoChart';
import ComparativoPixelReal from '@/components/admin/ComparativoPixelReal';
import InvestimentoAdsCard from '@/components/admin/InvestimentoAdsCard';
import PeriodFilter, { type PeriodType } from '@/components/admin/PeriodFilter';
import {
  LiveViewFunnel,
  LiveViewProducts,
  LiveViewLocations,
  LiveViewSegmentation
} from '@/components/admin/liveview';

export default function Analytics() {
  const { tenantId } = useTenantContext();
  const isRCLimpaMais = isRCLimpaMaisTenant(tenantId);

  // Live View state
  const { stats, loading } = useLiveAnalytics();
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>('30d');
  const { stats: historyStats, loading: historyLoading } = useLiveViewHistory(historyPeriod);

  // Pixel state
  const [pixelPeriod, setPixelPeriod] = useState<PeriodType>('7dias');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>();
  const { stats: pixelStats, events, trendData, loading: pixelLoading, error: pixelError, refetch, lastUpdate } = usePixelStats(pixelPeriod, customRange);
  const { data: roasStats, isLoading: roasLoading } = useMarketingROAS(pixelPeriod, customRange);

  const handleOpenStore = () => {
    window.open('https://rclimpamais.lovable.app', '_blank');
  };

  const periodLabel = { '7d': '7 dias', '30d': '30 dias', '90d': '90 dias' };

  return (
    <AdminContainer>
      <PageHeader
        title="Analytics"
        description="Visão unificada: tempo real, marketing e histórico"
        icon={Activity}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {isRCLimpaMais && (
              <Button variant="outline" size="sm" onClick={handleOpenStore} className="hidden sm:flex">
                <Eye className="h-4 w-4 mr-2" />
                Ver Loja
              </Button>
            )}
            <Badge variant="outline" className="animate-pulse" data-tour="live-badge">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Ao vivo
            </Badge>
          </div>
        }
      />

      <Tabs defaultValue="tempo-real" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tempo-real" className="text-xs sm:text-sm">
            <span className="relative flex h-2 w-2 mr-1.5 sm:mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Tempo Real
          </TabsTrigger>
          <TabsTrigger value="marketing" className="text-xs sm:text-sm">Marketing & Pixel</TabsTrigger>
          <TabsTrigger value="historico" className="text-xs sm:text-sm">Histórico</TabsTrigger>
        </TabsList>

        {/* ========== TAB 1: TEMPO REAL ========== */}
        <TabsContent value="tempo-real" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <Card key={i}><CardContent className="p-4 sm:p-6"><Skeleton className="h-16 sm:h-20" /></CardContent></Card>
              ))
            ) : (
              <>
                <Card className="relative overflow-hidden" data-tour="live-visitors">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10" />
                  <CardContent className="p-4 sm:p-6 relative">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Visitantes agora</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{stats.visitantesAtivos}</p>
                      </div>
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600 opacity-80 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden" data-tour="live-revenue">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10" />
                  <CardContent className="p-4 sm:p-6 relative">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Total de vendas</p>
                        <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 truncate">{formatCurrency(stats.totalVendas)}</p>
                      </div>
                      <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-green-600 opacity-80 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10" />
                  <CardContent className="p-4 sm:p-6 relative">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Total de sessões</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{stats.sessoesAtivas}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600 opacity-80" />
                        {stats.sessoesPorHora.length > 0 && (
                          <div className="hidden sm:block">
                            <MiniSparkline data={stats.sessoesPorHora} color="#9333ea" height={24} width={60} />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-orange-500/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10" />
                  <CardContent className="p-4 sm:p-6 relative">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Total de pedidos</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{stats.pedidosHoje}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                        <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-600 opacity-80" />
                        {stats.pedidosPorHora.length > 0 && (
                          <div className="hidden sm:block">
                            <MiniSparkline data={stats.pedidosPorHora} color="#ea580c" height={24} width={60} />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Comportamento em tempo real */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Comportamento em Tempo Real</CardTitle>
                <Badge variant="outline" className="text-xs">Últimos 15 min</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center" data-tour="live-carts">
                    <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <ShoppingCart className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold mb-0.5">{stats.carrinhosAtivos}</p>
                    <p className="text-xs text-muted-foreground">Carrinhos ativos</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <FileCheck className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold mb-0.5">{stats.noCheckout}</p>
                    <p className="text-xs text-muted-foreground">No checkout</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold mb-0.5">{stats.comprasConcluidas}</p>
                    <p className="text-xs text-muted-foreground">Compras concluídas</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TAB 2: MARKETING & PIXEL ========== */}
        <TabsContent value="marketing" className="space-y-6">
          {/* Header com controles */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <Activity className="h-3 w-3 mr-1" />
                Pixel Conectado
              </Badge>
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  Atualizado {format(new Date(lastUpdate), "HH:mm")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={refetch} disabled={pixelLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${pixelLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <PeriodFilter
                value={pixelPeriod}
                onChange={setPixelPeriod}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
              />
            </div>
          </div>

          {pixelError && (
            <Alert variant="destructive">
              <AlertDescription>{pixelError}</AlertDescription>
            </Alert>
          )}

          {/* KPIs do Pixel */}
          {pixelLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          ) : pixelStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <DashboardKPICard title="Page Views" value={pixelStats.pageViews} icon={Eye} />
              <DashboardKPICard title="Add to Cart" value={pixelStats.addToCart} icon={ShoppingCart} />
              <DashboardKPICard title="Initiate Checkout" value={pixelStats.initiateCheckout} icon={CreditCard} />
              <DashboardKPICard title="Compras" value={pixelStats.purchases} icon={ShoppingBag} />
              <DashboardKPICard title="Receita Pixel" value={formatCurrencyDash(pixelStats.totalRevenue)} icon={DollarSign} />
            </div>
          ) : null}

          {/* KPIs de Performance */}
          {roasLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          ) : roasStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <DashboardKPICard title="ROAS" value={roasStats.roas > 0 ? `${roasStats.roas.toFixed(1)}x` : '0x'} icon={roasStats.roas >= 2 ? TrendingUp : Activity} />
              <DashboardKPICard title="CPA" value={formatCurrencyDash(roasStats.cpa)} icon={Target} />
              <DashboardKPICard title="Investimento em Ads" value={formatCurrencyDash(roasStats.investimentoAds)} icon={Wallet} />
              <DashboardKPICard title="Faturamento Real" value={formatCurrencyDash(roasStats.faturamentoReal)} icon={DollarSign} />
              <DashboardKPICard title="Lucro Estimado" value={formatCurrencyDash(roasStats.lucroEstimado)} icon={roasStats.lucroEstimado >= 0 ? TrendingUp : Activity} />
            </div>
          ) : null}

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PixelTrendChart data={trendData} />
            <FunilCompletoChart stats={roasStats} isLoading={roasLoading} />
            <ComparativoPixelReal stats={roasStats} isLoading={roasLoading} />
          </div>

          {/* Debug & Configuração */}
          <Accordion type="single" collapsible className="rounded-2xl border border-border/50 bg-background/60 backdrop-blur-md">
            <AccordionItem value="debug" className="border-none">
              <AccordionTrigger className="px-6 hover:no-underline">
                <span className="text-base font-semibold">Debug & Configuração</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <PixelEventsTable events={events} />
                  <div className="space-y-6">
                    <PixelDebugger />
                    <InvestimentoAdsCard />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* ========== TAB 3: HISTÓRICO ========== */}
        <TabsContent value="historico" className="space-y-6">
          {/* Seletor de período */}
          <div className="flex justify-end">
            <Select value={historyPeriod} onValueChange={(v) => setHistoryPeriod(v as HistoryPeriod)}>
              <SelectTrigger className="w-[120px] text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analytics Histórico - Layout 2 Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <LiveViewFunnel data={historyStats.funnel} loading={historyLoading} period={periodLabel[historyPeriod]} />
              <LiveViewSegmentation data={historyStats.segmentation} loading={historyLoading} period={periodLabel[historyPeriod]} />
            </div>
            <div className="space-y-6">
              <LiveViewProducts products={historyStats.topProducts} loading={historyLoading} period={periodLabel[historyPeriod]} />
              <LiveViewLocations locations={historyStats.topLocations} loading={historyLoading} period={periodLabel[historyPeriod]} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminContainer>
  );
}
