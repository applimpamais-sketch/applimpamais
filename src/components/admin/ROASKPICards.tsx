import { TrendingUp, DollarSign, Target, Wallet, TrendingDown } from 'lucide-react';
import DashboardKPICard from './DashboardKPICard';
import { formatCurrency } from '@/utils/dashboardHelpers';
import type { MarketingROASStats } from '@/hooks/useMarketingROAS';

interface ROASKPICardsProps {
  stats: MarketingROASStats | undefined;
  isLoading: boolean;
}

export default function ROASKPICards({ stats, isLoading }: ROASKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/20 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const roasFormatted = stats.roas > 0 ? `${stats.roas.toFixed(1)}x` : '0x';
  const roasColor = stats.roas >= 3 ? 'text-green-500' : stats.roas >= 2 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* ROAS */}
      <DashboardKPICard
        title="ROAS"
        value={roasFormatted}
        icon={stats.roas >= 2 ? TrendingUp : TrendingDown}
      />

      {/* CPA */}
      <DashboardKPICard
        title="CPA (Custo por Aquisição)"
        value={formatCurrency(stats.cpa)}
        icon={Target}
      />

      {/* Investimento */}
      <DashboardKPICard
        title="Investimento em Ads"
        value={formatCurrency(stats.investimentoAds)}
        icon={Wallet}
      />

      {/* Faturamento Real */}
      <DashboardKPICard
        title="Faturamento Real"
        value={formatCurrency(stats.faturamentoReal)}
        icon={DollarSign}
      />

      {/* Lucro Estimado */}
      <DashboardKPICard
        title="Lucro Estimado"
        value={formatCurrency(stats.lucroEstimado)}
        icon={stats.lucroEstimado >= 0 ? TrendingUp : TrendingDown}
      />
    </div>
  );
}
