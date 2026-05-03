import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface Meta {
  id: string;
  mes_referencia: string;
  valor_meta: number;
  valor_realizado: number;
  percentual_atingido: number;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export function useMetas() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  const { data: metas, isLoading } = useQuery({
    queryKey: ['metas-financeiras', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('metas_financeiras')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('mes_referencia', { ascending: false });

      if (error) throw error;
      return data as Meta[];
    },
    enabled: !!tenantId,
  });

  const createMeta = useMutation({
    mutationFn: async (novaMeta: Omit<Meta, 'id' | 'created_at' | 'updated_at' | 'percentual_atingido'>) => {
      if (!tenantId) throw new Error('Tenant não identificado');
      
      const { data, error } = await supabase
        .from('metas_financeiras')
        .insert([{ ...novaMeta, tenant_id: tenantId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-financeiras', tenantId] });
      toast({
        title: 'Meta criada com sucesso!',
        description: 'A meta financeira foi adicionada.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar meta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMeta = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Meta> }) => {
      if (!tenantId) throw new Error('Tenant não identificado');
      
      const { data, error } = await supabase
        .from('metas_financeiras')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId) // Garantir que só atualiza do próprio tenant
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-financeiras', tenantId] });
      toast({
        title: 'Meta atualizada!',
        description: 'As alterações foram salvas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar meta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMeta = useMutation({
    mutationFn: async (id: string) => {
      if (!tenantId) throw new Error('Tenant não identificado');
      
      const { error } = await supabase
        .from('metas_financeiras')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId); // Garantir que só deleta do próprio tenant

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-financeiras', tenantId] });
      toast({
        title: 'Meta excluída',
        description: 'A meta foi removida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir meta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    metas,
    isLoading,
    createMeta: createMeta.mutate,
    updateMeta: updateMeta.mutate,
    deleteMeta: deleteMeta.mutate,
    isCreating: createMeta.isPending,
    isUpdating: updateMeta.isPending,
    isDeleting: deleteMeta.isPending,
  };
}
