import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { createSessionScopedSupabaseClient } from '@/lib/sessionScopedSupabase';
import { getOrCreateLiveSessionId } from '@/utils/liveSession';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContext } from '@/hooks/useTenantContext';
import { usePublicTenantId } from '@/hooks/usePublicTenantId';

interface SessionData {
  etapa?: 'navegando' | 'carrinho' | 'checkout' | 'concluido';
  carrinhoItems?: number;
  carrinhoValor?: number;
}

export function useSessionTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const { tenantId: tenantIdFromAuth } = useTenantContext();
  const { data: tenantIdFromDomain } = usePublicTenantId({ enabled: !user });
  const effectiveTenantId = user ? tenantIdFromAuth : (tenantIdFromDomain ?? null);

  const sessionIdRef = useRef<string | null>(null);
  const currentEtapaRef = useRef<'navegando' | 'carrinho' | 'checkout' | 'concluido'>('navegando');
  const locationDataRef = useRef<{ cidade: string; estado: string; pais: string }>({
    cidade: 'Desconhecido',
    estado: 'Desconhecido',
    pais: 'BR',
  });

  useEffect(() => {
    sessionIdRef.current = getOrCreateLiveSessionId();
  }, []);

  const updateSession = useCallback(async (data: SessionData) => {
    if (!sessionIdRef.current || !effectiveTenantId) return;

    if (data.etapa) {
      currentEtapaRef.current = data.etapa;
    }

    const sessionData = {
      session_id: sessionIdRef.current,
      tenant_id: effectiveTenantId,
      user_agent: navigator.userAgent,
      pagina_atual: window.location.pathname,
      etapa: data.etapa || currentEtapaRef.current,
      carrinho_items: data.carrinhoItems ?? 0,
      carrinho_valor: data.carrinhoValor ?? 0,
      ultima_atividade: new Date().toISOString(),
      ...locationDataRef.current,
    };

    try {
      const sessionClient = createSessionScopedSupabaseClient(sessionIdRef.current, effectiveTenantId);
      await sessionClient
        .from('live_sessions' as any)
        .upsert(sessionData, { onConflict: 'session_id' }) as any;
    } catch (error) {
      console.error('Erro ao atualizar sessao:', error);
    }
  }, [effectiveTenantId]);

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
      } catch {
        // ignore
      }
    };

    getLocationFromIP();
  }, [updateSession]);

  useEffect(() => {
    const isCheckout =
      location.pathname.includes('checkout') ||
      location.pathname.includes('agendamento');

    if (isCheckout) {
      currentEtapaRef.current = 'checkout';
      updateSession({ etapa: 'checkout' });
    } else if (currentEtapaRef.current === 'checkout') {
      currentEtapaRef.current = 'navegando';
      updateSession({ etapa: 'navegando' });
    }
  }, [location.pathname, updateSession]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateSession({});
    }, 30000);

    return () => clearInterval(interval);
  }, [updateSession]);

  return {
    updateSession,
    sessionId: sessionIdRef.current,
  };
}
