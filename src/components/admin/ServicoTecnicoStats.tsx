import { Card } from '@/components/ui/card';
import { MeuServico } from '@/hooks/useMeusServicos';
import { formatCurrency } from '@/utils/format';
import { CalendarDays, Play, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServicoTecnicoStatsProps {
  servicos: MeuServico[];
}

export default function ServicoTecnicoStats({ servicos }: ServicoTecnicoStatsProps) {
  const hoje = new Date().toISOString().split('T')[0];

  const stats = {
    hoje: {
      count: servicos.filter((s) => s.data_agendamento === hoje).length,
      valor: servicos
        .filter((s) => s.data_agendamento === hoje)
        .reduce((sum, s) => sum + Number(s.valor_total || 0), 0),
    },
    emAndamento: {
      count: servicos.filter((s) => s.status === 'em_andamento').length,
      valor: servicos
        .filter((s) => s.status === 'em_andamento')
        .reduce((sum, s) => sum + Number(s.valor_total || 0), 0),
    },
    pendentes: {
      count: servicos.filter((s) => s.status === 'confirmado').length,
      valor: servicos
        .filter((s) => s.status === 'confirmado')
        .reduce((sum, s) => sum + Number(s.valor_total || 0), 0),
    },
    concluidos: {
      count: servicos.filter((s) => ['concluido', 'pago'].includes(s.status)).length,
      valor: servicos
        .filter((s) => ['concluido', 'pago'].includes(s.status))
        .reduce((sum, s) => sum + Number(s.valor_total || 0), 0),
    },
  };

  const statCards = [
    {
      label: 'Hoje',
      count: stats.hoje.count,
      valor: stats.hoje.valor,
      icon: CalendarDays,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/30',
      borderColor: 'border-violet-200/50 dark:border-violet-800/50',
      iconBg: 'bg-violet-100 dark:bg-violet-900/50',
    },
    {
      label: 'Em Andamento',
      count: stats.emAndamento.count,
      valor: stats.emAndamento.valor,
      icon: Play,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200/50 dark:border-blue-800/50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      label: 'Pendentes',
      count: stats.pendentes.count,
      valor: stats.pendentes.valor,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200/50 dark:border-orange-800/50',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    },
    {
      label: 'Concluídos',
      count: stats.concluidos.count,
      valor: stats.concluidos.valor,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200/50 dark:border-green-800/50',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={cn(
              "p-4 border transition-all hover:shadow-md",
              stat.bgColor,
              stat.borderColor
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", stat.iconBg)}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {stat.label}
                </p>
                <p className={cn("text-2xl font-bold", stat.color)}>
                  {stat.count}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {formatCurrency(stat.valor)}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
