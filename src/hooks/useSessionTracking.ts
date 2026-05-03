import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { createSessionScopedSupabaseClient } from '@/lib/sessionScopedSupabase';
import { getOrCreateLiveSessionId } from '@/utils/liveSession';

interface SessionData {
  etapa?: 'navegando' | 'carrinho' | 'checkout' | 'concluido';
  carrinhoItems?: number;
  carrinhoValor?: number;
}

export function useSessionTracking() {
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const currentEtapaRef = useRef<'navegando' | 'carrinho' | 'checkout' | 'concluido'>('navegando');
  // Inicializar com valores padrão imediatamente
  const locationDataRef = useRef<{ cidade: string; estado: string; pais: string }>({ 
    cidade: 'Desconhecido', 
    estado: 'Desconhecido', 
    pais: 'BR' 
  });

  // Gerar ou recuperar session_id seguro (UUID v4) com rotação a cada 24h
  useEffect(() => {
    sessionIdRef.current = getOrCreateLiveSessionId();
  }, []);

  // Atualizar sessão no banco (função estável com useCallback)
  const updateSession = useCallback(async (data: SessionData) => {
    if (!sessionIdRef.current) {
      console.warn('[Session Tracking] Session ID não encontrado');
      return;
    }

    // Atualizar etapa atual se foi fornecida
    if (data.etapa) {
      currentEtapaRef.current = data.etapa;
    }

    const sessionData = {
      session_id: sessionIdRef.current,
      user_agent: navigator.userAgent,
      pagina_atual: window.location.pathname,
      etapa: data.etapa || currentEtapaRef.current,
      carrinho_items: data.carrinhoItems ?? 0,
      carrinho_valor: data.carrinhoValor ?? 0,
      ultima_atividade: new Date().toISOString(),
      ...locationDataRef.current,
    };

    try {
      const sessionClient = createSessionScopedSupabaseClient(sessionIdRef.current);
      await sessionClient
        .from('live_sessions' as any)
        .upsert(sessionData, { onConflict: 'session_id' }) as any;
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
    }
  }, []);

  // Detectar localização real de forma assíncrona (não-bloqueante)
  useEffect(() => {
    const getLocationFromIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        locationDataRef.current = {
          cidade: data.city || 'Desconhecido',
          estado: data.region || 'Desconhecido',
          pais: data.country_code || 'BR',
        };
        
        updateSession({ etapa: 'navegando' });
      } catch (error) {
        console.debug('Não foi possível detectar localização via IP');
      }
    };

    getLocationFromIP();
  }, [updateSession]);

  // Rastrear mudanças de página
  useEffect(() => {
    const isCheckout = location.pathname.includes('checkout') || 
                       location.pathname.includes('agendamento');
    
    // Só atualizar para checkout se estiver na página de checkout
    // Não sobrescrever se o usuário tem carrinho ativo
    if (isCheckout) {
      currentEtapaRef.current = 'checkout';
      updateSession({ etapa: 'checkout' });
    } else if (currentEtapaRef.current === 'checkout') {
      // Saiu do checkout, volta para navegando (ou carrinho se tiver itens)
      currentEtapaRef.current = 'navegando';
      updateSession({ etapa: 'navegando' });
    }
  }, [location.pathname, updateSession]);

  // Heartbeat a cada 30 segundos - preserva etapa atual
  useEffect(() => {
    const interval = setInterval(() => {
      // Apenas atualiza ultima_atividade, preservando a etapa atual
      updateSession({});
    }, 30000);

    return () => clearInterval(interval);
  }, [updateSession]);

  return {
    updateSession,
    sessionId: sessionIdRef.current,
  };
}
