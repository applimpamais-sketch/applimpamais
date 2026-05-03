import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';

// ============================================
// TIPOS - SINGLE SOURCE OF TRUTH
// ============================================

export interface DateRange {
  start: string; // 'YYYY-MM-DD'
  end: string;   // 'YYYY-MM-DD'
}

export interface LedgerEntry {
  id: string;
  created_at: string;
  data_movimentacao: string;
  tipo: 'IN' | 'OUT';
  valor: number;
  categoria: string;
  forma_pagamento: string | null;
  descricao: string | null;
  status: 'confirmado' | 'pendente' | 'cancelado';
  agendamento_id: string | null;
  pagamento_id: string | null;
  despesa_id: string | null;
  reembolso_id: string | null;
  origem: 'pagamento' | 'despesa' | 'reembolso' | 'ajuste_manual';
  metadata: Record<string, unknown>;
}

export interface FinanceKPIs {
  // Receitas
  receitaEsperada: number;      // Agendamentos não cancelados
  receitaRealizada: number;     // Ledger IN confirmado
  receitaRealizadaBruta: number; // Sem descontar reembolsos
  totalReembolsos: number;      // Ledger OUT origem=reembolso
  
  // Despesas
  despesasPagas: number;        // Ledger OUT origem=despesa
  despesasPendentes: number;    // Despesas table status=pendente
  
  // Resultados
  saldo: number;                // receitaRealizada - despesasPagas
  lucroLiquido: number;         // receitaRealizada - despesasPagas
  margemLiquida: number;        // (lucro / receita) * 100
  
  // Métricas
  taxaRecebimento: number;      // (realizada / esperada) * 100
  ticketMedio: number;          // realizada / qtd agendamentos pagos
  qtdAgendamentosPagos: number;
  
  // Inadimplência
  inadimplentes: number;        // Qtd agendamentos concluídos sem pagamento
  valorInadimplente: number;    // Valor total inadimplente
}

export interface MovimentacaoDiaria {
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
  saldoAcumulado: number;
}

export interface DistribuicaoItem {
  nome: string;
  valor: number;
  percentual: number;
}

export interface AlertaFinanceiro {
  tipo: 'critico' | 'atencao' | 'info';
  titulo: string;
  descricao: string;
  valor?: number;
  link: string;
}

export interface FinanceData {
  kpis: FinanceKPIs;
  fluxoCaixa: MovimentacaoDiaria[];
  receitasPorForma: DistribuicaoItem[];
  despesasPorCategoria: DistribuicaoItem[];
  alertas: AlertaFinanceiro[];
  ledgerEntries: LedgerEntry[];
}

// ============================================
// FUNÇÕES DE CÁLCULO CENTRALIZADAS
// ============================================

function calcularKPIs(
  ledger: LedgerEntry[],
  agendamentos: { valor_total: number; status: string; id: string }[],
  despesasPendentes: { valor: number }[]
): FinanceKPIs {
  // Receitas do ledger
  const receitaRealizadaBruta = ledger
    .filter(e => e.tipo === 'IN' && e.status === 'confirmado')
    .reduce((sum, e) => sum + Number(e.valor), 0);
  
  const totalReembolsos = ledger
    .filter(e => e.tipo === 'OUT' && e.origem === 'reembolso' && e.status === 'confirmado')
    .reduce((sum, e) => sum + Number(e.valor), 0);
  
  const receitaRealizada = receitaRealizadaBruta - totalReembolsos;
  
  // Despesas do ledger
  const despesasPagas = ledger
    .filter(e => e.tipo === 'OUT' && e.origem === 'despesa' && e.status === 'confirmado')
    .reduce((sum, e) => sum + Number(e.valor), 0);
  
  const despesasPendentesTotal = despesasPendentes
    .reduce((sum, d) => sum + Number(d.valor), 0);
  
  // Receita esperada (agendamentos não cancelados/reembolsados)
  const receitaEsperada = agendamentos
    .filter(a => !['cancelado', 'reembolsado'].includes(a.status))
    .reduce((sum, a) => sum + Number(a.valor_total), 0);
  
  // Agendamentos pagos (têm entrada no ledger)
  const agendamentosComPagamento = new Set(
    ledger
      .filter(e => e.tipo === 'IN' && e.status === 'confirmado' && e.agendamento_id)
      .map(e => e.agendamento_id)
  );
  const qtdAgendamentosPagos = agendamentosComPagamento.size;
  
  // Inadimplentes: concluídos há mais de 5 dias sem pagamento
  const agendamentosInadimplentes = agendamentos.filter(a => 
    a.status === 'concluido' && !agendamentosComPagamento.has(a.id)
  );
  
  // Cálculos derivados
  const saldo = receitaRealizada - despesasPagas;
  const lucroLiquido = saldo;
  const margemLiquida = receitaRealizada > 0 
    ? (lucroLiquido / receitaRealizada) * 100 
    : 0;
  const taxaRecebimento = receitaEsperada > 0 
    ? (receitaRealizada / receitaEsperada) * 100 
    : 0;
  const ticketMedio = qtdAgendamentosPagos > 0 
    ? receitaRealizada / qtdAgendamentosPagos 
    : 0;
  
  return {
    receitaEsperada,
    receitaRealizada,
    receitaRealizadaBruta,
    totalReembolsos,
    despesasPagas,
    despesasPendentes: despesasPendentesTotal,
    saldo,
    lucroLiquido,
    margemLiquida,
    taxaRecebimento,
    ticketMedio,
    qtdAgendamentosPagos,
    inadimplentes: agendamentosInadimplentes.length,
    valorInadimplente: agendamentosInadimplentes.reduce((sum, a) => sum + Number(a.valor_total), 0),
  };
}

function calcularFluxoCaixa(ledger: LedgerEntry[]): MovimentacaoDiaria[] {
  const porDia = new Map<string, { entradas: number; saidas: number }>();
  
  ledger
    .filter(e => e.status === 'confirmado')
    .forEach(e => {
      const data = e.data_movimentacao;
      if (!porDia.has(data)) {
        porDia.set(data, { entradas: 0, saidas: 0 });
      }
      const dia = porDia.get(data)!;
      if (e.tipo === 'IN') {
        dia.entradas += Number(e.valor);
      } else {
        dia.saidas += Number(e.valor);
      }
    });
  
  const movimentacoes: MovimentacaoDiaria[] = [];
  let saldoAcumulado = 0;
  
  Array.from(porDia.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([data, valores]) => {
      const saldo = valores.entradas - valores.saidas;
      saldoAcumulado += saldo;
      movimentacoes.push({
        data,
        entradas: valores.entradas,
        saidas: valores.saidas,
        saldo,
        saldoAcumulado,
      });
    });
  
  return movimentacoes;
}

function calcularDistribuicaoReceitas(ledger: LedgerEntry[]): DistribuicaoItem[] {
  const porForma = new Map<string, number>();
  let total = 0;
  
  ledger
    .filter(e => e.tipo === 'IN' && e.status === 'confirmado')
    .forEach(e => {
      const forma = e.forma_pagamento || 'Não informado';
      porForma.set(forma, (porForma.get(forma) || 0) + Number(e.valor));
      total += Number(e.valor);
    });
  
  return Array.from(porForma.entries())
    .map(([nome, valor]) => ({
      nome,
      valor,
      percentual: total > 0 ? (valor / total) * 100 : 0,
    }))
    .sort((a, b) => b.valor - a.valor);
}

function calcularDistribuicaoDespesas(ledger: LedgerEntry[]): DistribuicaoItem[] {
  const porCategoria = new Map<string, number>();
  let total = 0;
  
  ledger
    .filter(e => e.tipo === 'OUT' && e.origem === 'despesa' && e.status === 'confirmado')
    .forEach(e => {
      const categoria = e.categoria || 'Outras';
      porCategoria.set(categoria, (porCategoria.get(categoria) || 0) + Number(e.valor));
      total += Number(e.valor);
    });
  
  return Array.from(porCategoria.entries())
    .map(([nome, valor]) => ({
      nome,
      valor,
      percentual: total > 0 ? (valor / total) * 100 : 0,
    }))
    .sort((a, b) => b.valor - a.valor);
}

function gerarAlertas(kpis: FinanceKPIs, despesasVencidas: { valor: number }[]): AlertaFinanceiro[] {
  const alertas: AlertaFinanceiro[] = [];
  
  // Despesas vencidas
  if (despesasVencidas.length > 0) {
    const valorVencido = despesasVencidas.reduce((sum, d) => sum + Number(d.valor), 0);
    alertas.push({
      tipo: 'critico',
      titulo: `${despesasVencidas.length} despesas vencidas`,
      descricao: 'Existem despesas aguardando pagamento',
      valor: valorVencido,
      link: '/admin/financeiro/despesas',
    });
  }
  
  // Inadimplência
  if (kpis.inadimplentes > 0) {
    alertas.push({
      tipo: 'atencao',
      titulo: `${kpis.inadimplentes} agendamentos inadimplentes`,
      descricao: 'Serviços concluídos sem pagamento registrado',
      valor: kpis.valorInadimplente,
      link: '/admin/financeiro/receitas',
    });
  }
  
  // Saldo baixo
  if (kpis.saldo < kpis.receitaRealizada * 0.1 && kpis.saldo > 0) {
    alertas.push({
      tipo: 'atencao',
      titulo: 'Saldo em nível crítico',
      descricao: 'Saldo atual está abaixo de 10% da receita mensal',
      valor: kpis.saldo,
      link: '/admin/financeiro/fluxo-caixa',
    });
  }
  
  // Taxa de recebimento baixa
  if (kpis.taxaRecebimento < 70 && kpis.receitaEsperada > 0) {
    alertas.push({
      tipo: 'atencao',
      titulo: `Taxa de recebimento em ${kpis.taxaRecebimento.toFixed(0)}%`,
      descricao: 'Muitos agendamentos ainda não foram pagos',
      link: '/admin/financeiro/receitas',
    });
  }
  
  return alertas;
}

// ============================================
// HOOK PRINCIPAL - FONTE ÚNICA DE VERDADE
// ============================================

export function useFinanceCore(range: DateRange) {
  return useQuery({
    queryKey: QUERY_KEYS.financeCore(range.start, range.end),
    queryFn: async (): Promise<FinanceData> => {
      // 1. Buscar ledger entries do período
      const { data: ledger, error: ledgerError } = await supabase
        .from('ledger_entries' as any)
        .select('*')
        .gte('data_movimentacao', range.start)
        .lte('data_movimentacao', range.end);
      
      if (ledgerError) {
        console.error('Erro ao buscar ledger:', ledgerError);
        throw ledgerError;
      }
      
      // 2. Buscar agendamentos do período (para receita esperada)
      const { data: agendamentos, error: agendError } = await supabase
        .from('agendamentos' as any)
        .select('id, valor_total, status, data_agendamento')
        .gte('data_agendamento', range.start)
        .lte('data_agendamento', range.end);
      
      if (agendError) {
        console.error('Erro ao buscar agendamentos:', agendError);
        throw agendError;
      }
      
      // 3. Buscar despesas pendentes do período
      const { data: despesasPendentes, error: despPendError } = await supabase
        .from('despesas' as any)
        .select('valor')
        .eq('status', 'pendente')
        .gte('data_despesa', range.start)
        .lte('data_despesa', range.end);
      
      if (despPendError) {
        console.error('Erro ao buscar despesas pendentes:', despPendError);
      }
      
      // 4. Buscar despesas vencidas (para alertas)
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const { data: despesasVencidas } = await supabase
        .from('despesas' as any)
        .select('valor')
        .lt('data_despesa', hoje)
        .neq('status', 'paga');
      
      // Processar dados
      const ledgerEntries = (ledger || []) as unknown as LedgerEntry[];
      const kpis = calcularKPIs(
        ledgerEntries,
        (agendamentos || []) as any[],
        (despesasPendentes || []) as any[]
      );
      
      return {
        kpis,
        fluxoCaixa: calcularFluxoCaixa(ledgerEntries),
        receitasPorForma: calcularDistribuicaoReceitas(ledgerEntries),
        despesasPorCategoria: calcularDistribuicaoDespesas(ledgerEntries),
        alertas: gerarAlertas(kpis, (despesasVencidas || []) as any[]),
        ledgerEntries,
      };
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // 1 minuto
  });
}

// ============================================
// HOOKS AUXILIARES PARA PERÍODOS COMUNS
// ============================================

export function useFinanceCoreCurrentMonth() {
  const hoje = new Date();
  const range: DateRange = {
    start: format(startOfMonth(hoje), 'yyyy-MM-dd'),
    end: format(endOfMonth(hoje), 'yyyy-MM-dd'),
  };
  return useFinanceCore(range);
}

export function useFinanceCoreLast30Days() {
  const hoje = new Date();
  const range: DateRange = {
    start: format(subDays(hoje, 30), 'yyyy-MM-dd'),
    end: format(hoje, 'yyyy-MM-dd'),
  };
  return useFinanceCore(range);
}
