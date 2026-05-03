import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Parceiro {
  id: string;
  user_id: string;
  nome: string;
  nome_exibicao: string | null;
  email: string;
  telefone: string;
  documento: string | null;
  tipo: 'influencer' | 'empresa' | 'afiliado';
  codigo_referencia: string;
  comissao_percentual: number;
  status: 'pendente' | 'ativo' | 'suspenso' | 'inativo';
  saldo_disponivel: number;
  total_ganhos: number;
  total_cliques: number;
  dados_bancarios: {
    tipo_chave_pix?: string;
    chave_pix?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
    tipo_conta?: string;
  };
  redes_sociais: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    facebook?: string;
  };
  created_at: string;
  updated_at: string;
  aprovado_por: string | null;
  aprovado_em: string | null;
}

interface UseParceiroReturn {
  parceiro: Parceiro | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateParceiro: (data: Partial<Parceiro>) => Promise<{ error: Error | null }>;
  isParceiro: boolean;
}

export function useParceiro(): UseParceiroReturn {
  const { user } = useAuth();
  const [parceiro, setParceiro] = useState<Parceiro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchParceiro = useCallback(async () => {
    if (!user) {
      setParceiro(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('parceiros')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      setParceiro(data as Parceiro | null);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar parceiro:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchParceiro();
  }, [fetchParceiro]);

  // Realtime subscription para atualizar saldo em tempo real
  useEffect(() => {
    if (!user) return;

    // Usar nome único do canal com timestamp para evitar conflitos em hot reload
    const channelName = `parceiro_saldo_${user.id}_${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'parceiros',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[useParceiro] Saldo atualizado em tempo real:', payload.new);
          setParceiro(payload.new as Parceiro);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateParceiro = async (data: Partial<Parceiro>) => {
    if (!parceiro) {
      return { error: new Error('Parceiro não encontrado') };
    }

    try {
      const { error: updateError } = await supabase
        .from('parceiros')
        .update(data)
        .eq('id', parceiro.id);

      if (updateError) throw updateError;

      await fetchParceiro();
      return { error: null };
    } catch (err) {
      console.error('Erro ao atualizar parceiro:', err);
      return { error: err as Error };
    }
  };

  return {
    parceiro,
    loading,
    error,
    refetch: fetchParceiro,
    updateParceiro,
    isParceiro: parceiro?.status === 'ativo',
  };
}
