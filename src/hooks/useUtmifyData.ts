import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PeriodType } from '@/components/admin/PeriodFilter';
import { usePeriodDateRange } from './usePeriodDateRange';
import { startOfDay, endOfDay } from 'date-fns';

export interface UtmifyCampaignData {
  campanha: string;
  totalVendas: number;
  totalValor: number;
  totalReembolsos: number;
  valorReembolsos: number;
  custoAds: number;
  roas: number;
  cpa: number;
}

export interface UtmifySummary {
  investimentoTotal: number;
  faturamentoTotal: number;
  reembolsoTotal: number;
  roas: number;
  cpa: number;
  totalVendas: number;
  campanhas: UtmifyCampaignData[];
  isActive: boolean;
}

export function useUtmifyData(
  period: PeriodType = '7dias',
  customRange?: { start: Date; end: Date }
) {
  const dateRange = usePeriodDateRange(period, customRange);

  return useQuery({
    queryKey: ['utmify-data', period, customRange?.start?.toISOString()],
    queryFn: async (): Promise<UtmifySummary> => {
      // Check if UTMify is active
      const { data: integracao } = await supabase
        .from('integracoes' as any)
        .select('status')
        .eq('tipo', 'utmify')
        .eq('status', 'ativo')
        .maybeSingle();

      if (!integracao) {
        return {
          investimentoTotal: 0,
          faturamentoTotal: 0,
          reembolsoTotal: 0,
          roas: 0,
          cpa: 0,
          totalVendas: 0,
          campanhas: [],
          isActive: false,
        };
      }

      const start = dateRange ? startOfDay(dateRange.start).toISOString().split('T')[0] : '2020-01-01';
      const end = dateRange ? endOfDay(dateRange.end).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      // Fetch campaign summaries
      const { data: resumos } = await supabase
        .from('utmify_campanhas_resumo' as any)
        .select('*')
        .gte('periodo', start)
        .lte('periodo', end)
        .order('total_valor', { ascending: false });

      if (!resumos || resumos.length === 0) {
        return {
          investimentoTotal: 0,
          faturamentoTotal: 0,
          reembolsoTotal: 0,
          roas: 0,
          cpa: 0,
          totalVendas: 0,
          campanhas: [],
          isActive: true,
        };
      }

      // Aggregate by campaign
      const campanhaMap = new Map<string, UtmifyCampaignData>();

      for (const r of resumos as any[]) {
        const existing = campanhaMap.get(r.campanha) || {
          campanha: r.campanha,
          totalVendas: 0,
          totalValor: 0,
          totalReembolsos: 0,
          valorReembolsos: 0,
          custoAds: 0,
          roas: 0,
          cpa: 0,
        };

        existing.totalVendas += r.total_vendas || 0;
        existing.totalValor += Number(r.total_valor) || 0;
        existing.totalReembolsos += r.total_reembolsos || 0;
        existing.valorReembolsos += Number(r.valor_reembolsos) || 0;
        existing.custoAds += Number(r.custo_ads) || 0;
        campanhaMap.set(r.campanha, existing);
      }

      const campanhas = Array.from(campanhaMap.values()).map(c => ({
        ...c,
        roas: c.custoAds > 0 ? c.totalValor / c.custoAds : 0,
        cpa: c.totalVendas > 0 ? c.custoAds / c.totalVendas : 0,
      }));

      const investimentoTotal = campanhas.reduce((s, c) => s + c.custoAds, 0);
      const faturamentoTotal = campanhas.reduce((s, c) => s + c.totalValor, 0);
      const reembolsoTotal = campanhas.reduce((s, c) => s + c.valorReembolsos, 0);
      const totalVendas = campanhas.reduce((s, c) => s + c.totalVendas, 0);

      return {
        investimentoTotal,
        faturamentoTotal,
        reembolsoTotal,
        roas: investimentoTotal > 0 ? faturamentoTotal / investimentoTotal : 0,
        cpa: totalVendas > 0 ? investimentoTotal / totalVendas : 0,
        totalVendas,
        campanhas,
        isActive: true,
      };
    },
    refetchInterval: 60000,
  });
}
