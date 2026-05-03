import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PeriodType } from './PeriodFilter';
import { useTheme } from 'next-themes';

interface ModernAreaChartProps {
  data: Array<{ dia: string; quantidade: number }>;
  period: PeriodType;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  const value = payload[0].value;
  const label = payload[0].payload.dia;
  
  return (
    <div className="relative">
      {/* Bolha verde com degradê */}
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
        {value} Agendamento{value !== 1 ? 's' : ''}
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

export default function ModernAreaChart({ data, period, loading }: ModernAreaChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const getChartTitle = (period: PeriodType): string => {
    const titles: Record<PeriodType, string> = {
      'hoje': 'Agendamentos Hoje',
      'ontem': 'Agendamentos Ontem',
      '7dias': 'Últimos 7 Dias',
      'mes': 'Este Mês',
      'mes-passado': 'Mês Passado',
      'maximo': 'Todos',
      'personalizado': 'Personalizados'
    };
    return titles[period] || 'Agendamentos';
  };

  // Margins responsivas
  const chartMargins = {
    top: 10,
    right: 10,
    left: -10,
    bottom: 0
  };

  return (
    <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-base font-semibold">
          {getChartTitle(period)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 md:p-6 pt-0">
        {loading ? (
          <Skeleton className="h-[200px] sm:h-[250px] md:h-[280px]" />
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px] md:!h-[280px]">
            <AreaChart data={data} margin={chartMargins}>
              {/* Gradientes azul da logo (light e dark) */}
              <defs>
                {/* Light mode - Azul da Logo */}
                <linearGradient id="colorQuantidade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(220 91% 50%)" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="hsl(220 91% 65%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(220 91% 90%)" stopOpacity={0.1}/>
                </linearGradient>
                
                {/* Dark mode - Azul mais claro */}
                <linearGradient id="colorQuantidadeDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(220 91% 55%)" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="hsl(220 91% 65%)" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="hsl(220 91% 80%)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              {/* Grid sutil */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.2}
                vertical={false}
              />
              
              {/* Eixo X */}
              <XAxis 
                dataKey="dia"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              
              {/* Eixo Y */}
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              
              {/* Tooltip customizado */}
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{
                  stroke: isDark ? 'hsl(220 91% 55%)' : 'hsl(220 91% 50%)',
                  strokeWidth: 2,
                  strokeDasharray: '5 5'
                }}
              />
              
              {/* Área com gradiente azul */}
              <Area
                type="monotone"
                dataKey="quantidade"
                stroke={isDark ? 'hsl(220 91% 55%)' : 'hsl(220 91% 50%)'}
                strokeWidth={2}
                fill={`url(#${isDark ? 'colorQuantidadeDark' : 'colorQuantidade'})`}
                fillOpacity={1}
                dot={{
                  fill: isDark ? 'hsl(220 91% 55%)' : 'hsl(220 91% 50%)',
                  strokeWidth: 2,
                  r: 3,
                  stroke: 'white'
                }}
                activeDot={{
                  r: 5,
                  fill: isDark ? 'hsl(220 91% 55%)' : 'hsl(220 91% 50%)',
                  stroke: 'white',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] sm:h-[250px] md:h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}
