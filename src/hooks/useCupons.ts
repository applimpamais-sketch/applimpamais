import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLimitValidation } from './useLimitValidation';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface Cupom {
  id: string;
  codigo: string;
  desconto_percentual: number;
  categorias_aplicaveis: string[];
  tipo_aplicacao: string;
  status: string;
  data_validade_inicio: string | null;
  data_validade_fim: string | null;
  uso_maximo: number | null;
  uso_atual: number;
  auto_aplicar: boolean;
  created_at: string;
  updated_at: string;
}

export function useCupons() {
  const queryClient = useQueryClient();
  const { validateLimit } = useLimitValidation();
  const { tenantId } = useTenantContext();

  const { data: cupons, isLoading } = useQuery({
    queryKey: ['cupons', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('cupons_desconto')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Cupom[];
    },
    enabled: !!tenantId,
  });

  const createCupom = useMutation({
    mutationFn: async (cupomData: any) => {
      if (!tenantId) throw new Error('Tenant não identificado');
      
      // Validar limite antes de criar
      const validation = validateLimit('cupons');
      
      if (!validation.canProceed) {
        validation.showError();
        throw new Error('Limite de cupons atingido');
      }

      validation.showWarning();

      const { data, error } = await supabase
        .from('cupons_desconto')
        .insert([{ ...cupomData, tenant_id: tenantId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupons', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['cupons-auto-apply'] });
      queryClient.invalidateQueries({ queryKey: ['cupons-publicos'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-usage'] });
      toast({ 
        title: 'Cupom criado com sucesso!',
        description: 'O novo cupom está disponível para uso.'
      });
    },
    onError: (error: any) => {
      if (error.message?.includes('Limite')) return;
      toast({ 
        title: 'Erro ao criar cupom',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateCupom = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!tenantId) throw new Error('Tenant não identificado');
      
      const { data, error } = await supabase
        .from('cupons_desconto')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId) // Garantir que só atualiza do próprio tenant
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupons', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['cupons-auto-apply'] });
      queryClient.invalidateQueries({ queryKey: ['cupons-publicos'] });
      toast({ 
        title: 'Cupom atualizado!',
        description: 'As alterações foram salvas com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao atualizar cupom',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteCupom = useMutation({
    mutationFn: async (id: string) => {
      if (!tenantId) throw new Error('Tenant não identificado');
      
      const { error } = await supabase
        .from('cupons_desconto')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId); // Garantir que só deleta do próprio tenant
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupons', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['cupons-auto-apply'] });
      queryClient.invalidateQueries({ queryKey: ['cupons-publicos'] });
      toast({ 
        title: 'Cupom excluído!',
        description: 'O cupom foi removido permanentemente.'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao excluir cupom',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    cupons: cupons || [],
    isLoading,
    createCupom: createCupom.mutate,
    updateCupom: updateCupom.mutate,
    deleteCupom: deleteCupom.mutate,
    isCreating: createCupom.isPending,
    isUpdating: updateCupom.isPending,
    isDeleting: deleteCupom.isPending,
  };
}
