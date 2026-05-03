import DashboardKPICard from './DashboardKPICard';
import { Smartphone, CheckCircle2, Send, Activity } from 'lucide-react';

interface PushStatsCardsProps {
  totalDispositivos: number;
  taxaEntrega: number;
  notificacoesEnviadas: number;
  dispositivosAtivos: number;
}

export default function PushStatsCards({
  totalDispositivos,
  taxaEntrega,
  notificacoesEnviadas,
  dispositivosAtivos
}: PushStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardKPICard
        title="Dispositivos Inscritos"
        value={totalDispositivos}
        icon={Smartphone}
      />
      <DashboardKPICard
        title="Taxa de Entrega"
        value={`${taxaEntrega.toFixed(1)}%`}
        icon={CheckCircle2}
      />
      <DashboardKPICard
        title="Notificações Enviadas"
        value={notificacoesEnviadas}
        icon={Send}
      />
      <DashboardKPICard
        title="Ativos Hoje"
        value={dispositivosAtivos}
        icon={Activity}
      />
    </div>
  );
}
