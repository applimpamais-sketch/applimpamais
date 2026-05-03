import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PixelTrendData } from '@/hooks/usePixelStats';

interface PixelTrendChartProps {
  data: PixelTrendData[];
}

export default function PixelTrendChart({ data }: PixelTrendChartProps) {
  return (
    <Card className="backdrop-blur-md bg-background/60 border-border/50 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Tendência de Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="PageView" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Page Views"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="AddToCart" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Add Cart"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="InitiateCheckout" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Checkout"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Purchase" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Compras"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
