import { FileText, DollarSign, Clock, Archive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface NotaFiscalStatsCardsProps {
  stats: {
    totalEmitidas: number;
    totalPendentes: number;
    valorFaturado: number;
    totalNotas: number;
  } | undefined;
  isLoading: boolean;
}

export default function NotaFiscalStatsCards({ stats, isLoading }: NotaFiscalStatsCardsProps) {
  const cards = [
    {
      title: 'Notas Emitidas (Mês)',
      value: stats?.totalEmitidas ?? 0,
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Valor Faturado (Mês)',
      value: stats?.valorFaturado ?? 0,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      isCurrency: true,
    },
    {
      title: 'Pendentes de Emissão',
      value: stats?.totalPendentes ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Total de Notas',
      value: stats?.totalNotas ?? 0,
      icon: Archive,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold mt-1">
                  {card.isCurrency
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(card.value)
                    : card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
