import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format, subDays, addDays, differenceInDays } from 'date-fns';
import { QUERY_KEYS } from '@/lib/queryKeys';
import type { PeriodType } from '@/components/admin/PeriodFilter';
import { usePeriodDateRange } from './usePeriodDateRange';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface MovimentacaoDiaria {
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
  saldoAcumulado: number;
}

export interface ProjecaoFluxo {
  periodo: '7dias' | '30dias' | '90dias';
  dataFim: string;
  saldoProjetado: number;
  entradasProjetadas: number;
  saidasProjetadas: number;
  confianca: number;
}

export interface AlertaFluxo {
  id: string;
  tipo: 'vencimento' | 'saldo_baixo' | 'inadimplencia' | 'projecao_negativa';
  severidade: 'alta' | 'media' | 'baixa';
  titulo: string;
  descricao: string;
  data?: string;
  valor?: number;
}

export interface DRESimplificado {
  periodo: string;
  receitaBruta: number;
  descontos: number;
  receitaLiquida: number;
  custoServicos: number;
  lucroOperacional: number;
  despesasOperacionais: number;
  lucroLiquido: number;
  margemBruta: number;
  margemLiquida: number;
}

export interface FluxoCaixaData {
  movimentacoes: MovimentacaoDiaria[];
  projecoes: ProjecaoFluxo[];
  alertas: AlertaFluxo[];
  dre: DRESimplificado;
  kpis: {
    saldoAtual: number;
    mediaEntradas: number;
    mediaSaidas: number;
    pontoEquilibrio: number;
    diasSaudavel: number;
  };
}

interface UseFluxoCaixaParams {
  period: PeriodType;
  customRange?: { start: Date; end: Date };
}

function calcularMediaPonderada(valores: number[]): number {
  if (valores.length === 0) return 0;
  
  let somaValores = 0;
  let somaPesos = 0;
  
  valores.forEach((valor, index) => {
    const peso = index + 1;
    somaValores += valor * peso;
    somaPesos += peso;
  });
  
  return somaPesos > 0 ? somaValores / somaPesos : 0;
}

function calcularConfiancaProjecao(movimentacoes: MovimentacaoDiaria[]): number {
  if (movimentacoes.length < 7) return 30;
  
  const entradas = movimentacoes.map(m => m.entradas);
  const media = entradas.reduce((a, b) => a + b, 0) / entradas.length;
  
  const variancia = entradas.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / entradas.length;
  const desvioPadrao = Math.sqrt(variancia);
  
  const coeficienteVariacao = media > 0 ? desvioPadrao / media : 1;
  
  const confianca = Math.max(30, Math.min(95, 100 - (coeficienteVariacao * 100)));
  
  return Math.round(confianca);
}

/**
 * Hook refatorado para usar o ledger como fonte única de verdade.
 * Mantém a mesma interface para compatibilidade com componentes existentes.
 * CORRIGIDO: Agora filtra por tenant_id.
 */
export function useFluxoCaixa({ period, customRange }: UseFluxoCaixaParams) {
  const { tenantId } = useTenantContext();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.fluxoCaixa(period), tenantId],
    queryFn: async (): Promise<FluxoCaixaData> => {
      if (!tenantId) {
        throw new Error('Tenant não identificado');
      }
      
      const hoje = new Date();
      const dateRange = usePeriodDateRange(period, customRange);
      
      const dataInicio = dateRange 
        ? dateRange.start
        : subDays(hoje, 30);
      
      // Buscar do LEDGER COM FILTRO DE TENANT
      const { data: ledger, error: ledgerError } = await supabase
        .from('ledger_entries' as any)
        .select('*')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .gte('data_movimentacao', format(dataInicio, 'yyyy-MM-dd'))
        .lte('data_movimentacao', format(hoje, 'yyyy-MM-dd'))
        .eq('status', 'confirmado');
      
      if (ledgerError) {
        console.error('Erro ao buscar ledger:', ledgerError);
        throw ledgerError;
      }
      
      const entries = (ledger || []) as any[];
      
      // Criar mapa de movimentações diárias
      const movimentacoesMap = new Map<string, MovimentacaoDiaria>();
      const dias = differenceInDays(hoje, dataInicio);
      
      for (let i = 0; i <= dias; i++) {
        const data = format(addDays(dataInicio, i), 'yyyy-MM-dd');
        movimentacoesMap.set(data, {
          data,
          entradas: 0,
          saidas: 0,
          saldo: 0,
          saldoAcumulado: 0,
        });
      }
      
      // Processar entradas do ledger
      entries.forEach((entry: any) => {
        const data = entry.data_movimentacao;
        const mov = movimentacoesMap.get(data);
        if (mov) {
          if (entry.tipo === 'IN') {
            mov.entradas += Number(entry.valor);
          } else {
            mov.saidas += Number(entry.valor);
          }
        }
      });
      
      // Calcular saldo diário e acumulado
      const movimentacoes = Array.from(movimentacoesMap.values()).sort((a, b) => 
        a.data.localeCompare(b.data)
      );
      
      let saldoAcumulado = 0;
      movimentacoes.forEach(mov => {
        mov.saldo = mov.entradas - mov.saidas;
        saldoAcumulado += mov.saldo;
        mov.saldoAcumulado = saldoAcumulado;
      });
      
      // Calcular médias para projeções
      const ultimos30 = movimentacoes.slice(-30);
      const mediaEntradas = calcularMediaPonderada(ultimos30.map(m => m.entradas));
      const mediaSaidas = calcularMediaPonderada(ultimos30.map(m => m.saidas));
      
      // Gerar projeções
      const projecoes: ProjecaoFluxo[] = [
        {
          periodo: '7dias',
          dataFim: format(addDays(hoje, 7), 'yyyy-MM-dd'),
          saldoProjetado: saldoAcumulado + (mediaEntradas - mediaSaidas) * 7,
          entradasProjetadas: mediaEntradas * 7,
          saidasProjetadas: mediaSaidas * 7,
          confianca: calcularConfiancaProjecao(ultimos30),
        },
        {
          periodo: '30dias',
          dataFim: format(addDays(hoje, 30), 'yyyy-MM-dd'),
          saldoProjetado: saldoAcumulado + (mediaEntradas - mediaSaidas) * 30,
          entradasProjetadas: mediaEntradas * 30,
          saidasProjetadas: mediaSaidas * 30,
          confianca: Math.max(30, calcularConfiancaProjecao(ultimos30) - 15),
        },
        {
          periodo: '90dias',
          dataFim: format(addDays(hoje, 90), 'yyyy-MM-dd'),
          saldoProjetado: saldoAcumulado + (mediaEntradas - mediaSaidas) * 90,
          entradasProjetadas: mediaEntradas * 90,
          saidasProjetadas: mediaSaidas * 90,
          confianca: Math.max(20, calcularConfiancaProjecao(ultimos30) - 30),
        },
      ];
      
      // Identificar alertas
      const alertas: AlertaFluxo[] = [];
      
      // 1. Despesas vencidas COM FILTRO DE TENANT
      const { data: despesasVencidas } = await supabase
        .from('despesas' as any)
        .select('*')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .lt('data_despesa', format(hoje, 'yyyy-MM-dd'))
        .neq('status', 'paga');
      
      if (despesasVencidas && despesasVencidas.length > 0) {
        const valorTotal = despesasVencidas.reduce((sum: number, d: any) => sum + Number(d.valor), 0);
        alertas.push({
          id: 'despesas-vencidas',
          tipo: 'vencimento',
          severidade: 'alta',
          titulo: `${despesasVencidas.length} despesas vencidas`,
          descricao: 'Existem despesas aguardando pagamento',
          valor: valorTotal,
        });
      }
      
      // 2. Saldo baixo
      if (saldoAcumulado < mediaEntradas * 0.1 && saldoAcumulado > 0) {
        alertas.push({
          id: 'saldo-baixo',
          tipo: 'saldo_baixo',
          severidade: 'alta',
          titulo: 'Saldo em nível crítico',
          descricao: 'Saldo atual está abaixo de 10% da média mensal de entradas',
          valor: saldoAcumulado,
        });
      }
      
      // 3. Projeção negativa em 30 dias
      const projecao30 = projecoes.find(p => p.periodo === '30dias');
      if (projecao30 && projecao30.saldoProjetado < 0) {
        alertas.push({
          id: 'projecao-negativa',
          tipo: 'projecao_negativa',
          severidade: 'media',
          titulo: 'Projeção negativa em 30 dias',
          descricao: 'Com base no histórico, o saldo pode ficar negativo',
          valor: projecao30.saldoProjetado,
        });
      }
      
      // 4. Inadimplentes COM FILTRO DE TENANT
      const agendamentosNoLedger = new Set(
        entries.filter(e => e.tipo === 'IN' && e.agendamento_id).map(e => e.agendamento_id)
      );
      
      const { data: inadimplentes } = await supabase
        .from('agendamentos')
        .select('id, valor_total')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .lt('data_agendamento', format(subDays(hoje, 5), 'yyyy-MM-dd'))
        .eq('status', 'concluido');
      
      const realmenteInadimplentes = (inadimplentes || []).filter(
        (a: any) => !agendamentosNoLedger.has(a.id)
      );
      
      if (realmenteInadimplentes.length > 0) {
        const valorTotal = realmenteInadimplentes.reduce((sum: number, a: any) => sum + Number(a.valor_total), 0);
        alertas.push({
          id: 'inadimplentes',
          tipo: 'inadimplencia',
          severidade: 'media',
          titulo: `${realmenteInadimplentes.length} agendamentos inadimplentes`,
          descricao: 'Clientes com pagamento pendente há mais de 5 dias',
          valor: valorTotal,
        });
      }
      
      // Calcular DRE do ledger
      const receitaBruta = entries
        .filter(e => e.tipo === 'IN')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const reembolsos = entries
        .filter(e => e.tipo === 'OUT' && e.origem === 'reembolso')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const descontos = reembolsos; // Reembolsos = descontos para DRE
      const receitaLiquida = receitaBruta - descontos;
      
      const custoServicos = entries
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa' && e.categoria === 'produtos_insumos')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const despesasOperacionais = entries
        .filter(e => e.tipo === 'OUT' && e.origem === 'despesa' && e.categoria !== 'produtos_insumos')
        .reduce((sum, e) => sum + Number(e.valor), 0);
      
      const lucroOperacional = receitaLiquida - custoServicos;
      const lucroLiquido = lucroOperacional - despesasOperacionais;
      
      const margemBruta = receitaBruta > 0 ? (lucroOperacional / receitaBruta) * 100 : 0;
      const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;
      
      const dre: DRESimplificado = {
        periodo: `${format(dataInicio, 'dd/MM/yyyy')} - ${format(hoje, 'dd/MM/yyyy')}`,
        receitaBruta,
        descontos,
        receitaLiquida,
        custoServicos,
        lucroOperacional,
        despesasOperacionais,
        lucroLiquido,
        margemBruta,
        margemLiquida,
      };
      
      // Calcular ponto de equilíbrio COM FILTRO DE TENANT
      const { data: despesasFixas } = await supabase
        .from('despesas' as any)
        .select('valor')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .in('categoria', ['fixas', 'salarios'])
        .eq('status', 'paga');
      
      const custosFixos = (despesasFixas || []).reduce((sum: number, d: any) => sum + Number(d.valor), 0);
      const margemContribuicao = 0.6;
      const pontoEquilibrio = margemContribuicao > 0 ? custosFixos / margemContribuicao : 0;
      
      const diasSaudavel = mediaSaidas > 0 ? Math.floor(saldoAcumulado / mediaSaidas) : 999;
      
      return {
        movimentacoes,
        projecoes,
        alertas,
        dre,
        kpis: {
          saldoAtual: saldoAcumulado,
          mediaEntradas,
          mediaSaidas,
          pontoEquilibrio,
          diasSaudavel,
        },
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
    enabled: !!tenantId,
  });
}
