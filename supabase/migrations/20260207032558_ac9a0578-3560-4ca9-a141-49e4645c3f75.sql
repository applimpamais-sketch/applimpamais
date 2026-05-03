-- =====================================================
-- FASE 2: ADICIONAR TENANT_ID ÀS TABELAS CRÍTICAS
-- =====================================================

-- 1. carrinhos_abandonados
ALTER TABLE public.carrinhos_abandonados 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 2. parceiro_conversoes
ALTER TABLE public.parceiro_conversoes 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 3. parceiro_links
ALTER TABLE public.parceiro_links 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 4. parceiro_saques
ALTER TABLE public.parceiro_saques 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 5. fila_avaliacoes
ALTER TABLE public.fila_avaliacoes 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 6. fila_notificacoes_tecnico
ALTER TABLE public.fila_notificacoes_tecnico 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 7. historico_agendamentos
ALTER TABLE public.historico_agendamentos 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 8. historico_atribuicoes
ALTER TABLE public.historico_atribuicoes 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 9. comunicacoes
ALTER TABLE public.comunicacoes 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 10. user_roles - ADICIONAR TENANT PARA ROLES ISOLADOS
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 11. pagamentos_agendamentos
ALTER TABLE public.pagamentos_agendamentos 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 12. reembolsos
ALTER TABLE public.reembolsos 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 13. audit_logs
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 14. live_sessions
ALTER TABLE public.live_sessions 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 15. pixel_events
ALTER TABLE public.pixel_events 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 16. parceiros (se não tiver)
ALTER TABLE public.parceiros 
ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);

-- 17. crm_clientes (se não tiver)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crm_clientes' AND table_schema = 'public') THEN
    ALTER TABLE public.crm_clientes ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);
  END IF;
END $$;

-- 18. push_notification_preferences
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_notification_preferences' AND table_schema = 'public') THEN
    ALTER TABLE public.push_notification_preferences ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);
  END IF;
END $$;

-- 19. push_subscriptions
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_subscriptions' AND table_schema = 'public') THEN
    ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.saas_tenants(id);
  END IF;
END $$;

-- =====================================================
-- ATUALIZAR FUNÇÃO has_role_in_tenant PARA USAR TENANT
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_role_in_tenant(_user_id uuid, _role app_role, _tenant_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND (
        _tenant_id IS NULL 
        OR ur.tenant_id IS NULL  -- Global role (super_admin)
        OR ur.tenant_id = _tenant_id
      )
  )
$$;

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_carrinhos_abandonados_tenant ON public.carrinhos_abandonados(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parceiro_conversoes_tenant ON public.parceiro_conversoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parceiro_links_tenant ON public.parceiro_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parceiro_saques_tenant ON public.parceiro_saques(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fila_avaliacoes_tenant ON public.fila_avaliacoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fila_notificacoes_tecnico_tenant ON public.fila_notificacoes_tecnico(tenant_id);
CREATE INDEX IF NOT EXISTS idx_historico_agendamentos_tenant ON public.historico_agendamentos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_historico_atribuicoes_tenant ON public.historico_atribuicoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comunicacoes_tenant ON public.comunicacoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant ON public.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_agendamentos_tenant ON public.pagamentos_agendamentos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_tenant ON public.reembolsos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_tenant ON public.live_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parceiros_tenant ON public.parceiros(tenant_id);