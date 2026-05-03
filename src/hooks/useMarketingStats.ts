import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface MarketingStats {
  totalLeads: number;
  leadsHoje: number;
  taxaConversao: number;
  custoAquisicao: number;
  roi: number;
  leadsPorCanal: Array<{ canal: string; total: number }>;
  funnelData: {
    visitantes: number;
    carrinhosIniciados: number;
    carrinhosAbandonados: number;
    agendamentos: number;
    pagamentos: number;
  };
  evolucaoMensal: Array<{
    mes: string;
    leads: number;
    conversoes: number;
    investimento: number;
  }>;
}

export function useMarketingStats() {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['marketing-stats', tenantId],
    queryFn: async (): Promise<MarketingStats> => {
      // SEGURANÇA: Não executar sem tenant
      if (!tenantId) {
        throw new Error('[SECURITY] Query marketing-stats sem tenantId');
      }

      const hoje = new Date();
      const inicioMes = startOfMonth(hoje);
      const fimMes = endOfMonth(hoje);

      // Leads do mês - COM FILTRO TENANT
      const { data: leadsData } = await supabase
        .from('leads_cupom')
        .select('*')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .gte('created_at', inicioMes.toISOString())
        .lte('created_at', fimMes.toISOString());

      const totalLeads = leadsData?.length || 0;

      // Leads hoje - COM FILTRO TENANT
      const { data: leadsHoje } = await supabase
        .from('leads_cupom')
        .select('*')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .gte('created_at', new Date().setHours(0, 0, 0, 0));

      // Conversões (leads que viraram agendamentos)
      const conversoes = leadsData?.filter(l => l.converteu_em_agendamento).length || 0;
      const taxaConversao = totalLeads > 0 ? (conversoes / totalLeads) * 100 : 0;

      // Dados de funil - COM FILTRO TENANT
      const { data: sessions } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .gte('created_at', inicioMes.toISOString());

      const { data: carrinhos } = await supabase
        .from('carrinhos_abandonados')
        .select('*')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .gte('created_at', inicioMes.toISOString());

      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .gte('created_at', inicioMes.toISOString());

      const { data: pagamentos } = await supabase
        .from('pagamentos_agendamentos')
        .select('*')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .eq('status', 'pago')
        .gte('created_at', inicioMes.toISOString());

      // Leads por canal
      const leadsPorCanal = leadsData?.reduce((acc, lead) => {
        const canal = lead.origem || 'Direto';
        const existing = acc.find(c => c.canal === canal);
        if (existing) {
          existing.total++;
        } else {
          acc.push({ canal, total: 1 });
        }
        return acc;
      }, [] as Array<{ canal: string; total: number }>) || [];

      // Evolução mensal (últimos 6 meses) - COM FILTRO TENANT
      const evolucaoMensal = [];
      for (let i = 5; i >= 0; i--) {
        const mes = subMonths(hoje, i);
        const inicioMesDado = startOfMonth(mes);
        const fimMesDado = endOfMonth(mes);

        const { data: leadsDoMes } = await supabase
          .from('leads_cupom')
          .select('*')
          .eq('tenant_id', tenantId) // FILTRO TENANT
          .gte('created_at', inicioMesDado.toISOString())
          .lte('created_at', fimMesDado.toISOString());

        const conversoesMes = leadsDoMes?.filter(l => l.converteu_em_agendamento).length || 0;

        evolucaoMensal.push({
          mes: mes.toLocaleDateString('pt-BR', { month: 'short' }),
          leads: leadsDoMes?.length || 0,
          conversoes: conversoesMes,
          investimento: 0, // TODO: Integrar com dados de anúncios
        });
      }

      return {
        totalLeads,
        leadsHoje: leadsHoje?.length || 0,
        taxaConversao,
        custoAquisicao: 0, // TODO: Calcular quando houver dados de investimento
        roi: 0, // TODO: Calcular ROI real
        leadsPorCanal,
        funnelData: {
          visitantes: sessions?.length || 0,
          carrinhosIniciados: carrinhos?.length || 0,
          carrinhosAbandonados: carrinhos?.filter(c => c.status === 'abandonado').length || 0,
          agendamentos: agendamentos?.length || 0,
          pagamentos: pagamentos?.length || 0,
        },
        evolucaoMensal,
      };
    },
    enabled: !!tenantId, // Só executar se tiver tenant
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}
