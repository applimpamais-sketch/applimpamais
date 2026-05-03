import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Integracao {
  id: string;
  tipo: 'facebook' | 'webhook' | 'whatsapp' | 'utmify' | 'avaliacoes';
  nome: string;
  configuracao: any;
  status: 'ativo' | 'inativo' | 'erro';
  ultimo_uso?: string;
  criado_em: string;
  criado_por?: string;
  atualizado_em: string;
}

export function useIntegracoes(tipo?: string) {
  const queryClient = useQueryClient();

  const { data: integracoes, isLoading } = useQuery({
    queryKey: ['integracoes', tipo],
    queryFn: async () => {
      let query = supabase.from('integracoes' as any).select('*');
      
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      
      const { data, error } = await query.order('criado_em', { ascending: false });
      
      if (error) throw error;
      return ((data || []) as any[]) as Integracao[];
    },
  });

  const createIntegracao = useMutation({
    mutationFn: async (integracao: Omit<Integracao, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const { data, error } = await supabase
        .from('integracoes' as any)
        .insert([integracao])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integracoes'] });
      toast.success('Integração criada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao criar integração');
    },
  });

  const updateIntegracao = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Integracao> & { id: string }) => {
      const { data, error } = await supabase
        .from('integracoes' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integracoes'] });
      toast.success('Integração atualizada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar integração');
    },
  });

  const deleteIntegracao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('integracoes' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integracoes'] });
      toast.success('Integração removida com sucesso');
    },
    onError: () => {
      toast.error('Erro ao remover integração');
    },
  });

  return {
    integracoes,
    isLoading,
    createIntegracao,
    updateIntegracao,
    deleteIntegracao,
  };
}
