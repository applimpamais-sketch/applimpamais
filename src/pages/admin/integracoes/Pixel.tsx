import { useState } from 'react';
import { usePixelStats } from '@/hooks/usePixelStats';
import { useMarketingROAS } from '@/hooks/useMarketingROAS';
import DashboardKPICard from '@/components/admin/DashboardKPICard';
import PixelTrendChart from '@/components/admin/PixelTrendChart';
import PixelEventsTable from '@/components/admin/PixelEventsTable';
import PixelDebugger from '@/components/admin/PixelDebugger';
import FunilCompletoChart from '@/components/admin/FunilCompletoChart';
import ComparativoPixelReal from '@/components/admin/ComparativoPixelReal';
import InvestimentoAdsCard from '@/components/admin/InvestimentoAdsCard';
import PeriodFilter, { type PeriodType } from '@/components/admin/PeriodFilter';
import AdminContainer from '@/components/admin/AdminContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Activity, Eye, ShoppingCart, CreditCard, ShoppingBag, DollarSign, TrendingUp, Target, Wallet, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/utils/dashboardHelpers';
import { format } from 'date-fns';

export default function Pixel() {
  const [period, setPeriod] = useState<PeriodType>('7dias');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>();

  const { stats, events, trendData, loading, error, refetch, lastUpdate } = usePixelStats(period, customRange);
  const { data: roasStats, isLoading: roasLoading } = useMarketingROAS(period, customRange);

  return (
    <AdminContainer>
      <div className="space-y-6">
        {/* Header igual à Dashboard */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facebook Pixel Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Monitore eventos do pixel e acompanhe o desempenho das campanhas
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <Activity className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
              <span className="text-sm text-muted-foreground">
                ID: 2005309206981041
              </span>
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  • Atualizado {format(new Date(lastUpdate), "HH:mm")}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <PeriodFilter
              value={period}
              onChange={setPeriod}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* LINHA 1: KPIs do Pixel */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <DashboardKPICard
              title="Page Views"
              value={stats.pageViews}
              icon={Eye}
            />
            <DashboardKPICard
              title="Add to Cart"
              value={stats.addToCart}
              icon={ShoppingCart}
            />
            <DashboardKPICard
              title="Initiate Checkout"
              value={stats.initiateCheckout}
              icon={CreditCard}
            />
            <DashboardKPICard
              title="Compras"
              value={stats.purchases}
              icon={ShoppingBag}
            />
            <DashboardKPICard
              title="Receita Pixel"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
            />
          </div>
        ) : null}

        {/* LINHA 2: KPIs de Performance */}
        {roasLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : roasStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <DashboardKPICard
              title="ROAS"
              value={roasStats.roas > 0 ? `${roasStats.roas.toFixed(1)}x` : '0x'}
              icon={roasStats.roas >= 2 ? TrendingUp : Activity}
            />
            <DashboardKPICard
              title="CPA"
              value={formatCurrency(roasStats.cpa)}
              icon={Target}
            />
            <DashboardKPICard
              title="Investimento em Ads"
              value={formatCurrency(roasStats.investimentoAds)}
              icon={Wallet}
            />
            <DashboardKPICard
              title="Faturamento Real"
              value={formatCurrency(roasStats.faturamentoReal)}
              icon={DollarSign}
            />
            <DashboardKPICard
              title="Lucro Estimado"
              value={formatCurrency(roasStats.lucroEstimado)}
              icon={roasStats.lucroEstimado >= 0 ? TrendingUp : Activity}
            />
          </div>
        ) : null}

        {/* LINHA 3: Gráficos em 3 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PixelTrendChart data={trendData} />
          <FunilCompletoChart stats={roasStats} isLoading={roasLoading} />
          <ComparativoPixelReal stats={roasStats} isLoading={roasLoading} />
        </div>

        {/* LINHA 4: Debug & Configuração (Accordion) */}
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
      </div>
    </AdminContainer>
  );
}
