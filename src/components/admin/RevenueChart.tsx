import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';
import { useTheme } from 'next-themes';
import { PeriodType } from './PeriodFilter';
import { formatCurrency } from '@/utils/format';

interface RevenueChartProps {
  data: Array<{ dia: string; receita: number }>;
  period: PeriodType;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  const value = payload[0].value;
  const label = payload[0].payload.dia;
  
  return (
    <div className="relative">
      {/* Bolha VERDE com degradê */}
      <div className="
        absolute -top-16 left-1/2 -translate-x-1/2
        bg-gradient-to-br from-green-400 to-green-600
        dark:from-green-500 dark:to-green-700
        text-white font-bold text-lg
        px-4 py-2 rounded-full
        shadow-lg shadow-green-500/50 dark:shadow-green-600/50
        whitespace-nowrap
        animate-in zoom-in-95 duration-200
        z-50
      ">
        {formatCurrency(value)}
      </div>
      
      {/* Card de detalhes */}
      <div className="
        backdrop-blur-xl bg-background/95
        border border-border/50
        rounded-xl p-3 shadow-xl
        mt-2
      ">
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

const getChartTitle = (period: PeriodType): string => {
  const titles: Record<PeriodType, string> = {
    'hoje': 'Receita Hoje',
    'ontem': 'Receita Ontem',
    '7dias': 'Receita nos Últimos 7 Dias',
    'mes': 'Receita Este Mês',
    'mes-passado': 'Receita no Mês Passado',
    'maximo': 'Receita Total',
    'personalizado': 'Receita Personalizada'
  };
  return titles[period] || 'Receita';
};

export default function RevenueChart({ data, period, loading }: RevenueChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          {getChartTitle(period)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[280px]" />
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              {/* Gradiente VERDE */}
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(151 80% 51%)" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="hsl(151 80% 60%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(151 80% 70%)" stopOpacity={0.1}/>
                </linearGradient>
                
                <linearGradient id="colorReceitaDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(151 80% 55%)" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="hsl(151 80% 60%)" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="hsl(151 80% 65%)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.2}
                vertical={false}
              />
              
              <XAxis 
                dataKey="dia"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              />
              
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                tickLine={false}
                tickFormatter={(value) => value >= 1000 ? `R$ ${(value/1000).toFixed(0)}k` : `R$ ${value}`}
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{
                  stroke: isDark ? 'hsl(151 80% 55%)' : 'hsl(151 80% 51%)',
                  strokeWidth: 2,
                  strokeDasharray: '5 5'
                }}
              />
              
              <Area
                type="monotone"
                dataKey="receita"
                stroke={isDark ? 'hsl(151 80% 55%)' : 'hsl(151 80% 51%)'}
                strokeWidth={3}
                fill={`url(#${isDark ? 'colorReceitaDark' : 'colorReceita'})`}
                fillOpacity={1}
                dot={{
                  fill: isDark ? 'hsl(151 80% 55%)' : 'hsl(151 80% 51%)',
                  strokeWidth: 2,
                  r: 4,
                  stroke: 'white'
                }}
                activeDot={{
                  r: 6,
                  fill: isDark ? 'hsl(151 80% 55%)' : 'hsl(151 80% 51%)',
                  stroke: 'white',
                  strokeWidth: 3
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhum dado de receita disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}
