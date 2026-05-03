import { MapPin, Clock, CheckCircle, Navigation, Route } from 'lucide-react';
import DashboardKPICard from './DashboardKPICard';
import type { TrackingMetrics } from '@/hooks/useTrackingHistory';

interface TrackingKPICardsProps {
  metrics: TrackingMetrics | undefined;
  isLoading: boolean;
}

export default function TrackingKPICards({ metrics, isLoading }: TrackingKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <DashboardKPICard
        title="Total de Trajetos"
        value={metrics?.totalSessoes ?? 0}
        icon={MapPin}
      />
      <DashboardKPICard
        title="Tempo Médio"
        value={`${metrics?.tempoMedioMinutos ?? 0} min`}
        icon={Clock}
      />
      <DashboardKPICard
        title="Distância Média"
        value={`${metrics?.distanciaMediaKm?.toFixed(1) ?? 0} km`}
        icon={Route}
      />
      <DashboardKPICard
        title="Taxa de Pontualidade"
        value={`${metrics?.taxaPontualidade ?? 0}%`}
        icon={CheckCircle}
      />
      <DashboardKPICard
        title="Em Andamento"
        value={metrics?.sessoesAtivas ?? 0}
        icon={Navigation}
      />
    </div>
  );
}
