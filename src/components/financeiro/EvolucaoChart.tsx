import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/utils/format";

interface EvolucaoChartProps {
  data: {
    mes: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="backdrop-blur-xl bg-background/95 border border-border/50 rounded-xl p-3 shadow-xl">
      <p className="text-xs font-semibold mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.stroke }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-bold">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function EvolucaoChart({ data }: EvolucaoChartProps) {
  return (
    <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
      <CardHeader>
        <CardTitle>Evolução Financeira</CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradientReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(151 80% 51%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(151 80% 51%)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="gradientDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="gradientSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(220 91% 50%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(220 91% 50%)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3}
              vertical={false}
            />
            <XAxis 
              dataKey="mes" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value >= 1000 ? `R$ ${(value/1000).toFixed(0)}k` : `R$ ${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="receitas" 
              stroke="hsl(151 80% 51%)" 
              strokeWidth={2}
              fill="url(#gradientReceitas)"
              fillOpacity={1}
              name="Receitas"
              dot={{ fill: 'hsl(151 80% 51%)', strokeWidth: 2, r: 4, stroke: 'white' }}
              activeDot={{ r: 6, fill: 'hsl(151 80% 51%)', stroke: 'white', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="despesas" 
              stroke="hsl(0 84% 60%)" 
              strokeWidth={2}
              fill="url(#gradientDespesas)"
              fillOpacity={1}
              name="Despesas"
              dot={{ fill: 'hsl(0 84% 60%)', strokeWidth: 2, r: 4, stroke: 'white' }}
              activeDot={{ r: 6, fill: 'hsl(0 84% 60%)', stroke: 'white', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="saldo" 
              stroke="hsl(220 91% 50%)" 
              strokeWidth={2}
              fill="url(#gradientSaldo)"
              fillOpacity={1}
              name="Saldo"
              dot={{ fill: 'hsl(220 91% 50%)', strokeWidth: 2, r: 4, stroke: 'white' }}
              activeDot={{ r: 6, fill: 'hsl(220 91% 50%)', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
