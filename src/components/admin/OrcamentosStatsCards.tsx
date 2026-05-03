import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Send, CheckCircle2, DollarSign } from 'lucide-react';

interface OrcamentosStatsCardsProps {
  stats: {
    total: number;
    totalMes: number;
    rascunhos: number;
    enviados: number;
    aprovados: number;
    recusados: number;
    valorTotalAprovados: number;
    valorTotalMes: number;
  } | undefined;
  isLoading: boolean;
}

export function OrcamentosStatsCards({ stats, isLoading }: OrcamentosStatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const cards = [
    {
      title: 'Orçamentos (Mês)',
      value: stats?.totalMes || 0,
      subtitle: `${stats?.total || 0} total`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Enviados',
      value: stats?.enviados || 0,
      subtitle: 'Aguardando resposta',
      icon: Send,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Aprovados',
      value: stats?.aprovados || 0,
      subtitle: `${stats?.recusados || 0} recusados`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Valor Aprovado',
      value: formatCurrency(stats?.valorTotalAprovados || 0),
      subtitle: formatCurrency(stats?.valorTotalMes || 0) + ' no mês',
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      isValue: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.isValue ? '' : ''}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
