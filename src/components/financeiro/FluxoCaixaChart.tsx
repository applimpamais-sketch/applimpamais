import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import { formatCurrency } from "@/utils/format";
import { format } from "date-fns";
import { MovimentacaoDiaria } from "@/hooks/useFluxoCaixa";

interface FluxoCaixaChartProps {
  movimentacoes: MovimentacaoDiaria[];
}

export function FluxoCaixaChart({ movimentacoes }: FluxoCaixaChartProps) {
  const chartData = movimentacoes.map(m => ({
    data: format(new Date(m.data), 'dd/MM'),
    entradas: m.entradas,
    saidas: m.saidas,
    saldoAcumulado: m.saldoAcumulado,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa - Entradas vs Saídas</CardTitle>
        <CardDescription>Acompanhamento diário e saldo acumulado</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="data" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            
            {/* Área de entradas (verde) */}
            <Area 
              type="monotone" 
              dataKey="entradas" 
              fill="hsl(151, 80%, 51%)" 
              fillOpacity={0.3}
              stroke="hsl(151, 80%, 51%)"
              strokeWidth={2}
              name="Entradas"
            />
            
            {/* Área de saídas (vermelho) */}
            <Area 
              type="monotone" 
              dataKey="saidas" 
              fill="hsl(0, 84%, 60%)" 
              fillOpacity={0.3}
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              name="Saídas"
            />
            
            {/* Linha de saldo acumulado (azul) */}
            <Line 
              type="monotone" 
              dataKey="saldoAcumulado" 
              stroke="hsl(220, 91%, 50%)"
              strokeWidth={3}
              name="Saldo Acumulado"
              dot={{ fill: 'hsl(220, 91%, 50%)', r: 3 }}
            />
            
            {/* Linha de referência em zero */}
            <ReferenceLine 
              y={0} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="3 3"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
