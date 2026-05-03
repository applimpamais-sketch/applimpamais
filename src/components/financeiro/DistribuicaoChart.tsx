import { ModernDonutChart } from "@/components/charts/ModernDonutChart";
import { formatCurrency } from "@/utils/format";
import { TrendingUp, DollarSign } from "lucide-react";

interface DistribuicaoChartProps {
  title: string;
  description: string;
  data: {
    name: string;
    value: number;
    percentual: number;
  }[];
  type?: 'receita' | 'despesa';
}

export function DistribuicaoChart({ title, description, data, type = 'receita' }: DistribuicaoChartProps) {
  const chartData = data.map(item => ({
    name: item.name,
    value: item.value,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ModernDonutChart
      title={title}
      description={description}
      data={chartData}
      centerIcon={type === 'receita' ? TrendingUp : DollarSign}
      centerText={formatCurrency(total)}
      centerSubtext="total"
      colorScheme={type === 'receita' ? 'brand' : 'blue'}
      formatValue={formatCurrency}
    />
  );
}
