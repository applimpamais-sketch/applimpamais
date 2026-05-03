import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, format, startOfMonth, endOfMonth, subMonths, startOfYesterday, endOfYesterday, addHours, isSameHour, isSameDay, eachDayOfInterval } from 'date-fns';
import { PeriodType } from '@/components/admin/PeriodFilter';
import { shouldCountRevenue, isFinalized } from '@/utils/statusHelpers';
import { useTenantContext } from '@/hooks/useTenantContext';

interface KPIStats {
  total: number;
  novos: number;
  concluidos: number;
  hoje: number;
  agendamentosViaBot: number;
  totalVsAnterior: number;
  novosVsAnterior: number;
  concluidosVsAnterior: number;
  hojeVsOntem: number;
  agendamentosViaBotVsAnterior: number;
  receitaRealizada: number;
  receitaPrevista: number;
  ticketMedio: number;
  taxaConversao: number;
  receitaRealizadaVsAnterior: number;
  receitaPrevistaVsAnterior: number;
  ticketMedioVsAnterior: number;
  taxaConversaoVsAnterior: number;
}

interface DayData {
  dia: string;
  quantidade: number;
}

interface BairroData {
  bairro: string;
  count: number;
}

interface ServicoData {
  nome: string;
  quantidade: number;
}

interface CupomData {
  codigo: string;
  usos: number;
  desconto: number;
}

 interface OrigemData {
   nome: string;
   tipo: 'parceiro' | 'canal' | 'bot' | 'atendente' | 'manual' | 'direto';
   quantidade: number;
 }

interface RevenueData {
  dia: string;
  receita: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface DashboardStats {
  kpis: KPIStats;
  last7Days: DayData[];
  last7DaysRevenue: RevenueData[];
  recentAgendamentos: any[];
  topBairros: BairroData[];
  topServicos: ServicoData[];
  topCupons: CupomData[];
  topOrigens: OrigemData[];
  statusDistribution: StatusData[];
}

export function useDashboardStats(period: PeriodType = 'maximo') {
  const { tenantId } = useTenantContext();
  
  const [stats, setStats] = useState<DashboardStats>({
    kpis: {
      total: 0,
      novos: 0,
      concluidos: 0,
      hoje: 0,
      agendamentosViaBot: 0,
      totalVsAnterior: 0,
      novosVsAnterior: 0,
      concluidosVsAnterior: 0,
      hojeVsOntem: 0,
      agendamentosViaBotVsAnterior: 0,
      receitaRealizada: 0,
      receitaPrevista: 0,
      ticketMedio: 0,
      taxaConversao: 0,
      receitaRealizadaVsAnterior: 0,
      receitaPrevistaVsAnterior: 0,
      ticketMedioVsAnterior: 0,
      taxaConversaoVsAnterior: 0,
    },
    last7Days: [],
    last7DaysRevenue: [],
    recentAgendamentos: [],
    topBairros: [],
    topServicos: [],
    topCupons: [],
    topOrigens: [],
    statusDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  const getDateRange = (period: PeriodType) => {
    const now = new Date();
    
    switch (period) {
      case 'hoje':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'ontem':
        return { start: startOfYesterday(), end: endOfYesterday() };
      case '7dias':
        return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
      case 'mes':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'mes-passado':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'maximo':
      default:
        return null;
    }
  };

  const loadStats = useCallback(async () => {
    // PROTEÇÃO: Não executar sem tenant
    if (!tenantId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const dateRange = getDateRange(period);
      
      // Buscar agendamentos COM FILTRO DE TENANT
      let query = supabase
        .from('agendamentos')
        .select('*')
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .order('created_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data: agendamentos, error } = await query;

      if (error) throw error;
      if (!agendamentos) return;

      // Buscar reembolsos COM FILTRO DE TENANT
      let reembolsosQuery = supabase
        .from('reembolsos' as any)
        .select('*')
        .eq('tenant_id', tenantId); // ← FILTRO OBRIGATÓRIO

      if (dateRange) {
        reembolsosQuery = reembolsosQuery
          .gte('data_reembolso', dateRange.start.toISOString())
          .lte('data_reembolso', dateRange.end.toISOString());
      }

      const { data: reembolsos, error: reembolsosError } = await reembolsosQuery;

      if (reembolsosError) throw reembolsosError;

      const now = new Date();
      const today = startOfDay(now);
      const yesterday = startOfYesterday();
      const thirtyDaysAgo = subDays(now, 30);
      const sixtyDaysAgo = subDays(now, 60);

      // KPIs - Agendamentos
      const total = agendamentos.length;
      const novos = agendamentos.filter(a => a.status === 'pendente').length;
      const concluidos = agendamentos.filter(a => isFinalized(a.status)).length;
      const hoje = agendamentos.filter(a => 
        new Date(a.created_at) >= today
      ).length;
      const ontem = agendamentos.filter(a => {
        const date = new Date(a.created_at);
        return date >= yesterday && date < today;
      }).length;

      // Comparações
      const last30Days = agendamentos.filter(a => 
        new Date(a.created_at) >= thirtyDaysAgo
      ).length;
      const previous30Days = agendamentos.filter(a => {
        const date = new Date(a.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length;
      const totalVsAnterior = previous30Days > 0 
        ? ((last30Days - previous30Days) / previous30Days) * 100 
        : last30Days > 0 ? 100 : 0;

      const novosLast30 = agendamentos.filter(a => 
        a.status === 'pendente' && new Date(a.created_at) >= thirtyDaysAgo
      ).length;
      const novosPrevious30 = agendamentos.filter(a => {
        const date = new Date(a.created_at);
        return a.status === 'pendente' && date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length;
      const novosVsAnterior = novosPrevious30 > 0
        ? ((novosLast30 - novosPrevious30) / novosPrevious30) * 100
        : novosLast30 > 0 ? 100 : 0;

      const concluidosLast30 = agendamentos.filter(a => 
        isFinalized(a.status) && new Date(a.created_at) >= thirtyDaysAgo
      ).length;
      const concluidosPrevious30 = agendamentos.filter(a => {
        const date = new Date(a.created_at);
        return isFinalized(a.status) && date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length;
      const concluidosVsAnterior = concluidosPrevious30 > 0
        ? ((concluidosLast30 - concluidosPrevious30) / concluidosPrevious30) * 100
        : concluidosLast30 > 0 ? 100 : 0;

      const hojeVsOntem = ontem > 0
        ? ((hoje - ontem) / ontem) * 100
        : hoje > 0 ? 100 : 0;

      // KPIs - Agendamentos via Bot
      const agendamentosViaBot = agendamentos.filter(a => a.origem === 'whatsapp_bot').length;
      const agendamentosViaBotLast30 = agendamentos.filter(a => 
        a.origem === 'whatsapp_bot' && new Date(a.created_at) >= thirtyDaysAgo
      ).length;
      const agendamentosViaBotPrevious30 = agendamentos.filter(a => {
        const date = new Date(a.created_at);
        return a.origem === 'whatsapp_bot' && date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length;
      const agendamentosViaBotVsAnterior = agendamentosViaBotPrevious30 > 0
        ? ((agendamentosViaBotLast30 - agendamentosViaBotPrevious30) / agendamentosViaBotPrevious30) * 100
        : agendamentosViaBotLast30 > 0 ? 100 : 0;

      // KPIs - Financeiros
      const receitaRealizadaBruta = agendamentos
        .filter(a => shouldCountRevenue(a.status))
        .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

      // Calcular reembolsos
      const valorReembolsado = (reembolsos || []).reduce((sum, r: any) => sum + Number(r.valor_reembolsado || 0), 0);

      // Receita realizada líquida (após reembolsos)
      const receitaRealizada = receitaRealizadaBruta - valorReembolsado;

      const receitaPrevista = agendamentos
        .filter(a => a.status !== 'cancelado')
        .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

      const ticketMedio = agendamentos.length > 0
        ? agendamentos.reduce((sum, a) => sum + Number(a.valor_total || 0), 0) / agendamentos.length
        : 0;

      const taxaConversao = total > 0 ? (concluidos / total) * 100 : 0;

      // Comparações Financeiras
      const receitaRealizadaBrutaLast30 = agendamentos
        .filter(a => shouldCountRevenue(a.status) && new Date(a.created_at) >= thirtyDaysAgo)
        .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

      const reembolsosLast30 = (reembolsos || [])
        .filter((r: any) => new Date(r.data_reembolso) >= thirtyDaysAgo)
        .reduce((sum, r: any) => sum + Number(r.valor_reembolsado || 0), 0);

      const receitaRealizadaLast30 = receitaRealizadaBrutaLast30 - reembolsosLast30;

      const receitaRealizadaBrutaPrevious30 = agendamentos
        .filter(a => {
          const date = new Date(a.created_at);
          return shouldCountRevenue(a.status) && date >= sixtyDaysAgo && date < thirtyDaysAgo;
        })
        .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

      const reembolsosPrevious30 = (reembolsos || [])
        .filter((r: any) => {
          const date = new Date(r.data_reembolso);
          return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        })
        .reduce((sum, r: any) => sum + Number(r.valor_reembolsado || 0), 0);

      const receitaRealizadaPrevious30 = receitaRealizadaBrutaPrevious30 - reembolsosPrevious30;

      const receitaRealizadaVsAnterior = receitaRealizadaPrevious30 > 0
        ? ((receitaRealizadaLast30 - receitaRealizadaPrevious30) / receitaRealizadaPrevious30) * 100
        : receitaRealizadaLast30 > 0 ? 100 : 0;

      const receitaPrevistaLast30 = agendamentos
        .filter(a => a.status !== 'cancelado' && new Date(a.created_at) >= thirtyDaysAgo)
        .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

      const receitaPrevistaPrevious30 = agendamentos
        .filter(a => {
          const date = new Date(a.created_at);
          return a.status !== 'cancelado' && date >= sixtyDaysAgo && date < thirtyDaysAgo;
        })
        .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

      const receitaPrevistaVsAnterior = receitaPrevistaPrevious30 > 0
        ? ((receitaPrevistaLast30 - receitaPrevistaPrevious30) / receitaPrevistaPrevious30) * 100
        : receitaPrevistaLast30 > 0 ? 100 : 0;

      const ticketMedioLast30Count = agendamentos.filter(a => new Date(a.created_at) >= thirtyDaysAgo).length;
      const ticketMedioLast30 = ticketMedioLast30Count > 0
        ? agendamentos
            .filter(a => new Date(a.created_at) >= thirtyDaysAgo)
            .reduce((sum, a) => sum + Number(a.valor_total || 0), 0) / ticketMedioLast30Count
        : 0;

      const ticketMedioPrevious30Count = agendamentos.filter(a => {
        const date = new Date(a.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length;
      const ticketMedioPrevious30 = ticketMedioPrevious30Count > 0
        ? agendamentos
            .filter(a => {
              const date = new Date(a.created_at);
              return date >= sixtyDaysAgo && date < thirtyDaysAgo;
            })
            .reduce((sum, a) => sum + Number(a.valor_total || 0), 0) / ticketMedioPrevious30Count
        : 0;

      const ticketMedioVsAnterior = ticketMedioPrevious30 > 0
        ? ((ticketMedioLast30 - ticketMedioPrevious30) / ticketMedioPrevious30) * 100
        : ticketMedioLast30 > 0 ? 100 : 0;

      const totalLast30 = agendamentos.filter(a => new Date(a.created_at) >= thirtyDaysAgo).length;
      const concluidosLast30Calc = agendamentos.filter(a => 
        a.status === 'concluido' && new Date(a.created_at) >= thirtyDaysAgo
      ).length;
      const taxaConversaoLast30 = totalLast30 > 0 ? (concluidosLast30Calc / totalLast30) * 100 : 0;

      const totalPrevious30 = agendamentos.filter(a => {
        const date = new Date(a.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length;
      const concluidosPrevious30Calc = agendamentos.filter(a => {
        const date = new Date(a.created_at);
        return a.status === 'concluido' && date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length;
      const taxaConversaoPrevious30 = totalPrevious30 > 0 ? (concluidosPrevious30Calc / totalPrevious30) * 100 : 0;

      const taxaConversaoVsAnterior = taxaConversaoPrevious30 > 0
        ? ((taxaConversaoLast30 - taxaConversaoPrevious30) / taxaConversaoPrevious30) * 100
        : taxaConversaoLast30 > 0 ? 100 : 0;

      // Gerar dados do gráfico de agendamentos baseado no período
      let chartData: DayData[] = [];
      
      // Gerar dados de receita (de acordo com o período selecionado)
      let revenueChartData: RevenueData[] = [];

      if (period === 'hoje') {
        // Receita por hora (hoje)
        revenueChartData = Array.from({ length: 24 }, (_, i) => {
          const hourStart = addHours(startOfDay(now), i);
          const hourEnd = addHours(hourStart, 1);

          const receita = agendamentos
            .filter(a => {
              const createdAt = new Date(a.created_at);
              return shouldCountRevenue(a.status) && createdAt >= hourStart && createdAt < hourEnd;
            })
            .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

          return {
            dia: format(hourStart, 'HH:00'),
            receita,
          };
        });
      } else if (period === 'ontem') {
        // Receita por hora (ontem)
        const yStart = startOfYesterday();
        revenueChartData = Array.from({ length: 24 }, (_, i) => {
          const hourStart = addHours(yStart, i);
          const hourEnd = addHours(hourStart, 1);

          const receita = agendamentos
            .filter(a => {
              const createdAt = new Date(a.created_at);
              return shouldCountRevenue(a.status) && createdAt >= hourStart && createdAt < hourEnd;
            })
            .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

          return {
            dia: format(hourStart, 'HH:00'),
            receita,
          };
        });
      } else if (period === 'mes' || period === 'mes-passado') {
        // Receita por dia (mês)
        const range = getDateRange(period);
        if (range) {
          const days = eachDayOfInterval({ start: range.start, end: range.end });
          revenueChartData = days.map(day => {
            const dayStart = startOfDay(day);
            const dayEnd = endOfDay(day);

            const receita = agendamentos
              .filter(a => {
                const createdAt = new Date(a.created_at);
                return shouldCountRevenue(a.status) && createdAt >= dayStart && createdAt <= dayEnd;
              })
              .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

            return {
              dia: format(day, 'dd/MM'),
              receita,
            };
          });
        }
      } else if (period === 'maximo') {
        // Receita total por mês (para não criar um gráfico enorme por dia)
        const byMonth = new Map<string, { key: string; label: string; receita: number }>();

        agendamentos
          .filter(a => shouldCountRevenue(a.status))
          .forEach(a => {
            const createdAt = new Date(a.created_at);
            // key ordenável; label amigável
            const key = format(createdAt, 'yyyy-MM');
            const label = format(createdAt, 'MM/yy');
            const current = byMonth.get(key);
            const valor = Number(a.valor_total || 0);
            if (current) {
              current.receita += valor;
            } else {
              byMonth.set(key, { key, label, receita: valor });
            }
          });

        revenueChartData = Array.from(byMonth.values())
          .sort((a, b) => a.key.localeCompare(b.key))
          .map(m => ({ dia: m.label, receita: m.receita }));
      } else {
        // Receita por dia (últimos 7 dias)
        revenueChartData = Array.from({ length: 7 }, (_, idx) => {
          const date = subDays(now, 6 - idx);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);

          const receita = agendamentos
            .filter(a => {
              const createdAt = new Date(a.created_at);
              return shouldCountRevenue(a.status) && createdAt >= dayStart && createdAt <= dayEnd;
            })
            .reduce((sum, a) => sum + Number(a.valor_total || 0), 0);

          return {
            dia: format(date, 'dd/MM'),
            receita,
          };
        });
      }

      if (period === 'hoje') {
        // Para "hoje", mostrar dados por hora (últimas 24h)
        for (let i = 23; i >= 0; i--) {
          const hour = subDays(now, 0);
          const hourStart = addHours(startOfDay(hour), 24 - i - 1);
          
          const count = agendamentos.filter(a => {
            const createdAt = new Date(a.created_at);
            return isSameHour(createdAt, hourStart);
          }).length;
          
          chartData.push({
            dia: format(hourStart, 'HH:00'),
            quantidade: count,
          });
        }
      } else if (period === 'ontem') {
        // Para "ontem", mostrar 24 horas de ontem
        const yesterdayStart = startOfYesterday();
        for (let i = 0; i < 24; i++) {
          const hour = addHours(yesterdayStart, i);
          
          const count = agendamentos.filter(a => {
            const createdAt = new Date(a.created_at);
            return isSameHour(createdAt, hour);
          }).length;
          
          chartData.push({
            dia: format(hour, 'HH:00'),
            quantidade: count,
          });
        }
      } else if (period === '7dias') {
        // Últimos 7 dias
        for (let i = 6; i >= 0; i--) {
          const date = subDays(now, i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);
          
          const count = agendamentos.filter(a => {
            const createdAt = new Date(a.created_at);
            return createdAt >= dayStart && createdAt <= dayEnd;
          }).length;

          chartData.push({
            dia: format(date, 'dd/MM'),
            quantidade: count,
          });
        }
      } else if (period === 'mes' || period === 'mes-passado') {
        // Para meses, mostrar por dia
        const range = getDateRange(period);
        if (range) {
          const days = eachDayOfInterval({ start: range.start, end: range.end });
          
          chartData = days.map(day => ({
            dia: format(day, 'dd/MM'),
            quantidade: agendamentos.filter(a => {
              const createdAt = new Date(a.created_at);
              return isSameDay(createdAt, day);
            }).length,
          }));
        }
      } else {
        // Para "maximo", mostrar últimos 30 dias
        for (let i = 29; i >= 0; i--) {
          const date = subDays(now, i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);
          
          const count = agendamentos.filter(a => {
            const createdAt = new Date(a.created_at);
            return createdAt >= dayStart && createdAt <= dayEnd;
          }).length;

          chartData.push({
            dia: format(date, 'dd/MM'),
            quantidade: count,
          });
        }
      }

      // Recent agendamentos (last 5)
      const recentAgendamentos = agendamentos.slice(0, 5);

      // Top 5 bairros
      const bairrosCount: Record<string, number> = {};
      agendamentos.forEach(a => {
        if (a.bairro) {
          bairrosCount[a.bairro] = (bairrosCount[a.bairro] || 0) + 1;
        }
      });
      const topBairros = Object.entries(bairrosCount)
        .map(([bairro, count]) => ({ bairro, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top servicos
      const servicosCount: Record<string, number> = {};
      agendamentos.forEach(agendamento => {
        const itens = agendamento.itens_carrinho as any[];
        itens?.forEach(item => {
          const key = item.name || 'Sem nome';
          servicosCount[key] = (servicosCount[key] || 0) + (item.quantity || 1);
        });
      });
      const topServicos = Object.entries(servicosCount)
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

      // Top Cupons Mais Usados
      const cuponsCount: Record<string, { usos: number; desconto: number }> = {};

      agendamentos.forEach(a => {
        if (a.cupom_codigo) {
          if (!cuponsCount[a.cupom_codigo]) {
            cuponsCount[a.cupom_codigo] = {
              usos: 0,
              desconto: Number(a.cupom_desconto_percentual || 0),
            };
          }
          cuponsCount[a.cupom_codigo].usos += 1;
        }
      });

      const topCupons = Object.entries(cuponsCount)
        .map(([codigo, data]) => ({
          codigo,
          usos: data.usos,
          desconto: data.desconto,
        }))
        .sort((a, b) => b.usos - a.usos)
        .slice(0, 5);

      // Top Origens - De onde vêm os agendamentos
      const origensCount: Record<string, { tipo: OrigemData['tipo']; quantidade: number }> = {};

      agendamentos.forEach(a => {
        let origemKey: string;
        let origemTipo: OrigemData['tipo'];

        if (a.parceiro_codigo) {
          // Parceiro - extrair código principal (MARIA10-SOFA -> MARIA10)
          const codigoPrincipal = a.parceiro_codigo.split('-')[0].toUpperCase();
          origemKey = `Parceiro: ${codigoPrincipal}`;
          origemTipo = 'parceiro';
        } else if (a.canal_origem) {
          // Canal orgânico interno
          origemKey = a.canal_origem;
          origemTipo = 'canal';
        } else if (a.origem === 'whatsapp_bot') {
          origemKey = 'Bot WhatsApp';
          origemTipo = 'bot';
        } else if (a.origem === 'atendente_whatsapp') {
          origemKey = 'Atendente WhatsApp';
          origemTipo = 'atendente';
        } else if (a.criado_manualmente) {
          origemKey = 'Manual (Admin)';
          origemTipo = 'manual';
        } else {
          origemKey = 'Direto (Site)';
          origemTipo = 'direto';
        }

        if (!origensCount[origemKey]) {
          origensCount[origemKey] = { tipo: origemTipo, quantidade: 0 };
        }
        origensCount[origemKey].quantidade += 1;
      });

      const topOrigens = Object.entries(origensCount)
        .map(([nome, data]) => ({
          nome,
          tipo: data.tipo,
          quantidade: data.quantidade,
        }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

      // Status distribution
      const statusDistribution = [
        { name: 'Pendente', value: novos },
        { name: 'Confirmado', value: agendamentos.filter(a => a.status === 'confirmado').length },
        { name: 'Concluído', value: concluidos },
        { 
          name: 'Cancelado', 
          value: agendamentos.filter(a => a.status === 'cancelado').length 
        },
      ];

      setStats({
        kpis: {
          total,
          novos,
          concluidos,
          hoje,
          agendamentosViaBot,
          totalVsAnterior,
          novosVsAnterior,
          concluidosVsAnterior,
          hojeVsOntem,
          agendamentosViaBotVsAnterior,
          receitaRealizada,
          receitaPrevista,
          ticketMedio,
          taxaConversao,
          receitaRealizadaVsAnterior,
          receitaPrevistaVsAnterior,
          ticketMedioVsAnterior,
          taxaConversaoVsAnterior,
        },
        last7Days: chartData,
        last7DaysRevenue: revenueChartData,
        recentAgendamentos,
        topBairros,
        topServicos,
        topCupons,
        topOrigens,
        statusDistribution,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, [period, tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    
    loadStats();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    
    // Realtime: Recarregar quando agendamentos do tenant mudarem
    const channel = supabase
      .channel(`dashboard-stats-realtime-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos',
          filter: `tenant_id=eq.${tenantId}` // ← FILTRO OBRIGATÓRIO
        },
        () => {
          console.log('📊 Agendamento atualizado - recarregando dashboard stats');
          loadStats();
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [period, tenantId, loadStats]);

  return { stats, loading, refresh: loadStats };
}
