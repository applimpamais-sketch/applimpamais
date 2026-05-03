import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface StatsHeaderProps {
  statsHoje: {
    total: number;
    valor: number;
    concluidos: number;
    pendentes: number;
  };
  statsSemana: {
    total: number;
    valor: number;
  };
  statsMes: {
    total: number;
    valor: number;
  };
  loading?: boolean;
}

export default function AgendamentosStatsHeader({ statsHoje, statsSemana, statsMes, loading }: StatsHeaderProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Hoje',
      value: statsHoje.total,
      subtitle: formatCurrency(statsHoje.valor),
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950'
    },
    {
      title: 'Concluídos Hoje',
      value: statsHoje.concluidos,
      subtitle: `${statsHoje.pendentes} pendentes`,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950'
    },
    {
      title: 'Esta Semana',
      value: statsSemana.total,
      subtitle: formatCurrency(statsSemana.valor),
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950'
    },
    {
      title: 'Este Mês',
      value: statsMes.total,
      subtitle: formatCurrency(statsMes.valor),
      icon: DollarSign,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50 p-3 sm:p-4 md:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{stat.title}</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.subtitle}</p>
              </div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
