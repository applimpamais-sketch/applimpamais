import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SaasPlano = 'starter' | 'professional' | 'enterprise';
export type SaasTenantStatus = 'trial' | 'ativo' | 'inadimplente' | 'cancelado' | 'pausado';

export interface SaasTenant {
  id: string;
  nome_empresa: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  email_contato: string;
  telefone: string | null;
  responsavel_nome: string;
  responsavel_email: string;
  responsavel_user_id: string | null;
  plano: SaasPlano;
  status: SaasTenantStatus;
  valor_mensal: number;
  dia_vencimento: number | null;
  trial_termina_em: string | null;
  ativado_em: string | null;
  cancelado_em: string | null;
  ultimo_pagamento_em: string | null;
  configuracoes: Record<string, unknown> | null;
  dominio_customizado: string | null;
  logo_url: string | null;
  cores_personalizadas: Record<string, unknown> | null;
  criado_em: string;
  atualizado_em: string;
  criado_por: string | null;
}

export interface CreateTenantInput {
  nome_empresa: string;
  nome_fantasia?: string;
  cnpj?: string;
  email_contato: string;
  telefone?: string;
  responsavel_nome: string;
  responsavel_email: string;
  plano?: SaasPlano;
  valor_mensal?: number;
  trial_termina_em?: string;
  modulos?: Array<{
    modulo_id: string;
    codigo?: string;
    preco_negociado: number | null;
  }>;
}

export interface UpdateTenantInput {
  id: string;
  nome_empresa?: string;
  nome_fantasia?: string;
  cnpj?: string;
  email_contato?: string;
  telefone?: string;
  responsavel_nome?: string;
  responsavel_email?: string;
  plano?: SaasPlano;
  status?: SaasTenantStatus;
  valor_mensal?: number;
  dia_vencimento?: number;
  dominio_customizado?: string;
  logo_url?: string;
}

export function useTenants() {
  const queryClient = useQueryClient();

  const { data: tenants, isLoading, refetch } = useQuery({
    queryKey: ['saas-tenants'],
    queryFn: async (): Promise<SaasTenant[]> => {
      const { data, error } = await supabase
        .from('saas_tenants')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return data as SaasTenant[];
    },
  });

  const getTenantById = async (id: string): Promise<SaasTenant | null> => {
    const { data, error } = await supabase
      .from('saas_tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar tenant:', error);
      return null;
    }

    return data as SaasTenant;
  };

  const createTenant = useMutation({
    mutationFn: async (input: CreateTenantInput): Promise<SaasTenant> => {
      const { data, error } = await supabase.functions.invoke('create-saas-tenant', {
        body: {
          ...input,
          plano: input.plano || 'starter',
          valor_mensal: input.valor_mensal || 297,
          modulos: input.modulos || [],
        },
      });

      if (error) throw error;
      if (!data?.success || !data?.tenant) {
        throw new Error(data?.error || 'Erro ao criar cliente');
      }

      return data.tenant as SaasTenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saas-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['saas-dashboard-metrics'] });
      toast.success('Cliente adicionado e convite enviado!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao adicionar cliente: ' + error.message);
    },
  });

  const updateTenant = useMutation({
    mutationFn: async (input: UpdateTenantInput): Promise<SaasTenant> => {
      const { id, ...updateData } = input;

      const { data, error } = await supabase
        .from('saas_tenants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SaasTenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saas-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['saas-dashboard-metrics'] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar cliente: ' + error.message);
    },
  });

  const activateTenant = useMutation({
    mutationFn: async (tenantId: string): Promise<SaasTenant> => {
      const { data, error } = await supabase
        .from('saas_tenants')
        .update({
          status: 'ativo',
          ativado_em: new Date().toISOString(),
        })
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data as SaasTenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saas-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['saas-dashboard-metrics'] });
      toast.success('Cliente ativado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao ativar cliente: ' + error.message);
    },
  });

  const pauseTenant = useMutation({
    mutationFn: async (tenantId: string): Promise<SaasTenant> => {
      const { data, error } = await supabase
        .from('saas_tenants')
        .update({ status: 'pausado' })
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data as SaasTenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saas-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['saas-dashboard-metrics'] });
      toast.success('Cliente pausado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao pausar cliente: ' + error.message);
    },
  });

  const cancelTenant = useMutation({
    mutationFn: async (tenantId: string): Promise<SaasTenant> => {
      const { data, error } = await supabase
        .from('saas_tenants')
        .update({
          status: 'cancelado',
          cancelado_em: new Date().toISOString(),
        })
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data as SaasTenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saas-tenants'] });
      queryClient.invalidateQueries({ queryKey: ['saas-dashboard-metrics'] });
      toast.success('Cliente cancelado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao cancelar cliente: ' + error.message);
    },
  });

  const resendInvite = useMutation({
    mutationFn: async (tenantId: string): Promise<{ success: boolean; email: string }> => {
      const { data, error } = await supabase.functions.invoke('resend-tenant-invite', {
        body: { tenant_id: tenantId },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Erro ao reenviar convite');

      return data;
    },
    onSuccess: (data) => {
      toast.success(`Convite reenviado para ${data.email}!`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao reenviar convite: ' + error.message);
    },
  });

  return {
    tenants: tenants || [],
    isLoading,
    refetch,
    getTenantById,
    createTenant,
    updateTenant,
    activateTenant,
    pauseTenant,
    cancelTenant,
    resendInvite,
  };
}
