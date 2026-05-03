import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';

interface FunnelData {
  visitantes: number;
  carrinhosIniciados: number;
  carrinhosAbandonados: number;
  agendamentos: number;
  pagamentos: number;
}

interface ConversionFunnelChartProps {
  data: FunnelData;
}

export default function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const stages = [
    { label: 'Visitantes', value: data.visitantes, color: 'bg-blue-500' },
    { label: 'Carrinhos Iniciados', value: data.carrinhosIniciados, color: 'bg-purple-500' },
    { label: 'Agendamentos', value: data.agendamentos, color: 'bg-yellow-500' },
    { label: 'Pagamentos', value: data.pagamentos, color: 'bg-success' },
  ];

  const maxValue = Math.max(...stages.map(s => s.value));

  const calcularTaxa = (atual: number, anterior: number) => {
    if (anterior === 0) return 0;
    return ((atual / anterior) * 100).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stages.map((stage, index) => {
          const width = (stage.value / maxValue) * 100;
          const taxaConversao = index > 0 ? calcularTaxa(stage.value, stages[index - 1].value) : 100;

          return (
            <div key={stage.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{stage.label}</span>
                <div className="text-right">
                  <span className="text-lg font-semibold">{stage.value}</span>
                  {index > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({taxaConversao}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                <div
                  className={`h-full ${stage.color} transition-all duration-500 flex items-center justify-center text-white font-medium`}
                  style={{ width: `${width}%` }}
                >
                  {width > 20 && stage.value}
                </div>
              </div>
            </div>
          );
        })}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de Conversão Total</span>
            <span className="font-semibold">
              {calcularTaxa(data.pagamentos, data.visitantes)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de Abandono</span>
            <span className="font-semibold text-warning">
              {calcularTaxa(data.carrinhosAbandonados, data.carrinhosIniciados)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
