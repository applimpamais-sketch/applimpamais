import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface TenantData {
  id: string;
  nome_empresa: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  email_contato: string | null;
  telefone: string | null;
  responsavel_nome: string | null;
  responsavel_email: string | null;
  responsavel_user_id: string | null;
  plano: 'starter' | 'professional' | 'enterprise';
  status: 'trial' | 'ativo' | 'suspenso' | 'cancelado';
  valor_mensal: number | null;
  dia_vencimento: number | null;
  trial_termina_em: string | null;
  ativado_em: string | null;
  cancelado_em: string | null;
  ultimo_pagamento_em: string | null;
  configuracoes: Record<string, unknown> | null;
  dominio_customizado: string | null;
  logo_url: string | null;
  cores_personalizadas: { primaria?: string; secundaria?: string } | null;
  criado_em: string;
  atualizado_em: string;
}

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  mes_referencia: string;
  valor: number;
  desconto: number | null;
  valor_pago: number | null;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  data_vencimento: string;
  data_pagamento: string | null;
  forma_pagamento: string | null;
  observacoes: string | null;
  criado_em: string;
}

export function useTenantContext() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null>(null);

  // Invalidar cache quando usuário mudar
  useEffect(() => {
    if (user?.id !== prevUserIdRef.current) {
      if (prevUserIdRef.current !== null) {
        // Limpar cache antigo ao trocar de usuário
        console.log('[useTenantContext] Usuário mudou, limpando cache');
        queryClient.removeQueries({ queryKey: ['current-tenant-context'] });
      }
      prevUserIdRef.current = user?.id ?? null;
    }
  }, [user?.id, queryClient]);

  const { data: tenantData, isLoading, error, isFetched } = useQuery({
    queryKey: ['current-tenant-context', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      console.log('[useTenantContext] Buscando tenant para user:', user.id);

      // Buscar tenant_id do profile (tolerante a falhas)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('[useTenantContext] Erro ao buscar profile (não-bloqueante):', profileError);
        return null;
      }

      if (!profile?.tenant_id) {
        console.log('[useTenantContext] Usuário não tem tenant_id (master user)');
        return null;
      }

      console.log('[useTenantContext] Tenant encontrado:', profile.tenant_id);

      // Buscar dados completos do tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('saas_tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .maybeSingle();

      if (tenantError) {
        console.error('[useTenantContext] Erro ao buscar tenant (não-bloqueante):', tenantError);
        return null;
      }

      if (!tenant) {
        console.warn('[useTenantContext] Tenant não encontrado para ID:', profile.tenant_id);
        return null;
      }

      console.log('[useTenantContext] Tenant carregado:', tenant.nome_empresa);

      // Buscar última assinatura/fatura
      const { data: subscription } = await supabase
        .from('saas_subscriptions')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        tenant: tenant as unknown as TenantData,
        subscription: subscription as unknown as TenantSubscription | null,
        tenantId: profile.tenant_id,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 2, // Tentar 2x em caso de erro
    retryDelay: 500, // 500ms entre retries
  });

  return {
    tenant: tenantData?.tenant ?? null,
    subscription: tenantData?.subscription ?? null,
    tenantId: tenantData?.tenantId ?? null,
    isSaasTenant: !!tenantData?.tenant,
    isLoading,
    tenantChecked: isFetched, // Indica se a verificação foi concluída
    error,
  };
}
