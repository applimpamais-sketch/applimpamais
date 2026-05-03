import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SaasDashboardMetrics {
  mrr: number;
  clientes_ativos: number;
  clientes_trial: number;
  clientes_inadimplentes: number;
  churn_mes: number;
  trials_expirando: number;
  mrr_starter: number;
  mrr_professional: number;
  mrr_enterprise: number;
  total_tenants: number;
}

interface MRRHistorico {
  mes: string;
  mrr: number;
}

export function useSaasMetrics() {
  // Métricas do dashboard
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['saas-dashboard-metrics'],
    queryFn: async (): Promise<SaasDashboardMetrics> => {
      const { data, error } = await supabase
        .from('vw_saas_dashboard')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as SaasDashboardMetrics;
    },
  });

  // Histórico de MRR (últimos 12 meses)
  const { data: mrrHistorico, isLoading: mrrLoading } = useQuery({
    queryKey: ['saas-mrr-historico'],
    queryFn: async (): Promise<MRRHistorico[]> => {
      const { data, error } = await supabase
        .from('saas_subscriptions')
        .select('mes_referencia, valor')
        .eq('status', 'pago')
        .gte('mes_referencia', new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0])
        .order('mes_referencia', { ascending: true });
      
      if (error) throw error;

      // Agrupar por mês
      const mrrPorMes = (data || []).reduce((acc, item) => {
        const mes = item.mes_referencia;
        if (!acc[mes]) acc[mes] = 0;
        acc[mes] += Number(item.valor) || 0;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(mrrPorMes).map(([mes, mrr]) => ({
        mes: new Date(mes).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        mrr,
      }));
    },
  });

  // Taxa de churn calculada
  const churnRate = metrics ? 
    metrics.total_tenants > 0 
      ? ((metrics.churn_mes / metrics.total_tenants) * 100).toFixed(1)
      : '0.0'
    : '0.0';

  return {
    metrics: metrics || {
      mrr: 0,
      clientes_ativos: 0,
      clientes_trial: 0,
      clientes_inadimplentes: 0,
      churn_mes: 0,
      trials_expirando: 0,
      mrr_starter: 0,
      mrr_professional: 0,
      mrr_enterprise: 0,
      total_tenants: 0,
    },
    mrrHistorico: mrrHistorico || [],
    churnRate,
    isLoading: metricsLoading || mrrLoading,
    refetch: refetchMetrics,
  };
}
