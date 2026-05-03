import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/utils/dashboardHelpers';
import type { MarketingROASStats } from '@/hooks/useMarketingROAS';

interface ComparativoPixelRealProps {
  stats: MarketingROASStats | undefined;
  isLoading: boolean;
}

export default function ComparativoPixelReal({ stats, isLoading }: ComparativoPixelRealProps) {
  if (isLoading) {
    return (
      <Card className="backdrop-blur-md bg-background/60 border-border/50 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Expectativa vs Realidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted/20 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const percentualRealizacao = stats.faturamentoEsperado > 0 
    ? (stats.faturamentoReal / stats.faturamentoEsperado) * 100 
    : 0;

  const percentualCancelamento = stats.faturamentoEsperado > 0 
    ? (stats.valorReembolsado / stats.faturamentoEsperado) * 100 
    : 0;

  const percentualPendente = stats.faturamentoEsperado > 0 
    ? (stats.valorPendente / stats.faturamentoEsperado) * 100 
    : 0;

  return (
    <Card className="backdrop-blur-md bg-background/60 border-border/50 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Expectativa vs Realidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Receita Esperada (Pixel) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Receita Pixel (esperada)</span>
            <span className="text-lg font-bold">{formatCurrency(stats.faturamentoEsperado)}</span>
          </div>
          <Progress value={100} className="h-2 bg-muted/30" />
        </div>

        {/* Receita Real (Paga) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Receita Real (paga)</span>
            <div className="text-right">
              <span className="text-lg font-bold text-green-500">
                {formatCurrency(stats.faturamentoReal)}
              </span>
              <span className="ml-2 text-xs text-green-400">
                {percentualRealizacao.toFixed(1)}%
              </span>
            </div>
          </div>
          <Progress 
            value={percentualRealizacao} 
            className="h-2 bg-muted/30"
            indicatorClassName="bg-green-500"
          />
        </div>

        {/* Reembolsos */}
        {stats.valorReembolsado > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reembolsos</span>
              <div className="text-right">
                <span className="text-lg font-bold text-red-500">
                  {formatCurrency(stats.valorReembolsado)}
                </span>
                <span className="ml-2 text-xs text-red-400">
                  {percentualCancelamento.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress 
              value={percentualCancelamento} 
              className="h-2 bg-muted/30"
              indicatorClassName="bg-red-500"
            />
          </div>
        )}

        {/* Pendente de Pagamento */}
        {stats.valorPendente > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pendente de Pagamento</span>
              <div className="text-right">
                <span className="text-lg font-bold text-yellow-500">
                  {formatCurrency(stats.valorPendente)}
                </span>
                <span className="ml-2 text-xs text-yellow-400">
                  {percentualPendente.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress 
              value={percentualPendente} 
              className="h-2 bg-muted/30"
              indicatorClassName="bg-yellow-500"
            />
          </div>
        )}

        {/* Resumo */}
        <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Ticket Médio</div>
            <div className="text-xl font-bold">{formatCurrency(stats.ticketMedio)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Total Pagos</div>
            <div className="text-xl font-bold">
              {stats.agendamentosConcluidos + stats.agendamentosPagos}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
