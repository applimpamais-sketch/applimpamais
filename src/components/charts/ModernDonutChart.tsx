import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DonutChartData {
  name: string;
  value: number;
  color?: { start: string; end: string };
}

interface ModernDonutChartProps {
  title: string;
  description?: string;
  data: DonutChartData[];
  centerIcon?: LucideIcon;
  centerText?: string;
  centerSubtext?: string;
  colorScheme?: 'blue' | 'brand' | 'green';
  showPercentage?: boolean;
  formatValue?: (value: number) => string;
}

// Paletas de cores da plataforma
const COLOR_SCHEMES = {
  blue: [
    { start: 'hsl(220, 91%, 85%)', end: 'hsl(220, 91%, 75%)' },
    { start: 'hsl(220, 91%, 65%)', end: 'hsl(220, 91%, 55%)' },
    { start: 'hsl(220, 91%, 50%)', end: 'hsl(220, 91%, 45%)' },
    { start: 'hsl(220, 91%, 40%)', end: 'hsl(220, 91%, 35%)' },
    { start: 'hsl(220, 91%, 30%)', end: 'hsl(220, 91%, 25%)' },
  ],
  green: [
    { start: 'hsl(151, 80%, 70%)', end: 'hsl(151, 80%, 60%)' },
    { start: 'hsl(151, 80%, 51%)', end: 'hsl(151, 80%, 45%)' },
    { start: 'hsl(151, 80%, 40%)', end: 'hsl(151, 80%, 35%)' },
    { start: 'hsl(151, 80%, 30%)', end: 'hsl(151, 80%, 25%)' },
    { start: 'hsl(151, 80%, 20%)', end: 'hsl(151, 80%, 15%)' },
  ],
  brand: [
    { start: 'hsl(151, 80%, 70%)', end: 'hsl(151, 80%, 60%)' },
    { start: 'hsl(151, 80%, 51%)', end: 'hsl(151, 80%, 45%)' },
    { start: 'hsl(220, 91%, 65%)', end: 'hsl(220, 91%, 55%)' },
    { start: 'hsl(220, 91%, 50%)', end: 'hsl(220, 91%, 45%)' },
    { start: 'hsl(220, 91%, 35%)', end: 'hsl(220, 91%, 30%)' },
  ],
};

export function ModernDonutChart({
  title,
  description,
  data,
  centerIcon: CenterIcon,
  centerText,
  centerSubtext,
  colorScheme = 'blue',
  showPercentage = true,
  formatValue,
}: ModernDonutChartProps) {
  const colors = COLOR_SCHEMES[colorScheme];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
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
          <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {data.map((entry, index) => {
                    const color = entry.color || colors[index % colors.length];
                    return (
                      <linearGradient
                        key={`gradient-${index}`}
                        id={`gradient-donut-${title.replace(/\s+/g, '-')}-${index}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={color.start} stopOpacity={1} />
                        <stop offset="100%" stopColor={color.end} stopOpacity={0.85} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={3}
                  dataKey="value"
                  label={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-donut-${title.replace(/\s+/g, '-')}-${index})`}
                      stroke="hsl(var(--background))"
                      strokeWidth={3}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const value = payload[0].value as number;
                    const percentage = ((value / total) * 100).toFixed(1);
                    const displayValue = formatValue ? formatValue(value) : value;
                    return (
                      <div className="backdrop-blur-xl bg-background/95 border border-border/50 rounded-xl p-3 shadow-xl">
                        <p className="text-xs font-semibold mb-1">{payload[0].name}</p>
                        <p className="text-sm font-bold text-primary">
                          {displayValue}
                          {showPercentage && <span className="text-muted-foreground ml-1">({percentage}%)</span>}
                        </p>
                      </div>
                    );
                  }}
                  wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centro do Donut - Ícone ou Texto */}
            {(CenterIcon || centerText) && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                {CenterIcon && (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <CenterIcon className="w-6 h-6 text-primary" />
                  </div>
                )}
                {centerText && (
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-foreground truncate max-w-[100px] text-center">{centerText}</p>
                )}
                {centerSubtext && (
                  <p className="text-xs text-muted-foreground mt-1">{centerSubtext}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
