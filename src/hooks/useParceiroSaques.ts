import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParceiro } from './useParceiro';
import { formatCurrency } from '@/utils/format';

export interface ParceiroSaque {
  id: string;
  parceiro_id: string;
  valor: number;
  metodo: 'pix' | 'transferencia';
  dados_pagamento: {
    tipo_chave_pix?: string;
    chave_pix?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
  };
  comprovante_url: string | null;
  status: 'solicitado' | 'processando' | 'pago' | 'rejeitado';
  motivo_rejeicao: string | null;
  processado_por: string | null;
  processado_em: string | null;
  created_at: string;
}

interface CreateSaqueData {
  valor: number;
  metodo: 'pix' | 'transferencia';
  dados_pagamento?: Record<string, string>;
}

interface UseParceiroSaquesReturn {
  saques: ParceiroSaque[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  solicitarSaque: (data: CreateSaqueData) => Promise<{ data: ParceiroSaque | null; error: Error | null }>;
  totalSolicitado: number;
  totalPago: number;
  podeSolicitar: boolean;
  saldoMinimo: number;
}

const SALDO_MINIMO_SAQUE = 1; // TODO: Temporário para testes - voltar para 50

export function useParceiroSaques(): UseParceiroSaquesReturn {
  const { parceiro } = useParceiro();
  const [saques, setSaques] = useState<ParceiroSaque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSaques = useCallback(async () => {
    if (!parceiro) {
      setSaques([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('parceiro_saques')
        .select('*')
        .eq('parceiro_id', parceiro.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setSaques(data as ParceiroSaque[]);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar saques:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [parceiro]);

  useEffect(() => {
    fetchSaques();
  }, [fetchSaques]);

  // Configurar realtime
  useEffect(() => {
    if (!parceiro) return;

    const channel = supabase
      .channel('parceiro_saques_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parceiro_saques',
          filter: `parceiro_id=eq.${parceiro.id}`,
        },
        () => {
          fetchSaques();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parceiro, fetchSaques]);

  const solicitarSaque = async (data: CreateSaqueData) => {
    if (!parceiro) {
      return { data: null, error: new Error('Parceiro não encontrado') };
    }

    // Buscar saldo mais recente do banco antes de validar
    const { data: saldoAtual, error: saldoError } = await supabase
      .from('parceiros')
      .select('saldo_disponivel')
      .eq('id', parceiro.id)
      .single();

    if (saldoError) {
      console.error('Erro ao verificar saldo:', saldoError);
      return { data: null, error: new Error('Erro ao verificar saldo. Tente novamente.') };
    }

    const saldoRealtime = saldoAtual?.saldo_disponivel ?? 0;

    if (saldoRealtime < SALDO_MINIMO_SAQUE) {
      return { data: null, error: new Error(`Saldo mínimo para saque é ${formatCurrency(SALDO_MINIMO_SAQUE)}. Seu saldo atual: ${formatCurrency(saldoRealtime)}`) };
    }

    if (data.valor > saldoRealtime) {
      return { data: null, error: new Error(`Valor solicitado (${formatCurrency(data.valor)}) maior que o saldo disponível (${formatCurrency(saldoRealtime)})`) };
    }

    // Verificar se já tem saque pendente (buscar do banco também)
    const { data: saquesPendentes } = await supabase
      .from('parceiro_saques')
      .select('id')
      .eq('parceiro_id', parceiro.id)
      .in('status', ['solicitado', 'processando'])
      .limit(1);

    if (saquesPendentes && saquesPendentes.length > 0) {
      return { data: null, error: new Error('Você já possui um saque em andamento') };
    }

    try {
      const { data: newSaque, error: createError } = await supabase
        .from('parceiro_saques')
        .insert({
          parceiro_id: parceiro.id,
          valor: data.valor,
          metodo: data.metodo,
          dados_pagamento: data.dados_pagamento || parceiro.dados_bancarios,
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchSaques();
      return { data: newSaque as ParceiroSaque, error: null };
    } catch (err) {
      console.error('Erro ao solicitar saque:', err);
      return { data: null, error: err as Error };
    }
  };

  const totalSolicitado = saques
    .filter(s => s.status === 'solicitado' || s.status === 'processando')
    .reduce((acc, s) => acc + s.valor, 0);

  const totalPago = saques
    .filter(s => s.status === 'pago')
    .reduce((acc, s) => acc + s.valor, 0);

  const podeSolicitar = 
    parceiro !== null &&
    parceiro.saldo_disponivel >= SALDO_MINIMO_SAQUE &&
    !saques.some(s => s.status === 'solicitado' || s.status === 'processando');

  return {
    saques,
    loading,
    error,
    refetch: fetchSaques,
    solicitarSaque,
    totalSolicitado,
    totalPago,
    podeSolicitar,
    saldoMinimo: SALDO_MINIMO_SAQUE,
  };
}
