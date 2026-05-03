import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';

interface LiveStats {
  visitantesAtivos: number;
  totalVendas: number;
  sessoesAtivas: number;
  pedidosHoje: number;
  carrinhosAtivos: number;
  noCheckout: number;
  comprasConcluidas: number;
  sessoesPorLocal: { cidade: string; estado: string; count: number }[];
  vendasPorProduto: { nome: string; total: number; imagem?: string }[];
  clientesNovos: number;
  clientesRecorrentes: number;
  sessoesPorHora: number[];
  pedidosPorHora: number[];
}

export function useLiveAnalytics() {
  const { tenantId } = useTenantContext();
  
  const [stats, setStats] = useState<LiveStats>({
    visitantesAtivos: 0,
    totalVendas: 0,
    sessoesAtivas: 0,
    pedidosHoje: 0,
    carrinhosAtivos: 0,
    noCheckout: 0,
    comprasConcluidas: 0,
    sessoesPorLocal: [],
    vendasPorProduto: [],
    clientesNovos: 0,
    clientesRecorrentes: 0,
    sessoesPorHora: [],
    pedidosPorHora: [],
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    // SEGURANÇA: Não executar sem tenant
    if (!tenantId) {
      console.warn('[useLiveAnalytics] Sem tenantId - ignorando');
      return;
    }

    try {
      // 1. Limpar sessões antigas (> 15 minutos sem atividade)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      await supabase
        .from('live_sessions' as any)
        .delete()
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .lt('ultima_atividade', fifteenMinutesAgo);

      // 2. Buscar sessões ativas (últimos 15 minutos) - COM FILTRO TENANT
      const { data: sessions } = await supabase
        .from('live_sessions' as any)
        .select('*')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .gte('ultima_atividade', fifteenMinutesAgo) as any;

      // 3. Buscar agendamentos de hoje - COM FILTRO TENANT
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: agendamentosHoje } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .gte('created_at', today.toISOString());

      // 4. Calcular métricas
      const visitantesAtivos = sessions?.length || 0;
      const sessoesAtivas = sessions?.length || 0;
      
      // Carrinhos ativos: detectar por carrinho_items > 0 OU etapa = 'carrinho'
      const carrinhosAtivos = sessions?.filter((s: any) => 
        s.carrinho_items > 0 || s.etapa === 'carrinho'
      ).length || 0;
      
      const noCheckout = sessions?.filter((s: any) => s.etapa === 'checkout').length || 0;
      const comprasConcluidas = agendamentosHoje?.filter(a => a.status === 'concluido').length || 0;
      const pedidosHoje = agendamentosHoje?.length || 0;
      const totalVendas = agendamentosHoje?.reduce((sum, a) => sum + Number(a.valor_total), 0) || 0;

      // 5. Sessões por local (com estado)
      const locaisMap = new Map<string, { cidade: string; estado: string; count: number }>();
      sessions?.forEach((s: any) => {
        const cidade = s.cidade || 'Desconhecido';
        const estado = s.estado || 'Desconhecido';
        const key = `${cidade}-${estado}`;
        const existing = locaisMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          locaisMap.set(key, { cidade, estado, count: 1 });
        }
      });
      const sessoesPorLocal = Array.from(locaisMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 6. Vendas por produto com imagem
      const produtosMap = new Map<string, { total: number; imagem?: string }>();
      agendamentosHoje?.forEach(a => {
        const itens = a.itens_carrinho as any[];
        itens?.forEach((item: any) => {
          const nome = item.name || 'Desconhecido';
          const existing = produtosMap.get(nome);
          const imagem = item.image || item.img || item.imagem;
          
          if (existing) {
            existing.total += (item.quantity || 1);
            if (!existing.imagem && imagem) {
              existing.imagem = imagem;
            }
          } else {
            produtosMap.set(nome, { 
              total: (item.quantity || 1), 
              imagem 
            });
          }
        });
      });
      const vendasPorProduto = Array.from(produtosMap.entries())
        .map(([nome, data]) => ({ 
          nome, 
          total: data.total,
          imagem: data.imagem 
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // 7. Clientes novos vs recorrentes - COM FILTRO TENANT
      const telefonesUnicos = new Set<string>();
      const { data: agendamentosAnteriores } = await supabase
        .from('agendamentos')
        .select('telefone')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .lt('created_at', today.toISOString());
      
      agendamentosAnteriores?.forEach(a => {
        if (a.telefone) telefonesUnicos.add(a.telefone);
      });

      let clientesNovos = 0;
      let clientesRecorrentes = 0;
      agendamentosHoje?.forEach(a => {
        if (a.telefone) {
          if (telefonesUnicos.has(a.telefone)) {
            clientesRecorrentes++;
          } else {
            clientesNovos++;
          }
        }
      });

      // 8. Sessões por hora (últimas 24h)
      const sessoesPorHora = Array(24).fill(0);
      const agora = new Date();
      sessions?.forEach((s: any) => {
        const sessaoData = new Date(s.ultima_atividade);
        const horasDiff = Math.floor((agora.getTime() - sessaoData.getTime()) / (1000 * 60 * 60));
        if (horasDiff >= 0 && horasDiff < 24) {
          const index = 23 - horasDiff;
          sessoesPorHora[index]++;
        }
      });

      // 9. Pedidos por hora (últimas 24h)
      const pedidosPorHora = Array(24).fill(0);
      agendamentosHoje?.forEach(a => {
        const pedidoData = new Date(a.created_at);
        const horasDiff = Math.floor((agora.getTime() - pedidoData.getTime()) / (1000 * 60 * 60));
        if (horasDiff >= 0 && horasDiff < 24) {
          const index = 23 - horasDiff;
          pedidosPorHora[index]++;
        }
      });

      setStats({
        visitantesAtivos,
        totalVendas,
        sessoesAtivas,
        pedidosHoje,
        carrinhosAtivos,
        noCheckout,
        comprasConcluidas,
        sessoesPorLocal,
        vendasPorProduto,
        clientesNovos,
        clientesRecorrentes,
        sessoesPorHora,
        pedidosPorHora,
      });
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar estatísticas live:', error);
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    loadStats();

    // Subscrever a mudanças em tempo real - COM FILTRO TENANT
    const channel = supabase
      .channel(`live_analytics-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_sessions',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          loadStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agendamentos',
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          loadStats();
        }
      )
      .subscribe();

    // Atualizar a cada 10 segundos
    const interval = setInterval(loadStats, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [tenantId, loadStats]);

  return { stats, loading, refresh: loadStats };
}
