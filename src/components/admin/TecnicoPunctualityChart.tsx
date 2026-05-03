import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TecnicoPunctuality } from '@/hooks/useTrackingHistory';

interface TecnicoPunctualityChartProps {
  data: TecnicoPunctuality[];
  isLoading: boolean;
}

const getBarColor = (percentual: number): string => {
  if (percentual >= 90) return 'hsl(142, 76%, 36%)'; // green
  if (percentual >= 70) return 'hsl(45, 93%, 47%)'; // yellow
  return 'hsl(0, 84%, 60%)'; // red
};

export default function TecnicoPunctualityChart({ data, isLoading }: TecnicoPunctualityChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pontualidade por Técnico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pontualidade por Técnico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Sem dados de pontualidade no período
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for chart (max 10 technicians)
  const chartData = data.slice(0, 10).map((t) => ({
    nome: t.tecnico_nome.split(' ')[0], // First name only
    nomeCompleto: t.tecnico_nome,
    percentual: t.percentualPontual,
    pontual: t.pontual,
    toleravel: t.toleravel,
    atrasado: t.atrasado,
    total: t.total,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-1">{d.nomeCompleto}</p>
        <p className="text-sm text-muted-foreground">
          Pontualidade: <span className="font-medium text-foreground">{d.percentual}%</span>
        </p>
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          <p>✅ Pontual: {d.pontual}</p>
          <p>⚠️ Tolerável: {d.toleravel}</p>
          <p>❌ Atrasado: {d.atrasado}</p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pontualidade por Técnico</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="nome"
              width={80}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="percentual" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentual)} />
              ))}
              <LabelList
                dataKey="percentual"
                position="right"
                formatter={(value: number) => `${value}%`}
                style={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex gap-4 justify-center mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
            <span className="text-muted-foreground">≥90% Excelente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(45, 93%, 47%)' }} />
            <span className="text-muted-foreground">70-89% Regular</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} />
            <span className="text-muted-foreground">&lt;70% Atenção</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
