import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusDonutChartProps {
  stats: {
    total: number;
    pendentes: number;
    confirmados: number;
    concluidos: number;
    cancelados: number;
    pagos: number;
  };
}

const COLORS = {
  pendentes: '#f59e0b',
  confirmados: '#22c55e', 
  concluidos: '#06b6d4',
  cancelados: '#ef4444',
  pagos: '#10b981',
};

export default function StatusDonutChart({ stats }: StatusDonutChartProps) {
  const data = [
    { name: 'Pendentes', value: stats.pendentes, color: COLORS.pendentes },
    { name: 'Confirmados', value: stats.confirmados, color: COLORS.confirmados },
    { name: 'Concluídos', value: stats.concluidos, color: COLORS.concluidos },
    { name: 'Cancelados', value: stats.cancelados, color: COLORS.cancelados },
    { name: 'Pagos', value: stats.pagos, color: COLORS.pagos },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        Nenhum agendamento no período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => [`${value} agendamento(s)`, name]}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '8px 12px'
          }}
          wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
        />
        <Legend 
          iconType="circle" 
          iconSize={8}
          formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
