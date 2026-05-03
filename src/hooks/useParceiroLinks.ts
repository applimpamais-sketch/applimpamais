import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParceiro } from './useParceiro';

export interface ParceiroLink {
  id: string;
  parceiro_id: string;
  codigo: string;
  url_destino: string;
  nome_campanha: string | null;
  cupom_vinculado: string | null;
  cliques: number;
  conversoes: number;
  receita_gerada: number;
  status: 'ativo' | 'pausado' | 'expirado';
  validade: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateLinkData {
  codigo: string;
  url_destino?: string;
  nome_campanha?: string;
  cupom_vinculado?: string;
  validade?: string;
}

interface UseParceiroLinksReturn {
  links: ParceiroLink[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createLink: (data: CreateLinkData) => Promise<{ data: ParceiroLink | null; error: Error | null }>;
  updateLink: (id: string, data: Partial<ParceiroLink>) => Promise<{ error: Error | null }>;
  deleteLink: (id: string) => Promise<{ error: Error | null }>;
  totalCliques: number;
  totalConversoes: number;
  totalReceita: number;
}

interface ConversaoData {
  valor_agendamento: number;
  valor_comissao: number;
  link_id: string | null;
}

export function useParceiroLinks(): UseParceiroLinksReturn {
  const { parceiro } = useParceiro();
  const [links, setLinks] = useState<ParceiroLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [conversoesData, setConversoesData] = useState<ConversaoData[]>([]);

  const fetchLinks = useCallback(async () => {
    if (!parceiro) {
      setLinks([]);
      setConversoesData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar links E conversões aprovadas em paralelo
      const [linksResult, conversoesResult] = await Promise.all([
        supabase
          .from('parceiro_links')
          .select('*')
          .eq('parceiro_id', parceiro.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('parceiro_conversoes')
          .select('valor_agendamento, valor_comissao, link_id')
          .eq('parceiro_id', parceiro.id)
          .in('status', ['aprovada', 'paga'])
      ]);

      if (linksResult.error) throw linksResult.error;
      
      setLinks(linksResult.data as ParceiroLink[]);
      setConversoesData(conversoesResult.data || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar links:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [parceiro]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const createLink = async (data: CreateLinkData) => {
    if (!parceiro) {
      return { data: null, error: new Error('Parceiro não encontrado') };
    }

    try {
      const { data: newLink, error: createError } = await supabase
        .from('parceiro_links')
        .insert({
          parceiro_id: parceiro.id,
          codigo: data.codigo,
          url_destino: data.url_destino || '/agendamento',
          nome_campanha: data.nome_campanha || null,
          cupom_vinculado: data.cupom_vinculado || null,
          validade: data.validade || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchLinks();
      return { data: newLink as ParceiroLink, error: null };
    } catch (err) {
      console.error('Erro ao criar link:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateLink = async (id: string, data: Partial<ParceiroLink>) => {
    try {
      const { error: updateError } = await supabase
        .from('parceiro_links')
        .update(data)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchLinks();
      return { error: null };
    } catch (err) {
      console.error('Erro ao atualizar link:', err);
      return { error: err as Error };
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('parceiro_links')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchLinks();
      return { error: null };
    } catch (err) {
      console.error('Erro ao deletar link:', err);
      return { error: err as Error };
    }
  };

  // KPIs calculados dinamicamente a partir de parceiro_conversoes (dados reais) 
  // total_cliques vem do parceiro (inclui link principal + links de campanha)
  const totalCliques = parceiro?.total_cliques || 0;
  const totalConversoes = conversoesData.length;
  const totalReceita = conversoesData.reduce((acc, c) => acc + (c.valor_agendamento || 0), 0);

  return {
    links,
    loading,
    error,
    refetch: fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    totalCliques,
    totalConversoes,
    totalReceita,
  };
}
