import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';
import { subDays } from 'date-fns';

export type HistoryPeriod = '7d' | '30d' | '90d';

interface FunnelData {
  views: number;
  addToCart: number;
  checkout: number;
  purchases: number;
  viewToCartRate: number;
  cartToCheckoutRate: number;
  checkoutToPurchaseRate: number;
  overallRate: number;
}

interface ProductData {
  nome: string;
  quantidade: number;
  receita: number;
  imagem?: string;
}

interface LocationData {
  cidade: string;
  estado: string;
  count: number;
  percentual: number;
}

interface SegmentationData {
  novos: number;
  recorrentes: number;
  percentualNovos: number;
  percentualRecorrentes: number;
  ticketMedioNovos: number;
  ticketMedioRecorrentes: number;
  taxaRecompra: number;
}

interface LiveViewHistoryStats {
  funnel: FunnelData;
  topProducts: ProductData[];
  topLocations: LocationData[];
  segmentation: SegmentationData;
}

export function useLiveViewHistory(period: HistoryPeriod = '30d') {
  const { tenantId } = useTenantContext();
  const [stats, setStats] = useState<LiveViewHistoryStats>({
    funnel: {
      views: 0,
      addToCart: 0,
      checkout: 0,
      purchases: 0,
      viewToCartRate: 0,
      cartToCheckoutRate: 0,
      checkoutToPurchaseRate: 0,
      overallRate: 0,
    },
    topProducts: [],
    topLocations: [],
    segmentation: {
      novos: 0,
      recorrentes: 0,
      percentualNovos: 0,
      percentualRecorrentes: 0,
      ticketMedioNovos: 0,
      ticketMedioRecorrentes: 0,
      taxaRecompra: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  const getPeriodDays = (p: HistoryPeriod): number => {
    switch (p) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  const loadHistoryStats = useCallback(async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const days = getPeriodDays(period);
      const startDate = subDays(new Date(), days).toISOString();

      // 1. Buscar dados do funil via pixel_events
      const { data: pixelEvents } = await supabase
        .from('pixel_events' as any)
        .select('event_type')
        .gte('created_at', startDate) as any;

      const eventCounts = {
        ViewContent: 0,
        AddToCart: 0,
        InitiateCheckout: 0,
        Purchase: 0,
      };

      pixelEvents?.forEach((e: any) => {
        if (e.event_type in eventCounts) {
          eventCounts[e.event_type as keyof typeof eventCounts]++;
        }
      });

      const funnel: FunnelData = {
        views: eventCounts.ViewContent,
        addToCart: eventCounts.AddToCart,
        checkout: eventCounts.InitiateCheckout,
        purchases: eventCounts.Purchase,
        viewToCartRate: eventCounts.ViewContent > 0 
          ? (eventCounts.AddToCart / eventCounts.ViewContent) * 100 : 0,
        cartToCheckoutRate: eventCounts.AddToCart > 0 
          ? (eventCounts.InitiateCheckout / eventCounts.AddToCart) * 100 : 0,
        checkoutToPurchaseRate: eventCounts.InitiateCheckout > 0 
          ? (eventCounts.Purchase / eventCounts.InitiateCheckout) * 100 : 0,
        overallRate: eventCounts.ViewContent > 0 
          ? (eventCounts.Purchase / eventCounts.ViewContent) * 100 : 0,
      };

      // 2. Buscar produtos mais vendidos via agendamentos
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('itens_carrinho, valor_total, cidade, telefone')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate);

      // Agrupar produtos
      const produtosMap = new Map<string, { quantidade: number; receita: number; imagem?: string }>();
      agendamentos?.forEach((a: any) => {
        const itens = a.itens_carrinho as any[];
        itens?.forEach((item: any) => {
          const nome = item.name || 'Desconhecido';
          const existing = produtosMap.get(nome);
          const imagem = item.image || item.img || item.imagem;
          const quantidade = item.quantity || 1;
          const preco = item.price || 0;
          
          if (existing) {
            existing.quantidade += quantidade;
            existing.receita += preco * quantidade;
            if (!existing.imagem && imagem) {
              existing.imagem = imagem;
            }
          } else {
            produtosMap.set(nome, { 
              quantidade, 
              receita: preco * quantidade,
              imagem 
            });
          }
        });
      });

      const topProducts: ProductData[] = Array.from(produtosMap.entries())
        .map(([nome, data]) => ({
          nome,
          quantidade: data.quantidade,
          receita: data.receita,
          imagem: data.imagem,
        }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

      // 3. Agrupar por cidade
      const cidadesMap = new Map<string, number>();
      agendamentos?.forEach((a: any) => {
        const cidade = a.cidade || 'Desconhecido';
        cidadesMap.set(cidade, (cidadesMap.get(cidade) || 0) + 1);
      });

      const totalAgendamentos = agendamentos?.length || 0;
      const topLocations: LocationData[] = Array.from(cidadesMap.entries())
        .map(([cidade, count]) => ({
          cidade,
          estado: 'MG', // Default, podemos melhorar depois
          count,
          percentual: totalAgendamentos > 0 ? (count / totalAgendamentos) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 4. Segmentação de clientes
      // Buscar todos os telefones anteriores ao período
      const { data: allAgendamentos } = await supabase
        .from('agendamentos')
        .select('telefone, valor_total, created_at')
        .eq('tenant_id', tenantId);

      const telefonesAnteriores = new Set<string>();
      const telefonesNoPeriodo = new Map<string, { count: number; total: number }>();

      allAgendamentos?.forEach((a: any) => {
        const isNoPeriodo = new Date(a.created_at) >= subDays(new Date(), days);
        
        if (isNoPeriodo && a.telefone) {
          const existing = telefonesNoPeriodo.get(a.telefone);
          if (existing) {
            existing.count++;
            existing.total += Number(a.valor_total) || 0;
          } else {
            telefonesNoPeriodo.set(a.telefone, { 
              count: 1, 
              total: Number(a.valor_total) || 0 
            });
          }
        } else if (a.telefone) {
          telefonesAnteriores.add(a.telefone);
        }
      });

      let novos = 0;
      let recorrentes = 0;
      let totalNovos = 0;
      let totalRecorrentes = 0;

      telefonesNoPeriodo.forEach((data, telefone) => {
        if (telefonesAnteriores.has(telefone)) {
          recorrentes++;
          totalRecorrentes += data.total;
        } else {
          novos++;
          totalNovos += data.total;
        }
      });

      const totalClientes = novos + recorrentes;
      const segmentation: SegmentationData = {
        novos,
        recorrentes,
        percentualNovos: totalClientes > 0 ? (novos / totalClientes) * 100 : 0,
        percentualRecorrentes: totalClientes > 0 ? (recorrentes / totalClientes) * 100 : 0,
        ticketMedioNovos: novos > 0 ? totalNovos / novos : 0,
        ticketMedioRecorrentes: recorrentes > 0 ? totalRecorrentes / recorrentes : 0,
        taxaRecompra: totalClientes > 0 ? (recorrentes / totalClientes) * 100 : 0,
      };

      setStats({
        funnel,
        topProducts,
        topLocations,
        segmentation,
      });
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId, period]);

  useEffect(() => {
    loadHistoryStats();
  }, [loadHistoryStats]);

  return { stats, loading, refresh: loadHistoryStats };
}
