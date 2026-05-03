import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParceiro } from './useParceiro';

export interface ParceiroConversao {
  id: string;
  parceiro_id: string;
  link_id: string | null;
  agendamento_id: string;
  valor_agendamento: number;
  comissao_percentual: number;
  valor_comissao: number;
  status: 'pendente' | 'aprovada' | 'paga' | 'cancelada';
  aprovada_em: string | null;
  paga_em: string | null;
  created_at: string;
  // Dados do agendamento (join)
  agendamento?: {
    nome_cliente: string;
    data_agendamento: string;
    status: string;
    itens_carrinho: any;
  };
  // Dados do link (join)
  link?: {
    codigo: string;
    nome_campanha: string | null;
  };
}

interface UseParceiroConversoesReturn {
  conversoes: ParceiroConversao[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  totalPendente: number;
  totalAprovada: number;
  totalPaga: number;
  conversoesPorStatus: Record<string, ParceiroConversao[]>;
}

export function useParceiroConversoes(): UseParceiroConversoesReturn {
  const { parceiro } = useParceiro();
  const [conversoes, setConversoes] = useState<ParceiroConversao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversoes = useCallback(async () => {
    if (!parceiro) {
      setConversoes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('parceiro_conversoes')
        .select(`
          *,
          agendamento:agendamentos(nome_cliente, data_agendamento, status, itens_carrinho),
          link:parceiro_links(codigo, nome_campanha)
        `)
        .eq('parceiro_id', parceiro.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setConversoes(data as ParceiroConversao[]);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar conversões:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [parceiro]);

  useEffect(() => {
    fetchConversoes();
  }, [fetchConversoes]);

  // Configurar realtime
  useEffect(() => {
    if (!parceiro) return;

    const channel = supabase
      .channel('parceiro_conversoes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parceiro_conversoes',
          filter: `parceiro_id=eq.${parceiro.id}`,
        },
        () => {
          fetchConversoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parceiro, fetchConversoes]);

  const totalPendente = conversoes
    .filter(c => c.status === 'pendente')
    .reduce((acc, c) => acc + c.valor_comissao, 0);

  const totalAprovada = conversoes
    .filter(c => c.status === 'aprovada')
    .reduce((acc, c) => acc + c.valor_comissao, 0);

  const totalPaga = conversoes
    .filter(c => c.status === 'paga')
    .reduce((acc, c) => acc + c.valor_comissao, 0);

  const conversoesPorStatus = conversoes.reduce((acc, conversao) => {
    if (!acc[conversao.status]) {
      acc[conversao.status] = [];
    }
    acc[conversao.status].push(conversao);
    return acc;
  }, {} as Record<string, ParceiroConversao[]>);

  return {
    conversoes,
    loading,
    error,
    refetch: fetchConversoes,
    totalPendente,
    totalAprovada,
    totalPaga,
    conversoesPorStatus,
  };
}
