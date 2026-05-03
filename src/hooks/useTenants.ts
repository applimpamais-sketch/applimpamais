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

  // Listar todos os tenants
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

  // Buscar tenant por ID
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

  // Criar novo tenant com admin
  const createTenant = useMutation({
    mutationFn: async (input: CreateTenantInput): Promise<SaasTenant> => {
      const trialEnd = input.trial_termina_em || 
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Criar o tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('saas_tenants')
        .insert({
          nome_empresa: input.nome_empresa,
          nome_fantasia: input.nome_fantasia,
          cnpj: input.cnpj,
          email_contato: input.email_contato,
          telefone: input.telefone,
          responsavel_nome: input.responsavel_nome,
          responsavel_email: input.responsavel_email,
          plano: input.plano || 'starter',
          status: 'trial',
          valor_mensal: input.valor_mensal || 297,
          trial_termina_em: trialEnd,
        })
        .select()
        .single();
      
      if (tenantError) throw tenantError;

      const tenant = tenantData as SaasTenant;

      // 2. Criar admin do tenant via Edge Function
      try {
        const { data: adminData, error: adminError } = await supabase.functions.invoke(
          'create-tenant-admin',
          {
            body: {
              tenant_id: tenant.id,
              email: input.responsavel_email,
              nome: input.responsavel_nome,
              nome_empresa: input.nome_empresa,
              plano: input.plano || 'starter',
            },
          }
        );

        if (adminError) {
          console.error('Erro ao criar admin:', adminError);
          toast.warning('Tenant criado, mas houve erro ao enviar convite. Tente reenviar.');
        } else if (!adminData?.success) {
          console.error('Falha ao criar admin:', adminData?.error);
          toast.warning('Tenant criado, mas email não foi enviado.');
        }
      } catch (fnError) {
        console.error('Erro na Edge Function:', fnError);
        toast.warning('Tenant criado, mas houve erro ao criar usuário admin.');
      }

      return tenant;
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

  // Atualizar tenant
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

  // Ativar tenant (fim do trial)
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

  // Pausar tenant
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

  // Cancelar tenant
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

  // Reenviar convite para tenant
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
