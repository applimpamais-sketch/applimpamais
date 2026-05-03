import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PushDevicesChartProps {
  android: number;
  ios: number;
  desktop: number;
}

export default function PushDevicesChart({ android, ios, desktop }: PushDevicesChartProps) {
  const data = [
    { name: 'Android', value: android, color: '#34D399' },
    { name: 'iOS', value: ios, color: '#60A5FA' },
    { name: 'Desktop', value: desktop, color: '#A78BFA' }
  ].filter(item => item.value > 0);

  const total = android + ios + desktop;

  if (total === 0) {
    return (
      <Card className="backdrop-blur-md bg-background/60 border border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Distribuição por Dispositivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-md bg-background/60 border border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Distribuição por Dispositivo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '8px 12px'
              }}
              wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
