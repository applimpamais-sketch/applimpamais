import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PeriodType } from '@/components/admin/PeriodFilter';
import { usePeriodDateRange } from './usePeriodDateRange';
import { startOfDay, endOfDay, getHours } from 'date-fns';
import { useTenantContext } from './useTenantContext';

export interface HourlySales {
  hour: string;
  vendas: number;
  valor: number;
}

export interface PlatformBreakdown {
  name: string;
  value: number;
  count: number;
}

export interface CampaignRow {
  campanha: string;
  vendas: number;
  valor: number;
  custo: number;
  roas: number;
  cpa: number;
}

export interface UtmifyDashboardData {
  // KPIs principais
  faturamentoLiquido: number;
  gastosAnuncios: number;
  lucro: number;
  roas: number;
  margem: number;
  // KPIs secundários
  arpu: number;
  vendasPendentes: number;
  cpa: number;
  impostoMeta: number;
  totalVendas: number;
  totalReembolsos: number;
  valorReembolsos: number;
  // Charts
  vendasPorHora: HourlySales[];
  vendasPorPlataforma: PlatformBreakdown[];
  // Table
  campanhas: CampaignRow[];
  isActive: boolean;
}

export function useUtmifyDashboard(
  period: PeriodType = '7dias',
  customRange?: { start: Date; end: Date }
) {
  const dateRange = usePeriodDateRange(period, customRange);
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['utmify-dashboard', tenantId, period, customRange?.start?.toISOString()],
    queryFn: async (): Promise<UtmifyDashboardData> => {
      const empty: UtmifyDashboardData = {
        faturamentoLiquido: 0, gastosAnuncios: 0, lucro: 0, roas: 0, margem: 0,
        arpu: 0, vendasPendentes: 0, cpa: 0, impostoMeta: 0,
        totalVendas: 0, totalReembolsos: 0, valorReembolsos: 0,
        vendasPorHora: [], vendasPorPlataforma: [], campanhas: [],
        isActive: false,
      };

      if (!tenantId) return empty;

      // Check if UTMify is active
      const { data: integracao } = await supabase
        .from('integracoes' as any)
        .select('status')
        .eq('tenant_id', tenantId)
        .eq('tipo', 'utmify')
        .eq('status', 'ativo')
        .maybeSingle();

      if (!integracao) return empty;

      const start = dateRange ? startOfDay(dateRange.start).toISOString() : '2020-01-01T00:00:00Z';
      const end = dateRange ? endOfDay(dateRange.end).toISOString() : new Date().toISOString();
      const startDate = dateRange ? startOfDay(dateRange.start).toISOString().split('T')[0] : '2020-01-01';
      const endDate = dateRange ? endOfDay(dateRange.end).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      // Fetch events + campaign summaries in parallel
      const [eventsRes, resumosRes] = await Promise.all([
        supabase
          .from('utmify_events' as any)
          .select('*')
          .eq('tenant_id', tenantId)
          .gte('created_at', start)
          .lte('created_at', end)
          .order('created_at', { ascending: true }),
        supabase
          .from('utmify_campanhas_resumo' as any)
          .select('*')
          .eq('tenant_id', tenantId)
          .gte('periodo', startDate)
          .lte('periodo', endDate),
      ]);

      const events = (eventsRes.data || []) as any[];
      const resumos = (resumosRes.data || []) as any[];

      // Process events for hourly chart + platform breakdown
      const hourlyMap = new Map<number, { vendas: number; valor: number }>();
      const platformMap = new Map<string, { value: number; count: number }>();
      let vendasPendentes = 0;

      for (const e of events) {
        const status = (e.status || '').toLowerCase();
        const valor = Number(e.valor) || 0;
        const hora = new Date(e.created_at).getHours();

        // Hourly
        if (['pago', 'completo', 'approved', 'completed'].includes(status)) {
          const h = hourlyMap.get(hora) || { vendas: 0, valor: 0 };
          h.vendas += 1;
          h.valor += valor;
          hourlyMap.set(hora, h);

          // Platform
          const plat = e.plataforma || e.utm_source || 'Direto';
          const p = platformMap.get(plat) || { value: 0, count: 0 };
          p.value += valor;
          p.count += 1;
          platformMap.set(plat, p);
        }

        if (['pendente', 'aguardando', 'waiting_payment', 'pending'].includes(status)) {
          vendasPendentes += valor;
        }
      }

      const vendasPorHora: HourlySales[] = Array.from({ length: 24 }, (_, i) => {
        const h = hourlyMap.get(i) || { vendas: 0, valor: 0 };
        return { hour: `${String(i).padStart(2, '0')}h`, vendas: h.vendas, valor: h.valor };
      });

      const vendasPorPlataforma: PlatformBreakdown[] = Array.from(platformMap.entries())
        .map(([name, d]) => ({ name, value: d.value, count: d.count }))
        .sort((a, b) => b.value - a.value);

      // Campaign aggregation from resumos
      const campanhaMap = new Map<string, CampaignRow>();
      for (const r of resumos) {
        const existing = campanhaMap.get(r.campanha) || {
          campanha: r.campanha, vendas: 0, valor: 0, custo: 0, roas: 0, cpa: 0,
        };
        existing.vendas += r.total_vendas || 0;
        existing.valor += Number(r.total_valor) || 0;
        existing.custo += Number(r.custo_ads) || 0;
        campanhaMap.set(r.campanha, existing);
      }

      const campanhas = Array.from(campanhaMap.values()).map(c => ({
        ...c,
        roas: c.custo > 0 ? c.valor / c.custo : 0,
        cpa: c.vendas > 0 ? c.custo / c.vendas : 0,
      })).sort((a, b) => b.valor - a.valor);

      // Totals
      const gastosAnuncios = campanhas.reduce((s, c) => s + c.custo, 0);
      const faturamentoBruto = campanhas.reduce((s, c) => s + c.valor, 0);
      const totalVendas = campanhas.reduce((s, c) => s + c.vendas, 0);
      
      // Reembolsos from resumos
      const valorReembolsos = resumos.reduce((s: number, r: any) => s + (Number(r.valor_reembolsos) || 0), 0);
      const totalReembolsos = resumos.reduce((s: number, r: any) => s + (r.total_reembolsos || 0), 0);

      const faturamentoLiquido = faturamentoBruto - valorReembolsos;
      const lucro = faturamentoLiquido - gastosAnuncios;
      const roas = gastosAnuncios > 0 ? faturamentoLiquido / gastosAnuncios : 0;
      const margem = faturamentoLiquido > 0 ? (lucro / faturamentoLiquido) * 100 : 0;
      const arpu = totalVendas > 0 ? faturamentoLiquido / totalVendas : 0;
      const cpa = totalVendas > 0 ? gastosAnuncios / totalVendas : 0;
      const impostoMeta = gastosAnuncios * 0.125;

      return {
        faturamentoLiquido, gastosAnuncios, lucro, roas, margem,
        arpu, vendasPendentes, cpa, impostoMeta,
        totalVendas, totalReembolsos, valorReembolsos,
        vendasPorHora, vendasPorPlataforma, campanhas,
        isActive: true,
      };
    },
    refetchInterval: 60000,
    enabled: !!tenantId,
  });
}
