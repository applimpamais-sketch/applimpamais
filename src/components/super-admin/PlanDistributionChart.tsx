import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PlanDistributionChartProps {
  starter: number;
  professional: number;
  enterprise: number;
}

const COLORS = {
  starter: '#3b82f6',      // blue-500
  professional: '#8b5cf6', // violet-500
  enterprise: '#f59e0b',   // amber-500
};

export function PlanDistributionChart({ starter, professional, enterprise }: PlanDistributionChartProps) {
  const data = [
    { name: 'Starter', value: starter, color: COLORS.starter },
    { name: 'Professional', value: professional, color: COLORS.professional },
    { name: 'Enterprise', value: enterprise, color: COLORS.enterprise },
  ].filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        <p>Nenhuma receita registrada ainda</p>
      </div>
    );
  }

  const total = starter + professional + enterprise;

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
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
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => {
              const item = data.find(d => d.name === value);
              const percentage = item ? ((item.value / total) * 100).toFixed(0) : 0;
              return `${value} (${percentage}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Summary below chart */}
      <div className="flex justify-center gap-6 mt-2 text-sm">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div className="font-medium" style={{ color: item.color }}>
              {formatCurrency(item.value)}
            </div>
            <div className="text-muted-foreground text-xs">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
