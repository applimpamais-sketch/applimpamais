import { ModernDonutChart } from '@/components/charts/ModernDonutChart';
import { MessageSquare } from 'lucide-react';

interface WhatsAppTypeChartProps {
  data: Record<string, number>;
}

const LABELS = {
  text: 'Texto',
  image: 'Imagem',
  audio: 'Áudio',
  ptt: 'Nota de Voz',
};

export function WhatsAppTypeChart({ data }: WhatsAppTypeChartProps) {
  const chartData = Object.entries(data).map(([tipo, count]) => ({
    name: LABELS[tipo as keyof typeof LABELS] || tipo,
    value: count,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ModernDonutChart
      title="Tipos de Mensagem"
      description="Distribuição por tipo de conteúdo"
      data={chartData}
      centerIcon={MessageSquare}
      centerText={total.toString()}
      centerSubtext="mensagens"
      colorScheme="blue"
    />
  );
}
