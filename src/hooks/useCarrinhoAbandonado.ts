import { useEffect, useRef, useState } from 'react';
import { getValidCanalRef } from '@/utils/canalRef';
import { createSessionScopedSupabaseClient } from '@/lib/sessionScopedSupabase';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContext } from '@/hooks/useTenantContext';
import { usePublicTenantId } from '@/hooks/usePublicTenantId';

interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: number;
}

interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
}

interface UseCarrinhoAbandonadoProps {
  cartItems: CartItem[];
  etapa: 'carrinho' | 'agendamento';
  customerInfo?: CustomerInfo;
  selectedDate?: Date | null;
  cupomCodigo?: string;
  cupomDesconto?: number;
  valorDesconto?: number;
  valorFrete?: number;
   canalOrigem?: string;
}

const DEBOUNCE_DELAY = 10000; // 10 segundos
const SESSION_KEY = 'carrinho_session_id';
const SESSION_CREATED_AT_KEY = 'carrinho_session_created_at';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useCarrinhoAbandonado({
  cartItems,
  etapa,
  customerInfo,
  selectedDate,
  cupomCodigo,
  cupomDesconto,
  valorDesconto,
  valorFrete,
   canalOrigem,
}: UseCarrinhoAbandonadoProps) {
  const { user } = useAuth();
  const { tenantId: tenantIdFromAuth } = useTenantContext();
  const { data: tenantIdFromDomain } = usePublicTenantId({ enabled: !user });
  const effectiveTenantId = user ? tenantIdFromAuth : (tenantIdFromDomain ?? null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedDataRef = useRef<string>('');
  const [sessionId] = useState(() => {
    let id = localStorage.getItem(SESSION_KEY);
    const createdAtRaw = localStorage.getItem(SESSION_CREATED_AT_KEY);
    const createdAt = createdAtRaw ? Number(createdAtRaw) : 0;

    const isExpired = !createdAt || Number.isNaN(createdAt) || Date.now() - createdAt > SESSION_TTL_MS;
    const isInvalid = !id || !UUID_V4_REGEX.test(id);

    if (isInvalid || isExpired) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_CREATED_AT_KEY, Date.now().toString());
    } else if (!createdAtRaw) {
      localStorage.setItem(SESSION_CREATED_AT_KEY, Date.now().toString());
    }

    localStorage.setItem(SESSION_KEY, id);
    return id;
  });

  const calcularPercentualPreenchimento = (): number => {
    if (etapa === 'carrinho') return 0;
    
    const campos = {
      nome: customerInfo?.name || '',
      telefone: customerInfo?.phone || '',
      endereco: customerInfo?.address || '',
      bairro: customerInfo?.bairro || '',
      cidade: customerInfo?.cidade || '',
      cep: customerInfo?.cep || '',
      data: selectedDate ? 'sim' : '',
    };

    const preenchidos = Object.values(campos).filter(v => v.trim() !== '').length;
    const total = Object.keys(campos).length;
    
    return Math.round((preenchidos / total) * 100);
  };

  const salvarCarrinhoAbandonado = async () => {
    if (!effectiveTenantId) return;

    // FIX #2: Salvar carrinho abandonado mesmo sem telefone
    // Só pular se o carrinho estiver vazio
    if (cartItems.length === 0) return;

    const valorTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
     
     // Obter canal de origem atual
     const canalRef = canalOrigem || getValidCanalRef();
    
    const data = {
      session_id: sessionId,
      etapa_abandonada: etapa,
      itens_carrinho: cartItems,
      valor_total: valorTotal,
      nome_cliente: customerInfo?.name || null,
      telefone: customerInfo?.phone || null,
      email: customerInfo?.email || null,
      endereco: customerInfo?.address || null,
      bairro: customerInfo?.bairro || null,
      cidade: customerInfo?.cidade || null,
      cep: customerInfo?.cep || null,
      data_agendamento: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
      cupom_codigo: cupomCodigo || null,
      cupom_desconto_percentual: cupomDesconto || null,
      valor_desconto: valorDesconto || 0,
      valor_frete: valorFrete || 0,
      percentual_preenchimento: calcularPercentualPreenchimento(),
      user_agent: navigator.userAgent,
      last_activity: new Date().toISOString(),
      canal_origem: canalRef || null,
      tenant_id: effectiveTenantId,
    };

    // Verificar se houve mudanças
    const dataString = JSON.stringify(data);
    if (dataString === lastSavedDataRef.current) return;

    try {
      const sessionClient = createSessionScopedSupabaseClient(sessionId, effectiveTenantId);

      // Tenta atualizar o carrinho ativo da sessão; se não existir, cria um novo
      const { count, error: updateError } = await sessionClient
        .from('carrinhos_abandonados')
        .update(data as any, { count: 'exact' })
        .eq('session_id', sessionId)
        .eq('status', 'abandonado');

      if (updateError) throw updateError;

      if (!count || count === 0) {
        const { error: insertError } = await sessionClient
          .from('carrinhos_abandonados')
          .insert(data as any);

        if (insertError) throw insertError;
      }

      lastSavedDataRef.current = dataString;
    } catch (error) {
      console.error('Erro ao salvar carrinho abandonado:', error);
    }
  };

  const limparCarrinhoAbandonado = async () => {
    if (!effectiveTenantId) return;

    try {
      const sessionClient = createSessionScopedSupabaseClient(sessionId, effectiveTenantId);

      // Marcar como recuperado
      await sessionClient
        .from('carrinhos_abandonados')
        .update({ status: 'recuperado' })
        .eq('session_id', sessionId)
        .eq('status', 'abandonado');
      
      // Limpar sessão para criar um novo ciclo de carrinho
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_CREATED_AT_KEY);
    } catch (error) {
      console.error('Erro ao limpar carrinho abandonado:', error);
    }
  };

  useEffect(() => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Agendar salvamento com debounce
    timeoutRef.current = setTimeout(() => {
      salvarCarrinhoAbandonado();
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cartItems, etapa, customerInfo, selectedDate, cupomCodigo, effectiveTenantId]);
 
   return {
     sessionId,
     limparCarrinhoAbandonado,
   };
}
