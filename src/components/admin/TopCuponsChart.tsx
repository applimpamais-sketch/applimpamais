import { ModernBarChart } from '@/components/charts/ModernBarChart';
import { Tag } from 'lucide-react';

interface TopCuponsChartProps {
  data: Array<{ codigo: string; usos: number; desconto: number }>;
}

export default function TopCuponsChart({ data }: TopCuponsChartProps) {
  const chartData = data.map(item => ({
    name: item.codigo,
    value: item.usos,
    label: `${item.codigo} (${item.desconto}% off)`,
  }));

  return (
    <ModernBarChart
      title="Top Cupons Mais Usados"
      description="Top cupons por quantidade de usos"
      data={chartData}
      colorScheme="brand"
      formatValue={(value) => `${value} usos`}
      barSize={50}
      height={300}
      icon={Tag}
    />
  );
}
