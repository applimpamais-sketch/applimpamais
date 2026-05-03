import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTenantContext } from './useTenantContext';
import { useAuth } from './useAuth';

export interface Integracao {
  id: string;
  tenant_id?: string;
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
  const { tenantId } = useTenantContext();
  const { user } = useAuth();

  const { data: integracoes, isLoading } = useQuery({
    queryKey: ['integracoes', tenantId, tipo],
    queryFn: async () => {
      if (!tenantId) return [];

      let query = supabase
        .from('integracoes' as any)
        .select('*')
        .eq('tenant_id', tenantId);
      
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      
      const { data, error } = await query.order('criado_em', { ascending: false });
      
      if (error) throw error;
      return ((data || []) as any[]) as Integracao[];
    },
    enabled: !!tenantId,
  });

  const createIntegracao = useMutation({
    mutationFn: async (integracao: Omit<Integracao, 'id' | 'criado_em' | 'atualizado_em'>) => {
      if (!tenantId) throw new Error('Tenant não identificado');

      const configuracaoComTenant = {
        ...(integracao.configuracao || {}),
        tenant_id: tenantId,
      };

      const { data, error } = await supabase
        .from('integracoes' as any)
        .insert([{
          ...integracao,
          tenant_id: tenantId,
          criado_por: integracao.criado_por ?? user?.id ?? null,
          configuracao: configuracaoComTenant,
        }])
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
      if (!tenantId) throw new Error('Tenant não identificado');

      const configuracaoComTenant = updates.configuracao
        ? { ...updates.configuracao, tenant_id: tenantId }
        : undefined;

      const { data, error } = await supabase
        .from('integracoes' as any)
        .update({
          ...updates,
          ...(configuracaoComTenant ? { configuracao: configuracaoComTenant } : {}),
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
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
      if (!tenantId) throw new Error('Tenant não identificado');

      const { error } = await supabase
        .from('integracoes' as any)
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);
      
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
