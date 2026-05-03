import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { useFinanceCore, DateRange } from './useFinanceCore';

interface DashboardFinanceiroData {
  kpis: {
    receitaTotal: number;
    receitaMesAtual: number;
    despesaTotal: number;
    despesaMesAtual: number;
    saldo: number;
    margemLucro: number;
    crescimentoReceita: number;
    crescimentoDespesa: number;
  };
  evolucaoMensal: {
    mes: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }[];
  despesasPorCategoria: {
    categoria: string;
    valor: number;
    percentual: number;
  }[];
  receitasPorForma: {
    forma: string;
    valor: number;
    percentual: number;
  }[];
  receitasPorCategoria: {
    categoria: string;
    valor: number;
    percentual: number;
  }[];
  historicoRecente: {
    id: string;
    tipo: 'receita' | 'despesa';
    descricao: string;
    valor: number;
    data: string;
    categoria: string;
  }[];
}

/**
 * Hook refatorado para usar o ledger como fonte única de verdade.
 * Mantém a mesma interface para compatibilidade com componentes existentes.
 */
export function useDashboardFinanceiro() {
  const hoje = new Date();
  const inicioUltimos6Meses = startOfMonth(subMonths(hoje, 5));
  
  // Range para 6 meses
  const range: DateRange = {
    start: format(inicioUltimos6Meses, 'yyyy-MM-dd'),
    end: format(endOfMonth(hoje), 'yyyy-MM-dd'),
  };
  
  // Usar o core para KPIs do mês atual
  const mesAtualRange: DateRange = {
    start: format(startOfMonth(hoje), 'yyyy-MM-dd'),
    end: format(endOfMonth(hoje), 'yyyy-MM-dd'),
  };
  
  const mesAnteriorRange: DateRange = {
    start: format(startOfMonth(subMonths(hoje, 1)), 'yyyy-MM-dd'),
    end: format(endOfMonth(subMonths(hoje, 1)), 'yyyy-MM-dd'),
  };
  
  return useQuery({
    queryKey: QUERY_KEYS.dashboardFinanceiro,
    queryFn: async (): Promise<DashboardFinanceiroData> => {
      // Buscar ledger dos últimos 6 meses
      const { data: ledger, error: ledgerError } = await supabase
        .from('ledger_entries' as any)
        .select('*')
        .gte('data_movimentacao', range.start)
        .lte('data_movimentacao', range.end)
        .eq('status', 'confirmado');
      
      if (ledgerError) {
        console.error('Erro ao buscar ledger:', ledgerError);
        throw ledgerError;
      }
      
      const entries = (ledger || []) as any[];
      
      // Calcular totais gerais (6 meses)
      const receitaTotal = entries
        .filter(e => e.tipo === 'IN')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const reembolsosTotal = entries
        .filter(e => e.tipo === 'OUT' && e.origem === 'reembolso')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const despesaTotal = entries
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      // Mês atual
      const entriesMesAtual = entries.filter(e => 
        e.data_movimentacao >= mesAtualRange.start && 
        e.data_movimentacao <= mesAtualRange.end
      );
      
      const receitaMesAtual = entriesMesAtual
        .filter(e => e.tipo === 'IN')
        .reduce((sum, e) => sum + Number(e.valor), 0) - 
        entriesMesAtual
        .filter(e => e.tipo === 'OUT' && e.origem === 'reembolso')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const despesaMesAtual = entriesMesAtual
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      // Mês anterior
      const entriesMesAnterior = entries.filter(e => 
        e.data_movimentacao >= mesAnteriorRange.start && 
        e.data_movimentacao <= mesAnteriorRange.end
      );
      
      const receitaMesAnterior = entriesMesAnterior
        .filter(e => e.tipo === 'IN')
        .reduce((sum, e) => sum + Number(e.valor), 0) - 
        entriesMesAnterior
        .filter(e => e.tipo === 'OUT' && e.origem === 'reembolso')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const despesaMesAnterior = entriesMesAnterior
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      // KPIs
      const receitaLiquida = receitaTotal - reembolsosTotal;
      const saldo = receitaLiquida - despesaTotal;
      const margemLucro = receitaLiquida > 0 ? ((receitaLiquida - despesaTotal) / receitaLiquida) * 100 : 0;
      const crescimentoReceita = receitaMesAnterior > 0 
        ? ((receitaMesAtual - receitaMesAnterior) / receitaMesAnterior) * 100 
        : 0;
      const crescimentoDespesa = despesaMesAnterior > 0
        ? ((despesaMesAtual - despesaMesAnterior) / despesaMesAnterior) * 100
        : 0;
      
      // Evolução mensal
      const evolucaoMensal = [];
      for (let i = 5; i >= 0; i--) {
        const mes = subMonths(hoje, i);
        const inicioMes = format(startOfMonth(mes), 'yyyy-MM-dd');
        const fimMes = format(endOfMonth(mes), 'yyyy-MM-dd');
        
        const entriesMes = entries.filter(e => 
          e.data_movimentacao >= inicioMes && e.data_movimentacao <= fimMes
        );
        
        const receitasMes = entriesMes
          .filter(e => e.tipo === 'IN')
          .reduce((sum, e) => sum + Number(e.valor), 0);
        
        const despesasMes = entriesMes
          .filter(e => e.tipo === 'OUT' && e.origem === 'despesa')
          .reduce((sum, e) => sum + Number(e.valor), 0);
        
        evolucaoMensal.push({
          mes: format(mes, 'MMM/yy'),
          receitas: receitasMes,
          despesas: despesasMes,
          saldo: receitasMes - despesasMes,
        });
      }
      
      // Despesas por categoria (do ledger)
      const despesasPorCat: Record<string, number> = {};
      entries
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa')
        .forEach(e => {
          const cat = e.categoria || 'Outros';
          despesasPorCat[cat] = (despesasPorCat[cat] || 0) + Number(e.valor);
        });
      
      const despesasPorCategoria = Object.entries(despesasPorCat).map(([categoria, valor]) => ({
        categoria,
        valor,
        percentual: despesaTotal > 0 ? (valor / despesaTotal) * 100 : 0,
      })).sort((a, b) => b.valor - a.valor);
      
      // Receitas por forma de pagamento (do ledger)
      const receitasPorFormaMap: Record<string, number> = {};
      entries
        .filter(e => e.tipo === 'IN')
        .forEach(e => {
          const forma = e.forma_pagamento || 'Não informado';
          receitasPorFormaMap[forma] = (receitasPorFormaMap[forma] || 0) + Number(e.valor);
        });
      
      const receitasPorForma = Object.entries(receitasPorFormaMap).map(([forma, valor]) => ({
        forma,
        valor,
        percentual: receitaTotal > 0 ? (valor / receitaTotal) * 100 : 0,
      })).sort((a, b) => b.valor - a.valor);
      
      // Receitas por categoria (do ledger)
      const receitasPorCatMap: Record<string, number> = {};
      entries
        .filter(e => e.tipo === 'IN')
        .forEach(e => {
          const cat = e.categoria || 'servicos_limpeza';
          receitasPorCatMap[cat] = (receitasPorCatMap[cat] || 0) + Number(e.valor);
        });
      
      const receitasPorCategoria = Object.entries(receitasPorCatMap).map(([categoria, valor]) => ({
        categoria,
        valor,
        percentual: receitaTotal > 0 ? (valor / receitaTotal) * 100 : 0,
      })).sort((a, b) => b.valor - a.valor);
      
      // Histórico recente (últimas 10 transações do ledger)
      const historicoRecente = entries
        .sort((a, b) => new Date(b.data_movimentacao).getTime() - new Date(a.data_movimentacao).getTime())
        .slice(0, 10)
        .map(e => ({
          id: e.id,
          tipo: e.tipo === 'IN' ? 'receita' as const : 'despesa' as const,
          descricao: e.descricao || (e.tipo === 'IN' ? 'Receita' : 'Despesa'),
          valor: Number(e.valor),
          data: e.data_movimentacao,
          categoria: e.categoria,
        }));
      
      return {
        kpis: {
          receitaTotal: receitaLiquida,
          receitaMesAtual,
          despesaTotal,
          despesaMesAtual,
          saldo,
          margemLucro,
          crescimentoReceita,
          crescimentoDespesa,
        },
        evolucaoMensal,
        despesasPorCategoria,
        receitasPorForma,
        receitasPorCategoria,
        historicoRecente,
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
