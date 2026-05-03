import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WhatsAppUsageChartProps {
  data: Record<string, { total: number; sucesso: number; erro: number }>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="backdrop-blur-xl bg-background/95 border border-border/50 rounded-xl p-3 shadow-xl">
      <p className="text-xs font-semibold mb-2">Telefone: {payload[0].payload.telefone}</p>
      <div className="space-y-1">
        <p className="text-xs text-green-600 dark:text-green-400">
          ✓ Sucesso: <span className="font-bold">{payload[0].value}</span>
        </p>
        {payload[1] && (
          <p className="text-xs text-red-600 dark:text-red-400">
            ✗ Erro: <span className="font-bold">{payload[1].value}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export function WhatsAppUsageChart({ data }: WhatsAppUsageChartProps) {
  const chartData = Object.entries(data).map(([telefone, stats]) => ({
    telefone: telefone.slice(-4), // Últimos 4 dígitos para privacidade
    total: stats.total,
    sucesso: stats.sucesso,
    erro: stats.erro,
  })).sort((a, b) => b.total - a.total).slice(0, 10); // Top 10

  return (
    <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Uso por Funcionário (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum dado disponível ainda
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(151, 80%, 60%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(151, 80%, 45%)" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0, 84%, 70%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(0, 84%, 55%)" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="0" 
                stroke="hsl(var(--border))" 
                opacity={0.08}
                vertical={false}
              />
              <XAxis 
                dataKey="telefone" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent)/0.05)', radius: 8 }} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Bar 
                dataKey="sucesso" 
                fill="url(#successGradient)" 
                name="Sucesso" 
                radius={[12, 12, 0, 0]}
                maxBarSize={40}
                className="transition-all duration-300 hover:opacity-90"
              />
              <Bar 
                dataKey="erro" 
                fill="url(#errorGradient)" 
                name="Erro" 
                radius={[12, 12, 0, 0]}
                maxBarSize={40}
                className="transition-all duration-300 hover:opacity-90"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
