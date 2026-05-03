import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { MovimentacaoDiaria } from './useFluxoCaixa';
import { useTenantContext } from '@/hooks/useTenantContext';
import { formatCurrency } from '@/utils/format';

interface DashboardConsolidado {
  kpis: {
    receitaRealizada: number;
    receitaTrend: number;
    despesasTotal: number;
    despesasTrend: number;
    lucroLiquido: number;
    lucroTrend: number;
    margemLiquida: number;
    margemTrend: number;
  };
  
  fluxoCaixa: {
    movimentacoes: MovimentacaoDiaria[];
    saldoAtual: number;
  };
  
  distribuicao: {
    receitasPorForma: Array<{ name: string; value: number; percentual: number }>;
    despesasPorCategoria: Array<{ name: string; value: number; percentual: number }>;
  };
  
  indicadores: {
    saldoAtual: number;
    taxaRecebimento: number;
    pontoEquilibrio: number;
    diasSolvencia: number;
  };
  
  alertas: Array<{
    tipo: 'critico' | 'atencao' | 'info';
    titulo: string;
    descricao: string;
    valor?: number;
    link: string;
  }>;
  
  receitasRecentes: Array<{
    id: string;
    nome_cliente: string;
    valor_total: number;
    status_pagamento: string;
    data: string;
  }>;
  
  despesasRecentes: Array<{
    id: string;
    descricao: string;
    valor: number;
    categoria: string;
    data: string;
  }>;
  
  metas: {
    metaReceita: number;
    receitaAtual: number;
    progressoReceita: number;
    metaLucro: number;
    lucroAtual: number;
    progressoLucro: number;
  };
}

/**
 * Hook refatorado para usar o ledger como fonte única de verdade.
 * Mantém a mesma interface para compatibilidade com componentes existentes.
 * CORRIGIDO: Agora filtra por tenant_id.
 */
export function useConsolidado() {
  const { tenantId } = useTenantContext();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.consolidado, tenantId],
    queryFn: async (): Promise<DashboardConsolidado> => {
      if (!tenantId) {
        throw new Error('Tenant não identificado');
      }
      
      const hoje = new Date();
      const inicioMesAtual = format(startOfMonth(hoje), 'yyyy-MM-dd');
      const fimMesAtual = format(endOfMonth(hoje), 'yyyy-MM-dd');
      const inicioMesAnterior = format(startOfMonth(subMonths(hoje, 1)), 'yyyy-MM-dd');
      const fimMesAnterior = format(endOfMonth(subMonths(hoje, 1)), 'yyyy-MM-dd');
      
      // Buscar LEDGER do mês atual COM FILTRO DE TENANT
      const { data: ledgerAtual, error: ledgerAtualError } = await supabase
        .from('ledger_entries' as any)
        .select('*')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .gte('data_movimentacao', inicioMesAtual)
        .lte('data_movimentacao', fimMesAtual)
        .eq('status', 'confirmado');
      
      if (ledgerAtualError) throw ledgerAtualError;
      
      // Buscar LEDGER do mês anterior COM FILTRO DE TENANT
      const { data: ledgerAnterior } = await supabase
        .from('ledger_entries' as any)
        .select('*')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .gte('data_movimentacao', inicioMesAnterior)
        .lte('data_movimentacao', fimMesAnterior)
        .eq('status', 'confirmado');
      
      const entriesAtual = (ledgerAtual || []) as any[];
      const entriesAnterior = (ledgerAnterior || []) as any[];
      
      // Calcular KPIs do mês atual
      const receitaBrutaAtual = entriesAtual
        .filter(e => e.tipo === 'IN')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const reembolsosAtual = entriesAtual
        .filter(e => e.tipo === 'OUT' && e.origem === 'reembolso')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const receitaRealizada = receitaBrutaAtual - reembolsosAtual;
      
      const despesasTotal = entriesAtual
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const lucroLiquido = receitaRealizada - despesasTotal;
      const margemLiquida = receitaRealizada > 0 ? (lucroLiquido / receitaRealizada) * 100 : 0;
      
      // Calcular KPIs do mês anterior para trends
      const receitaBrutaAnterior = entriesAnterior
        .filter(e => e.tipo === 'IN')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const reembolsosAnterior = entriesAnterior
        .filter(e => e.tipo === 'OUT' && e.origem === 'reembolso')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const receitaAnterior = receitaBrutaAnterior - reembolsosAnterior;
      
      const despesasTotalAnterior = entriesAnterior
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const lucroAnterior = receitaAnterior - despesasTotalAnterior;
      const margemAnterior = receitaAnterior > 0 ? (lucroAnterior / receitaAnterior) * 100 : 0;
      
      // Calcular trends
      const receitaTrend = receitaAnterior > 0 
        ? ((receitaRealizada - receitaAnterior) / receitaAnterior) * 100 
        : 0;
      const despesasTrend = despesasTotalAnterior > 0 
        ? ((despesasTotal - despesasTotalAnterior) / despesasTotalAnterior) * 100 
        : 0;
      const lucroTrend = lucroAnterior !== 0 
        ? ((lucroLiquido - lucroAnterior) / Math.abs(lucroAnterior)) * 100 
        : 0;
      const margemTrend = margemLiquida - margemAnterior;
      
      // Preparar movimentações para fluxo de caixa
      const movimentacoesMap = new Map<string, MovimentacaoDiaria>();
      
      entriesAtual.forEach((e: any) => {
        const data = e.data_movimentacao;
        if (!movimentacoesMap.has(data)) {
          movimentacoesMap.set(data, {
            data,
            entradas: 0,
            saidas: 0,
            saldo: 0,
            saldoAcumulado: 0,
          });
        }
        const mov = movimentacoesMap.get(data)!;
        if (e.tipo === 'IN') {
          mov.entradas += Number(e.valor);
        } else {
          mov.saidas += Number(e.valor);
        }
      });
      
      const movimentacoes = Array.from(movimentacoesMap.values())
        .sort((a, b) => a.data.localeCompare(b.data));
      
      let saldoAcumulado = 0;
      movimentacoes.forEach(mov => {
        mov.saldo = mov.entradas - mov.saidas;
        saldoAcumulado += mov.saldo;
        mov.saldoAcumulado = saldoAcumulado;
      });
      
      // Distribuição de receitas por forma de pagamento
      const receitasPorFormaMap = new Map<string, number>();
      entriesAtual
        .filter(e => e.tipo === 'IN')
        .forEach((e: any) => {
          const forma = e.forma_pagamento || 'Não especificado';
          receitasPorFormaMap.set(forma, (receitasPorFormaMap.get(forma) || 0) + Number(e.valor));
        });
      
      const receitasPorForma = Array.from(receitasPorFormaMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentual: receitaBrutaAtual > 0 ? (value / receitaBrutaAtual) * 100 : 0,
      }));
      
      // Distribuição de despesas por categoria
      const despesasPorCategoriaMap = new Map<string, number>();
      entriesAtual
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa')
        .forEach((e: any) => {
          const categoria = e.categoria || 'outras';
          despesasPorCategoriaMap.set(categoria, (despesasPorCategoriaMap.get(categoria) || 0) + Number(e.valor));
        });
      
      const despesasPorCategoria = Array.from(despesasPorCategoriaMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentual: despesasTotal > 0 ? (value / despesasTotal) * 100 : 0,
      }));
      
      // Calcular indicadores usando ledger
      const agendamentosNoLedger = new Set(
        entriesAtual.filter(e => e.tipo === 'IN' && e.agendamento_id).map(e => e.agendamento_id)
      );
      
      // Buscar agendamentos do mês para taxa de recebimento COM FILTRO DE TENANT
      const { data: agendamentosAtual } = await supabase
        .from('agendamentos')
        .select('id, valor_total, status')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .gte('data_agendamento', inicioMesAtual)
        .lte('data_agendamento', fimMesAtual)
        .not('status', 'in', '(cancelado,reembolsado)');
      
      const totalAgendamentos = agendamentosAtual?.length || 0;
      const agendamentosPagos = (agendamentosAtual || []).filter(
        (a: any) => agendamentosNoLedger.has(a.id)
      ).length;
      const taxaRecebimento = totalAgendamentos > 0 ? (agendamentosPagos / totalAgendamentos) * 100 : 0;
      
      // Buscar custos fixos para ponto de equilíbrio COM FILTRO DE TENANT
      const { data: despesasFixas } = await supabase
        .from('despesas' as any)
        .select('valor')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .in('categoria', ['fixas', 'salarios'])
        .eq('status', 'paga');
      
      const custosFixos = (despesasFixas || []).reduce((sum: number, d: any) => sum + Number(d.valor), 0);
      const pontoEquilibrio = custosFixos / 0.6;
      
      const mediaSaidas = despesasTotal / (movimentacoes.length || 1);
      const diasSolvencia = mediaSaidas > 0 ? Math.floor(saldoAcumulado / mediaSaidas) : 999;
      
      // Identificar alertas
      const alertas: Array<{
        tipo: 'critico' | 'atencao' | 'info';
        titulo: string;
        descricao: string;
        valor?: number;
        link: string;
      }> = [];
      
      // Despesas vencidas COM FILTRO DE TENANT
      const { data: despesasVencidas } = await supabase
        .from('despesas' as any)
        .select('valor')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .lt('data_despesa', format(hoje, 'yyyy-MM-dd'))
        .neq('status', 'paga');
      
      if (despesasVencidas && despesasVencidas.length > 0) {
        const valorVencido = despesasVencidas.reduce((sum: number, d: any) => sum + Number(d.valor), 0);
        alertas.push({
          tipo: 'critico',
          titulo: `${despesasVencidas.length} despesas vencidas`,
          descricao: 'Existem despesas aguardando pagamento',
          valor: valorVencido,
          link: '/admin/financeiro/despesas',
        });
      }
      
      if (saldoAcumulado < receitaRealizada * 0.1 && saldoAcumulado > 0) {
        alertas.push({
          tipo: 'atencao',
          titulo: 'Saldo em nível crítico',
          descricao: 'Saldo atual está abaixo de 10% da receita mensal',
          valor: saldoAcumulado,
          link: '/admin/financeiro/fluxo-caixa',
        });
      }
      
      // Buscar receitas e despesas recentes (do ledger)
      const receitasRecentes = entriesAtual
        .filter(e => e.tipo === 'IN')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((e: any) => ({
          id: e.id,
          nome_cliente: e.metadata?.cliente || 'Cliente',
          valor_total: Number(e.valor),
          status_pagamento: 'pago',
          data: e.data_movimentacao,
        }));
      
      const despesasRecentes = entriesAtual
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((e: any) => ({
          id: e.id,
          descricao: e.descricao || 'Despesa',
          valor: Number(e.valor),
          categoria: e.categoria,
          data: e.data_movimentacao,
        }));
      
      // Buscar metas do mês COM FILTRO DE TENANT
      const { data: metasData } = await supabase
        .from('metas_financeiras' as any)
        .select('*')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .eq('mes_referencia', inicioMesAtual)
        .maybeSingle();
      
      const metaReceita = metasData ? (metasData as any).valor_meta || 0 : 0;
      const progressoReceita = metaReceita > 0 ? (receitaRealizada / metaReceita) * 100 : 0;
      
      const metaLucro = metaReceita * 0.5;
      const progressoLucro = metaLucro > 0 ? (lucroLiquido / metaLucro) * 100 : 0;
      
      if (metaReceita > 0 && progressoReceita < 100) {
        const faltaReceita = metaReceita - receitaRealizada;
        alertas.push({
          tipo: 'info',
          titulo: `Meta mensal em ${progressoReceita.toFixed(0)}%`,
          descricao: `Faltam ${formatCurrency(faltaReceita)} para atingir a meta`,
          valor: faltaReceita,
          link: '/admin/financeiro/metas',
        });
      }
      
      return {
        kpis: {
          receitaRealizada,
          receitaTrend,
          despesasTotal,
          despesasTrend,
          lucroLiquido,
          lucroTrend,
          margemLiquida,
          margemTrend,
        },
        fluxoCaixa: {
          movimentacoes,
          saldoAtual: saldoAcumulado,
        },
        distribuicao: {
          receitasPorForma,
          despesasPorCategoria,
        },
        indicadores: {
          saldoAtual: saldoAcumulado,
          taxaRecebimento,
          pontoEquilibrio,
          diasSolvencia,
        },
        alertas,
        receitasRecentes,
        despesasRecentes,
        metas: {
          metaReceita,
          receitaAtual: receitaRealizada,
          progressoReceita,
          metaLucro,
          lucroAtual: lucroLiquido,
          progressoLucro,
        },
      };
    },
    refetchInterval: 60000,
    enabled: !!tenantId,
  });
}
