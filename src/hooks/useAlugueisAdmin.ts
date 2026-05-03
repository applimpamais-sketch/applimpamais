import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';
import { toast } from 'sonner';

export interface Aluguel {
  id: string;
  equipamento: string;
  periodo_aluguel: string;
  preco: number;
  tenant_id: string | null;
  created_at: string | null;
}

export type AluguelInput = {
  equipamento: string;
  periodo_aluguel: string;
  preco: number;
};

export function useAlugueisAdmin() {
  const queryClient = useQueryClient();
  const { tenant } = useTenantContext();
  const tenantId = tenant?.id;

  const { data: alugueis, isLoading, refetch } = useQuery({
    queryKey: ['alugueis-admin', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('alugueis')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('equipamento', { ascending: true })
        .order('preco', { ascending: true });
        
      if (error) throw error;
      return data as Aluguel[];
    },
    enabled: !!tenantId,
  });

  const createAluguel = useMutation({
    mutationFn: async (aluguel: AluguelInput) => {
      if (!tenantId) throw new Error('Tenant não encontrado');
      
      const { data, error } = await supabase
        .from('alugueis')
        .insert({ ...aluguel, tenant_id: tenantId })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Locação criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['alugueis-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error creating aluguel:', error);
      toast.error('Erro ao criar locação');
    },
  });

  const updateAluguel = useMutation({
    mutationFn: async ({ id, ...aluguel }: Partial<AluguelInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('alugueis')
        .update(aluguel)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Locação atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['alugueis-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error updating aluguel:', error);
      toast.error('Erro ao atualizar locação');
    },
  });

  const deleteAluguel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alugueis')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Locação excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['alugueis-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error deleting aluguel:', error);
      toast.error('Erro ao excluir locação');
    },
  });

  // Group by equipment
  const equipamentos = [...new Set(alugueis?.map(a => a.equipamento) || [])];
  
  const alugueisPorEquipamento = alugueis?.reduce((acc, a) => {
    if (!acc[a.equipamento]) acc[a.equipamento] = [];
    acc[a.equipamento].push(a);
    return acc;
  }, {} as Record<string, Aluguel[]>) || {};

  return { 
    alugueis: alugueis || [], 
    isLoading, 
    refetch,
    createAluguel, 
    updateAluguel, 
    deleteAluguel,
    equipamentos,
    alugueisPorEquipamento,
    tenantId,
  };
}
