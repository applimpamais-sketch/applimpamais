import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LucideIcon } from 'lucide-react';

interface ModernBarChartProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    value: number;
    label?: string;
  }>;
  dataKey?: string;
  colorScheme?: 'blue' | 'green' | 'brand';
  showGrid?: boolean;
  barSize?: number;
  height?: number;
  formatValue?: (value: number) => string;
  icon?: LucideIcon;
}

const COLOR_GRADIENTS = {
  blue: {
    start: 'hsl(220, 91%, 60%)',
    end: 'hsl(220, 91%, 45%)',
  },
  green: {
    start: 'hsl(151, 80%, 60%)',
    end: 'hsl(151, 80%, 45%)',
  },
  brand: {
    start: 'hsl(151, 80%, 60%)',
    end: 'hsl(220, 91%, 45%)',
  },
};

const PremiumTooltip = ({ active, payload, formatValue }: any) => {
  if (!active || !payload?.length) return null;

  const value = payload[0].value as number;
  const label = payload[0].payload.label || payload[0].payload.name;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 blur-xl rounded-2xl" />
      <div className="relative backdrop-blur-2xl bg-background/95 border-2 border-primary/20 rounded-2xl p-4 shadow-2xl min-w-[180px]">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg" />
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {formatValue ? formatValue(value) : value}
        </p>
      </div>
    </div>
  );
};

export function ModernBarChart({
  title,
  description,
  data,
  dataKey = 'value',
  colorScheme = 'blue',
  showGrid = true,
  barSize = 50,
  height = 300,
  formatValue,
  icon: Icon,
}: ModernBarChartProps) {
  const colors = COLOR_GRADIENTS[colorScheme];

  return (
    <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`barGradient-${colorScheme}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.start} stopOpacity={1} />
                  <stop offset="100%" stopColor={colors.end} stopOpacity={0.85} />
                </linearGradient>
              </defs>

              {showGrid && (
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="hsl(var(--border))"
                  opacity={0.08}
                  vertical={false}
                />
              )}

              <XAxis
                dataKey="name"
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

              <Tooltip
                cursor={{ fill: 'hsl(var(--accent)/0.05)', radius: 8 }}
                content={<PremiumTooltip formatValue={formatValue} />}
              />

              <Bar
                dataKey={dataKey}
                fill={`url(#barGradient-${colorScheme})`}
                radius={[12, 12, 0, 0]}
                maxBarSize={barSize}
                className="transition-all duration-300 hover:opacity-90"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
