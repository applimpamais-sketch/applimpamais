import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePeriodDateRange } from './usePeriodDateRange';
import type { PeriodType } from '@/components/admin/PeriodFilter';

export interface TrackingSession {
  id: string;
  tecnico_id: string;
  tecnico_nome: string;
  agendamento_id: string;
  status: string;
  iniciado_em: string;
  chegou_em: string | null;
  concluido_em: string | null;
  eta_minutos: number | null;
  distancia_metros: number | null;
  // Join fields from agendamentos
  nome_cliente?: string;
  bairro?: string;
  horario?: string;
  data_agendamento?: string;
}

export interface TecnicoPunctuality {
  tecnico_id: string;
  tecnico_nome: string;
  total: number;
  pontual: number;
  toleravel: number;
  atrasado: number;
  percentualPontual: number;
}

export interface TrackingMetrics {
  totalSessoes: number;
  tempoMedioMinutos: number;
  taxaPontualidade: number;
  sessoesAtivas: number;
  distanciaMediaKm: number;
}

type Pontualidade = 'pontual' | 'toleravel' | 'atrasado' | 'sem_dados';

export function calcularPontualidade(
  chegouEm: string | null,
  horarioAgendado: string | null,
  dataAgendamento: string | null
): Pontualidade {
  if (!chegouEm || !horarioAgendado || !dataAgendamento) return 'sem_dados';
  
  try {
    // horarioAgendado = "14:00 - 16:00" or "08:00 - 10:00"
    const parts = horarioAgendado.split(' - ');
    if (parts.length !== 2) return 'sem_dados';
    
    const horarioFim = parts[1].trim(); // "16:00"
    const [horas, minutos] = horarioFim.split(':').map(Number);
    
    // Create end time using the appointment date
    const dataAgendamentoDate = new Date(dataAgendamento + 'T00:00:00');
    const fimHorario = new Date(dataAgendamentoDate);
    fimHorario.setHours(horas, minutos, 0, 0);
    
    const chegou = new Date(chegouEm);
    
    // If arrived before end of window = on time
    if (chegou <= fimHorario) return 'pontual';
    
    // If arrived within 30 minutes = tolerable
    const atrasoMinutos = (chegou.getTime() - fimHorario.getTime()) / 60000;
    if (atrasoMinutos <= 30) return 'toleravel';
    
    return 'atrasado';
  } catch {
    return 'sem_dados';
  }
}

export function useTrackingHistory(
  period: PeriodType,
  customRange?: { start: Date; end: Date },
  tecnicoFilter?: string
) {
  const dateRange = usePeriodDateRange(period, customRange);
  
  return useQuery({
    queryKey: ['tracking-history', period, customRange, tecnicoFilter],
    queryFn: async () => {
      // Build query for tracking_sessions with join to agendamentos
      let query = supabase
        .from('tracking_sessions')
        .select(`
          *,
          agendamentos (
            nome_cliente,
            bairro,
            horario,
            data_agendamento
          )
        `)
        .order('iniciado_em', { ascending: false });
      
      // Apply date filter
      if (dateRange) {
        query = query
          .gte('iniciado_em', dateRange.start.toISOString())
          .lte('iniciado_em', dateRange.end.toISOString());
      }
      
      // Apply technician filter
      if (tecnicoFilter) {
        query = query.eq('tecnico_id', tecnicoFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data with joined fields
      const sessions: TrackingSession[] = (data || []).map((item: any) => ({
        id: item.id,
        tecnico_id: item.tecnico_id,
        tecnico_nome: item.tecnico_nome,
        agendamento_id: item.agendamento_id,
        status: item.status,
        iniciado_em: item.iniciado_em,
        chegou_em: item.chegou_em,
        concluido_em: item.concluido_em,
        eta_minutos: item.eta_minutos,
        distancia_metros: item.distancia_metros,
        nome_cliente: item.agendamentos?.nome_cliente,
        bairro: item.agendamentos?.bairro,
        horario: item.agendamentos?.horario,
        data_agendamento: item.agendamentos?.data_agendamento,
      }));
      
      // Calculate metrics
      const sessoesComChegada = sessions.filter(s => s.chegou_em && s.iniciado_em);
      
      let tempoMedioMinutos = 0;
      if (sessoesComChegada.length > 0) {
        const totalMinutos = sessoesComChegada.reduce((acc, s) => {
          const inicio = new Date(s.iniciado_em).getTime();
          const chegou = new Date(s.chegou_em!).getTime();
          return acc + (chegou - inicio) / 60000;
        }, 0);
        tempoMedioMinutos = Math.round(totalMinutos / sessoesComChegada.length);
      }
      
      // Calculate punctuality
      let pontualCount = 0;
      let toleravelCount = 0;
      let atrasadoCount = 0;
      
      sessions.forEach(s => {
        const p = calcularPontualidade(s.chegou_em, s.horario, s.data_agendamento);
        if (p === 'pontual') pontualCount++;
        else if (p === 'toleravel') toleravelCount++;
        else if (p === 'atrasado') atrasadoCount++;
      });
      
      const totalComDados = pontualCount + toleravelCount + atrasadoCount;
      const taxaPontualidade = totalComDados > 0 
        ? Math.round(((pontualCount + toleravelCount) / totalComDados) * 100) 
        : 0;
      
      // Active sessions (em_rota status)
      const sessoesAtivas = sessions.filter(s => s.status === 'em_rota').length;
      
      // Average distance
      const sessoesComDistancia = sessions.filter(s => s.distancia_metros && s.distancia_metros > 0);
      const distanciaMediaKm = sessoesComDistancia.length > 0
        ? sessoesComDistancia.reduce((acc, s) => acc + (s.distancia_metros || 0), 0) / sessoesComDistancia.length / 1000
        : 0;
      
      const metrics: TrackingMetrics = {
        totalSessoes: sessions.length,
        tempoMedioMinutos,
        taxaPontualidade,
        sessoesAtivas,
        distanciaMediaKm: Math.round(distanciaMediaKm * 10) / 10,
      };
      
      // Calculate punctuality by technician
      const tecnicoMap = new Map<string, TecnicoPunctuality>();
      
      sessions.forEach(s => {
        if (!tecnicoMap.has(s.tecnico_id)) {
          tecnicoMap.set(s.tecnico_id, {
            tecnico_id: s.tecnico_id,
            tecnico_nome: s.tecnico_nome,
            total: 0,
            pontual: 0,
            toleravel: 0,
            atrasado: 0,
            percentualPontual: 0,
          });
        }
        
        const tecnico = tecnicoMap.get(s.tecnico_id)!;
        const p = calcularPontualidade(s.chegou_em, s.horario, s.data_agendamento);
        
        if (p !== 'sem_dados') {
          tecnico.total++;
          if (p === 'pontual') tecnico.pontual++;
          else if (p === 'toleravel') tecnico.toleravel++;
          else if (p === 'atrasado') tecnico.atrasado++;
        }
      });
      
      // Calculate percentages and sort
      const tecnicosPunctuality = Array.from(tecnicoMap.values())
        .map(t => ({
          ...t,
          percentualPontual: t.total > 0 
            ? Math.round(((t.pontual + t.toleravel) / t.total) * 100) 
            : 0,
        }))
        .filter(t => t.total > 0)
        .sort((a, b) => b.percentualPontual - a.percentualPontual);
      
      return {
        sessions,
        metrics,
        tecnicosPunctuality,
      };
    },
  });
}
