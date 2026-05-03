import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';
import { toast } from 'sonner';

export interface Servico {
  id: string;
  categoria: string;
  subcategoria: string;
  item: string;
  tamanho: string | null;
  preco_limpeza: number | null;
  preco_impermeabilizacao: number | null;
  preco_limpeza_impermeabilizacao: number | null;
  tenant_id: string | null;
  created_at: string | null;
}

export type ServicoInput = {
  categoria: string;
  subcategoria: string;
  item: string;
  tamanho?: string | null;
  preco_limpeza?: number | null;
  preco_impermeabilizacao?: number | null;
  preco_limpeza_impermeabilizacao?: number | null;
};

export function useServicosAdmin() {
  const queryClient = useQueryClient();
  const { tenant } = useTenantContext();
  const tenantId = tenant?.id;

  // List all services for the tenant
  const { data: servicos, isLoading, refetch } = useQuery({
    queryKey: ['servicos-admin', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('categoria', { ascending: true })
        .order('subcategoria', { ascending: true })
        .order('item', { ascending: true });
        
      if (error) throw error;
      return data as Servico[];
    },
    enabled: !!tenantId,
  });

  // Create service
  const createServico = useMutation({
    mutationFn: async (servico: ServicoInput) => {
      if (!tenantId) throw new Error('Tenant não encontrado');
      
      const { data, error } = await supabase
        .from('servicos')
        .insert({ 
          ...servico, 
          tenant_id: tenantId 
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Serviço criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['servicos-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error creating service:', error);
      toast.error('Erro ao criar serviço');
    },
  });

  // Update service
  const updateServico = useMutation({
    mutationFn: async ({ id, ...servico }: Partial<ServicoInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('servicos')
        .update(servico)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Serviço atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['servicos-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error updating service:', error);
      toast.error('Erro ao atualizar serviço');
    },
  });

  // Delete service
  const deleteServico = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Serviço excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['servicos-admin', tenantId] });
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      toast.error('Erro ao excluir serviço');
    },
  });

  // Get unique categories
  const categorias = [...new Set(servicos?.map(s => s.categoria) || [])];
  
  // Get unique subcategories
  const subcategorias = [...new Set(servicos?.map(s => s.subcategoria) || [])];

  // Group services by category
  const servicosPorCategoria = servicos?.reduce((acc, s) => {
    if (!acc[s.categoria]) acc[s.categoria] = [];
    acc[s.categoria].push(s);
    return acc;
  }, {} as Record<string, Servico[]>) || {};

  return { 
    servicos: servicos || [], 
    isLoading, 
    refetch,
    createServico, 
    updateServico, 
    deleteServico,
    categorias,
    subcategorias,
    servicosPorCategoria,
    tenantId,
  };
}
