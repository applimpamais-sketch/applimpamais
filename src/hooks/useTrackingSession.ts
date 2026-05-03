import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrackingSession {
  id: string;
  agendamento_id: string;
  tecnico_id: string;
  token_publico: string;
  status: 'em_rota' | 'chegou' | 'servico_em_andamento' | 'concluido' | 'cancelado';
  iniciado_em: string;
  chegou_em: string | null;
  concluido_em: string | null;
  destino_latitude: number | null;
  destino_longitude: number | null;
  origem_latitude: number | null;
  origem_longitude: number | null;
  eta_minutos: number | null;
  distancia_metros: number | null;
  tecnico_nome: string | null;
}

interface CreateSessionParams {
  agendamentoId: string;
  tecnicoId: string;
  tecnicoNome: string;
  destinoLatitude?: number | null;
  destinoLongitude?: number | null;
  origemLatitude?: number | null;
  origemLongitude?: number | null;
}

export function useTrackingSession() {
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Criar nova sessão de tracking
  const createSession = useCallback(async ({
    agendamentoId,
    tecnicoId,
    tecnicoNome,
    destinoLatitude,
    destinoLongitude,
    origemLatitude,
    origemLongitude,
  }: CreateSessionParams): Promise<TrackingSession | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se já existe sessão ativa para este agendamento
      const { data: existingSession } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('agendamento_id', agendamentoId)
        .in('status', ['em_rota', 'chegou', 'servico_em_andamento'])
        .maybeSingle();

      if (existingSession) {
        setSession(existingSession as TrackingSession);
        return existingSession as TrackingSession;
      }

      // Criar nova sessão com posição de origem
      const { data, error: insertError } = await supabase
        .from('tracking_sessions')
        .insert({
          agendamento_id: agendamentoId,
          tecnico_id: tecnicoId,
          tecnico_nome: tecnicoNome,
          destino_latitude: destinoLatitude,
          destino_longitude: destinoLongitude,
          origem_latitude: origemLatitude,
          origem_longitude: origemLongitude,
          status: 'em_rota',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSession(data as TrackingSession);
      return data as TrackingSession;
    } catch (err: any) {
      console.error('Erro ao criar sessão de tracking:', err);
      setError(err.message);
      toast.error('Erro ao iniciar rastreamento');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar status da sessão
  const updateStatus = useCallback(async (
    sessionId: string, 
    newStatus: 'chegou' | 'servico_em_andamento' | 'concluido' | 'cancelado'
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'chegou') {
        updates.chegou_em = new Date().toISOString();
      } else if (newStatus === 'concluido' || newStatus === 'cancelado') {
        updates.concluido_em = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('tracking_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (updateError) throw updateError;

      setSession((prev) => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar sessão:', err);
      toast.error('Erro ao atualizar status');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar ETA e distância
  const updateETA = useCallback(async (
    sessionId: string,
    etaMinutos: number,
    distanciaMetros: number
  ): Promise<void> => {
    try {
      await supabase
        .from('tracking_sessions')
        .update({
          eta_minutos: etaMinutos,
          distancia_metros: distanciaMetros,
        })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Erro ao atualizar ETA:', err);
    }
  }, []);

  // Buscar sessão ativa do técnico
  const fetchActiveSession = useCallback(async (tecnicoId: string): Promise<TrackingSession | null> => {
    setIsLoading(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('tecnico_id', tecnicoId)
        .in('status', ['em_rota', 'chegou', 'servico_em_andamento'])
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (fetchError) throw fetchError;

      setSession(data as TrackingSession | null);
      return data as TrackingSession | null;
    } catch (err: any) {
      console.error('Erro ao buscar sessão:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar sessão por token (para página pública)
  const fetchByToken = useCallback(async (token: string): Promise<TrackingSession | null> => {
    setIsLoading(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('token_publico', token)
        .maybeSingle();

      if (fetchError) throw fetchError;

      setSession(data as TrackingSession | null);
      return data as TrackingSession | null;
    } catch (err: any) {
      console.error('Erro ao buscar sessão por token:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancelar sessão
  const cancelSession = useCallback(async (sessionId: string): Promise<boolean> => {
    return updateStatus(sessionId, 'cancelado');
  }, [updateStatus]);

  return {
    session,
    isLoading,
    error,
    createSession,
    updateStatus,
    updateETA,
    fetchActiveSession,
    fetchByToken,
    cancelSession,
  };
}
