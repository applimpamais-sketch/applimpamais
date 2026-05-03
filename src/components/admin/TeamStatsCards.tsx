import { Shield, User, Eye, Users, Wrench, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamStats } from '@/hooks/useTeamStats';

interface TeamStatsCardsProps {
  stats?: TeamStats;
  isLoading: boolean;
  tecnicosCount?: number;
  funcionariosBotCount?: number;
}

export default function TeamStatsCards({ 
  stats, 
  isLoading, 
  tecnicosCount = 0,
  funcionariosBotCount = 0 
}: TeamStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const membrosTotal = (stats?.admins || 0) + (stats?.operadores || 0) + (stats?.visualizadores || 0);
  const totalGeral = membrosTotal + tecnicosCount + funcionariosBotCount;

  const cards = [
    {
      title: 'Total Geral',
      value: totalGeral,
      icon: Users,
      iconColor: 'text-primary',
    },
    {
      title: 'Membros Dashboard',
      value: membrosTotal,
      icon: Shield,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Técnicos',
      value: tecnicosCount,
      icon: Wrench,
      iconColor: 'text-orange-500',
    },
    {
      title: 'Funcionários Bot',
      value: funcionariosBotCount,
      icon: MessageSquare,
      iconColor: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="backdrop-blur-md bg-background/60 border border-border/50 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
