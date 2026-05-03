import { useState } from 'react';
import { Activity, Users, DollarSign, ShoppingBag, ShoppingCart, FileCheck, CheckCircle2, Package, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { useLiveAnalytics } from '@/hooks/useLiveAnalytics';
import { useLiveViewHistory, type HistoryPeriod } from '@/hooks/useLiveViewHistory';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/format';
import { MiniSparkline } from '@/components/admin/MiniSparkline';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenantContext } from '@/hooks/useTenantContext';
import { isRCLimpaMaisTenant } from '@/constants/tenant';
import { 
  LiveViewFunnel, 
  LiveViewProducts, 
  LiveViewLocations, 
  LiveViewSegmentation 
} from '@/components/admin/liveview';

export default function LiveView() {
  const { tenantId } = useTenantContext();
  const isRCLimpaMais = isRCLimpaMaisTenant(tenantId);
  const { stats, loading } = useLiveAnalytics();
  
  // Estado do período para dados históricos
  const [period, setPeriod] = useState<HistoryPeriod>('30d');
  const { stats: historyStats, loading: historyLoading } = useLiveViewHistory(period);

  const handleOpenStore = () => {
    window.open('https://rclimpamais.lovable.app', '_blank');
  };

  const periodLabel = {
    '7d': '7 dias',
    '30d': '30 dias',
    '90d': '90 dias',
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Live View"
        description="Monitore sua loja em tempo real"
        icon={Activity}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Seletor de período */}
            <Select value={period} onValueChange={(v) => setPeriod(v as HistoryPeriod)}>
              <SelectTrigger className="w-[120px] text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Botão Ver Loja - apenas para RC Limpa Mais master */}
            {isRCLimpaMais && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenStore}
                className="hidden sm:flex"
              >
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

      {/* LINHA 1: KPIs Principais (Tempo Real) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <Skeleton className="h-16 sm:h-20" />
                </CardContent>
              </Card>
            ))}
          </>
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

      {/* LINHA 2: Comportamento em tempo real */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Comportamento em Tempo Real</CardTitle>
            <Badge variant="outline" className="text-xs">Últimos 15 min</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
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

      {/* LINHA 3: Analytics Histórico - Layout 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA ESQUERDA */}
        <div className="space-y-6">
          {/* Funil de Comportamento */}
          <LiveViewFunnel 
            data={historyStats.funnel} 
            loading={historyLoading} 
            period={periodLabel[period]} 
          />

          {/* Segmentação de Clientes */}
          <LiveViewSegmentation 
            data={historyStats.segmentation} 
            loading={historyLoading} 
            period={periodLabel[period]} 
          />
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6">
          {/* Produtos Mais Vendidos */}
          <LiveViewProducts 
            products={historyStats.topProducts} 
            loading={historyLoading} 
            period={periodLabel[period]} 
          />

          {/* Principais Locais */}
          <LiveViewLocations 
            locations={historyStats.topLocations} 
            loading={historyLoading} 
            period={periodLabel[period]} 
          />
        </div>
      </div>
    </AdminContainer>
  );
}
