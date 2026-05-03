import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, startOfMonth } from 'date-fns';
import { STATUS_RECEITA_REALIZADA } from '@/utils/statusHelpers';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface MarketingROASStats {
  pixelViews: number;
  pixelAddToCart: number;
  pixelCheckout: number;
  pixelPurchases: number;
  pixelRevenue: number;
  agendamentosCriados: number;
  agendamentosConfirmados: number;
  agendamentosEmAndamento: number;
  agendamentosConcluidos: number;
  agendamentosPagos: number;
  agendamentosCancelados: number;
  agendamentosReembolsados: number;
  investimentoAds: number;
  faturamentoEsperado: number;
  faturamentoReal: number;
  valorReembolsado: number;
  valorPendente: number;
  lucroEstimado: number;
  roas: number;
  cpa: number;
  taxaRealizacao: number;
  taxaCancelamento: number;
  ticketMedio: number;
}

import type { PeriodType } from '@/components/admin/PeriodFilter';
import { usePeriodDateRange } from './usePeriodDateRange';

export function useMarketingROAS(
  period: PeriodType = '7dias',
  customRange?: { start: Date; end: Date }
) {
  const dateRange = usePeriodDateRange(period, customRange);
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['marketing-roas', period, tenantId, customRange?.start?.toISOString(), customRange?.end?.toISOString()],
    enabled: !!tenantId,
    queryFn: async () => {
      const start = dateRange 
        ? startOfDay(dateRange.start).toISOString()
        : subDays(new Date(), 365).toISOString();
      
      const end = dateRange 
        ? endOfDay(dateRange.end).toISOString()
        : endOfDay(new Date()).toISOString();

      // 1. Buscar eventos do Pixel
      const { data: pixelEvents } = await supabase
        .from('pixel_events')
        .select('event_type, value')
        .eq('tenant_id', tenantId!)
        .gte('event_time', start)
        .lte('event_time', end);

      const pixelViews = pixelEvents?.filter(e => e.event_type === 'PageView').length || 0;
      const pixelAddToCart = pixelEvents?.filter(e => e.event_type === 'AddToCart').length || 0;
      const pixelCheckout = pixelEvents?.filter(e => e.event_type === 'InitiateCheckout').length || 0;
      const pixelPurchases = pixelEvents?.filter(e => e.event_type === 'Purchase').length || 0;
      const pixelRevenue = pixelEvents
        ?.filter(e => e.event_type === 'Purchase')
        .reduce((sum, e) => sum + (Number(e.value) || 0), 0) || 0;

      // 2. Buscar agendamentos com filtro de tenant
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('status, valor_total, created_at')
        .eq('tenant_id', tenantId!)
        .gte('created_at', start)
        .lte('created_at', end);

      // Total criados = TODOS os agendamentos no período (independente do status atual)
      const agendamentosCriados = agendamentos?.length || 0;
      const agendamentosConfirmados = agendamentos?.filter(a => a.status === 'confirmado').length || 0;
      const agendamentosEmAndamento = agendamentos?.filter(a => a.status === 'em_andamento').length || 0;
      const agendamentosConcluidos = agendamentos?.filter(a => a.status === 'concluido').length || 0;
      const agendamentosPagos = agendamentos?.filter(a => a.status === 'pago').length || 0;
      const agendamentosCancelados = agendamentos?.filter(a => a.status === 'cancelado').length || 0;
      const agendamentosReembolsados = agendamentos?.filter(a => a.status === 'reembolsado').length || 0;

      // Faturamento Real (SOMENTE concluído + pago)
      const faturamentoReal = agendamentos
        ?.filter(a => STATUS_RECEITA_REALIZADA.includes(a.status))
        .reduce((sum, a) => sum + (Number(a.valor_total) || 0), 0) || 0;

      // Valor Reembolsado
      const valorReembolsado = agendamentos
        ?.filter(a => a.status === 'reembolsado')
        .reduce((sum, a) => sum + (Number(a.valor_total) || 0), 0) || 0;

      // Valor Pendente (pendente + confirmado + em_andamento)
      const valorPendente = agendamentos
        ?.filter(a => ['pendente', 'confirmado', 'em_andamento'].includes(a.status))
        .reduce((sum, a) => sum + (Number(a.valor_total) || 0), 0) || 0;

      // 3. Buscar investimento em Ads (priorizar UTMify se ativo)
      let investimentoAds = 0;
      let utmifyActive = false;

      const { data: utmifyResumos } = await supabase
        .from('utmify_campanhas_resumo' as any)
        .select('custo_ads, total_valor')
        .gte('periodo', start.split('T')[0])
        .lte('periodo', end.split('T')[0]);

      if (utmifyResumos && utmifyResumos.length > 0) {
        utmifyActive = true;
        investimentoAds = (utmifyResumos as any[]).reduce((sum, r) => sum + (Number(r.custo_ads) || 0), 0);
      }

      if (!utmifyActive) {
        const now = new Date();
        const mesAtual = startOfMonth(now);
        const { data: investimentoConfig } = await supabase
          .from('marketing_investimentos')
          .select('*')
          .eq('mes_referencia', mesAtual.toISOString().split('T')[0])
          .maybeSingle();

        if (investimentoConfig) {
          if (investimentoConfig.usar_despesas_automatico) {
            const { data: despesas } = await supabase
              .from('despesas')
              .select('valor')
              .eq('tenant_id', tenantId!)
              .eq('categoria', 'marketing')
              .gte('data_despesa', start.split('T')[0])
              .lte('data_despesa', end.split('T')[0]);

            investimentoAds = despesas?.reduce((sum, d) => sum + Number(d.valor), 0) || 0;
          } else {
            investimentoAds = Number(investimentoConfig.valor_investido) || 0;
          }
        }
      }

      // Calcular indicadores
      const faturamentoEsperado = pixelRevenue;
      const lucroEstimado = faturamentoReal - investimentoAds;
      const roas = investimentoAds > 0 ? faturamentoReal / investimentoAds : 0;
      const cpa = pixelPurchases > 0 ? investimentoAds / pixelPurchases : 0;
      
      const totalPagos = agendamentosConcluidos + agendamentosPagos;
      const taxaRealizacao = agendamentosCriados > 0 
        ? (totalPagos / agendamentosCriados) * 100 
        : 0;
      
      const taxaCancelamento = agendamentosCriados > 0 
        ? (agendamentosCancelados / agendamentosCriados) * 100 
        : 0;
      
      const ticketMedio = totalPagos > 0 ? faturamentoReal / totalPagos : 0;

      const stats: MarketingROASStats = {
        pixelViews,
        pixelAddToCart,
        pixelCheckout,
        pixelPurchases,
        pixelRevenue,
        agendamentosCriados,
        agendamentosConfirmados,
        agendamentosEmAndamento,
        agendamentosConcluidos,
        agendamentosPagos,
        agendamentosCancelados,
        agendamentosReembolsados,
        investimentoAds,
        faturamentoEsperado,
        faturamentoReal,
        valorReembolsado,
        valorPendente,
        lucroEstimado,
        roas,
        cpa,
        taxaRealizacao,
        taxaCancelamento,
        ticketMedio,
      };

      return stats;
    },
    refetchInterval: 30000,
  });
}
