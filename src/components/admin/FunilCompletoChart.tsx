import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import type { MarketingROASStats } from '@/hooks/useMarketingROAS';

interface FunilCompletoChartProps {
  stats: MarketingROASStats | undefined;
  isLoading: boolean;
}

export default function FunilCompletoChart({ stats, isLoading }: FunilCompletoChartProps) {
  if (isLoading) {
    return (
      <Card className="backdrop-blur-md bg-background/60 border-border/50 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  // Funil Online (Pixel)
  const funilOnline = [
    { label: 'Visualizações', value: stats.pixelViews, color: 'bg-blue-500' },
    { label: 'Add Carrinho', value: stats.pixelAddToCart, color: 'bg-cyan-500' },
    { label: 'Checkout', value: stats.pixelCheckout, color: 'bg-green-500' },
    { label: 'Compra', value: stats.pixelPurchases, color: 'bg-emerald-500' },
  ];

  // Funil Real (Agendamentos)
  const funilReal = [
    { label: 'Criados', value: stats.agendamentosCriados, color: 'bg-yellow-500' },
    { label: 'Confirmados', value: stats.agendamentosConfirmados, color: 'bg-orange-500' },
    { label: 'Em Andamento', value: stats.agendamentosEmAndamento, color: 'bg-amber-500' },
    { label: 'Concluídos', value: stats.agendamentosConcluidos, color: 'bg-lime-500' },
    { label: 'Pagos', value: stats.agendamentosPagos, color: 'bg-green-600' },
  ];

  const maxValueOnline = Math.max(...funilOnline.map(f => f.value), 1);
  const maxValueReal = Math.max(...funilReal.map(f => f.value), 1);

  return (
    <Card className="backdrop-blur-md bg-background/60 border-border/50 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Funil Online */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
            Funil Online (Pixel)
          </h3>
          <div className="flex items-center gap-2">
            {funilOnline.map((item, index) => {
              const width = (item.value / maxValueOnline) * 100;
              const conversion = index > 0 
                ? ((item.value / funilOnline[index - 1].value) * 100).toFixed(1)
                : '100.0';

              return (
                <div key={item.label} className="flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`${item.color} rounded-t-lg w-full transition-all`} 
                         style={{ height: `${Math.max(width, 5)}px` }} />
                    <div className="text-center">
                      <div className="text-xs font-semibold">{item.value}</div>
                      <div className="text-[10px] text-muted-foreground">{item.label}</div>
                      {index > 0 && (
                        <div className="text-[10px] text-cyan-400">{conversion}%</div>
                      )}
                    </div>
                  </div>
                  {index < funilOnline.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Funil Real */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
            Funil Real (Agendamentos)
          </h3>
          <div className="flex items-center gap-2">
            {funilReal.map((item, index) => {
              const width = (item.value / maxValueReal) * 100;
              const conversion = index > 0 
                ? ((item.value / funilReal[index - 1].value) * 100).toFixed(1)
                : stats.agendamentosCriados > 0 
                  ? ((stats.agendamentosCriados / stats.pixelPurchases) * 100).toFixed(1)
                  : '0.0';

              return (
                <div key={item.label} className="flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`${item.color} rounded-t-lg w-full transition-all`} 
                         style={{ height: `${Math.max(width, 5)}px` }} />
                    <div className="text-center">
                      <div className="text-xs font-semibold">{item.value}</div>
                      <div className="text-[10px] text-muted-foreground">{item.label}</div>
                      <div className="text-[10px] text-green-400">{conversion}%</div>
                    </div>
                  </div>
                  {index < funilReal.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Métricas de Conversão */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{stats.taxaRealizacao.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Taxa de Realização</div>
            <div className="text-[10px] text-muted-foreground/70">(Pagos / Criados)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.taxaCancelamento.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Taxa de Cancelamento</div>
            <div className="text-[10px] text-muted-foreground/70">(Cancelados / Criados)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
