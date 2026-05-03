import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';
import { toast } from 'sonner';

export interface Upsell {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  aplicavel_a: string[];
  ativo: boolean;
  tenant_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export type UpsellInput = {
  nome: string;
  descricao?: string | null;
  preco: number;
  aplicavel_a?: string[];
  ativo?: boolean;
};

export function useUpsellsAdmin() {
  const queryClient = useQueryClient();
  const { tenant } = useTenantContext();
  const tenantId = tenant?.id;

  const { data: upsells, isLoading, refetch } = useQuery({
    queryKey: ['upsells-admin', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('upsells')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('nome', { ascending: true });
        
      if (error) throw error;
      return data as Upsell[];
    },
    enabled: !!tenantId,
  });

  const createUpsell = useMutation({
    mutationFn: async (upsell: UpsellInput) => {
      if (!tenantId) throw new Error('Tenant não encontrado');
      
      const { data, error } = await supabase
        .from('upsells')
        .insert({ ...upsell, tenant_id: tenantId })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Upsell criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['upsells-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error creating upsell:', error);
      toast.error('Erro ao criar upsell');
    },
  });

  const updateUpsell = useMutation({
    mutationFn: async ({ id, ...upsell }: Partial<UpsellInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('upsells')
        .update(upsell)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Upsell atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['upsells-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error updating upsell:', error);
      toast.error('Erro ao atualizar upsell');
    },
  });

  const deleteUpsell = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('upsells')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Upsell excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['upsells-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error deleting upsell:', error);
      toast.error('Erro ao excluir upsell');
    },
  });

  const toggleUpsellAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { data, error } = await supabase
        .from('upsells')
        .update({ ativo })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.ativo ? 'Upsell ativado!' : 'Upsell desativado!');
      queryClient.invalidateQueries({ queryKey: ['upsells-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error toggling upsell:', error);
      toast.error('Erro ao alterar status do upsell');
    },
  });

  return { 
    upsells: upsells || [], 
    isLoading, 
    refetch,
    createUpsell, 
    updateUpsell, 
    deleteUpsell,
    toggleUpsellAtivo,
    tenantId,
  };
}
