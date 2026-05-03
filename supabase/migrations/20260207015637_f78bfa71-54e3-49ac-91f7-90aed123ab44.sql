-- ============================================
-- FASE 1: ADICIONAR tenant_id EM TABELAS CRITICAS
-- ============================================

-- Reembolsos
ALTER TABLE public.reembolsos 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id);

-- WhatsApp Mensagens
ALTER TABLE public.whatsapp_mensagens 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id);

-- Canais Empresa
ALTER TABLE public.canais_empresa 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id);

-- Marketing Investimentos
ALTER TABLE public.marketing_investimentos 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id);

-- Orcamentos (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orcamentos' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id)';
  END IF;
END $$;

-- Notas Fiscais (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notas_fiscais' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.notas_fiscais ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id)';
  END IF;
END $$;

-- ============================================
-- FASE 1.1: TRIGGERS PARA AUTO-PREENCHIMENTO
-- ============================================

-- Trigger para reembolsos (herda do agendamento)
CREATE OR REPLACE FUNCTION public.auto_set_reembolso_tenant_id()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  IF NEW.tenant_id IS NULL AND NEW.agendamento_id IS NOT NULL THEN
    SELECT tenant_id INTO NEW.tenant_id
    FROM public.agendamentos WHERE id = NEW.agendamento_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_reembolso_tenant_id ON public.reembolsos;
CREATE TRIGGER set_reembolso_tenant_id
  BEFORE INSERT ON public.reembolsos
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_reembolso_tenant_id();

-- Trigger para whatsapp_mensagens (herda da conversa)
CREATE OR REPLACE FUNCTION public.auto_set_whatsapp_mensagem_tenant_id()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  IF NEW.tenant_id IS NULL AND NEW.conversa_id IS NOT NULL THEN
    SELECT tenant_id INTO NEW.tenant_id
    FROM public.whatsapp_conversas WHERE id = NEW.conversa_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_whatsapp_mensagem_tenant_id ON public.whatsapp_mensagens;
CREATE TRIGGER set_whatsapp_mensagem_tenant_id
  BEFORE INSERT ON public.whatsapp_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_whatsapp_mensagem_tenant_id();

-- Trigger genérico para canais_empresa
DROP TRIGGER IF EXISTS set_canais_empresa_tenant_id ON public.canais_empresa;
CREATE TRIGGER set_canais_empresa_tenant_id
  BEFORE INSERT ON public.canais_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_tenant_id();

-- Trigger para marketing_investimentos
DROP TRIGGER IF EXISTS set_marketing_tenant_id ON public.marketing_investimentos;
CREATE TRIGGER set_marketing_tenant_id
  BEFORE INSERT ON public.marketing_investimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_tenant_id();

-- ============================================
-- FASE 2: RLS POLICIES POR TENANT
-- ============================================

-- Habilitar RLS nas tabelas que ainda não tem
ALTER TABLE public.metas_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canais_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_investimentos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES PARA TABELAS EXISTENTES
-- ============================================

-- Metas Financeiras
DROP POLICY IF EXISTS "tenant_isolation_metas" ON public.metas_financeiras;
DROP POLICY IF EXISTS "metas_financeiras_policy" ON public.metas_financeiras;
CREATE POLICY "tenant_isolation_metas" ON public.metas_financeiras
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Pagamentos Agendamentos
DROP POLICY IF EXISTS "tenant_isolation_pagamentos" ON public.pagamentos_agendamentos;
DROP POLICY IF EXISTS "pagamentos_policy" ON public.pagamentos_agendamentos;
CREATE POLICY "tenant_isolation_pagamentos" ON public.pagamentos_agendamentos
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Parceiros (permite também próprio usuário)
DROP POLICY IF EXISTS "tenant_isolation_parceiros" ON public.parceiros;
DROP POLICY IF EXISTS "parceiros_policy" ON public.parceiros;
CREATE POLICY "tenant_isolation_parceiros" ON public.parceiros
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
  OR user_id = auth.uid()
);

-- Servicos
DROP POLICY IF EXISTS "tenant_isolation_servicos" ON public.servicos;
DROP POLICY IF EXISTS "servicos_policy" ON public.servicos;
CREATE POLICY "tenant_isolation_servicos" ON public.servicos
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Templates Mensagens
DROP POLICY IF EXISTS "tenant_isolation_templates" ON public.templates_mensagens;
DROP POLICY IF EXISTS "templates_policy" ON public.templates_mensagens;
CREATE POLICY "tenant_isolation_templates" ON public.templates_mensagens
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- WhatsApp Conversas
DROP POLICY IF EXISTS "tenant_isolation_whatsapp_conversas" ON public.whatsapp_conversas;
DROP POLICY IF EXISTS "whatsapp_conversas_policy" ON public.whatsapp_conversas;
CREATE POLICY "tenant_isolation_whatsapp_conversas" ON public.whatsapp_conversas
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- ============================================
-- POLICIES PARA NOVAS TABELAS COM tenant_id
-- ============================================

-- Reembolsos
DROP POLICY IF EXISTS "tenant_isolation_reembolsos" ON public.reembolsos;
CREATE POLICY "tenant_isolation_reembolsos" ON public.reembolsos
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- WhatsApp Mensagens
DROP POLICY IF EXISTS "tenant_isolation_whatsapp_mensagens" ON public.whatsapp_mensagens;
CREATE POLICY "tenant_isolation_whatsapp_mensagens" ON public.whatsapp_mensagens
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Canais Empresa
DROP POLICY IF EXISTS "tenant_isolation_canais" ON public.canais_empresa;
CREATE POLICY "tenant_isolation_canais" ON public.canais_empresa
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Marketing Investimentos
DROP POLICY IF EXISTS "tenant_isolation_marketing" ON public.marketing_investimentos;
CREATE POLICY "tenant_isolation_marketing" ON public.marketing_investimentos
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- ============================================
-- FASE 3: MIGRAR DADOS EXISTENTES
-- ============================================

DO $$
DECLARE
  v_tenant_id UUID := '2046cf1c-af8c-4e5e-b992-092ec922c35c';
BEGIN
  -- Tabelas com nova coluna tenant_id
  UPDATE public.reembolsos SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.whatsapp_mensagens SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.canais_empresa SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.marketing_investimentos SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  -- Tabelas existentes que precisavam de migracao
  UPDATE public.metas_financeiras SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.pagamentos_agendamentos SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.parceiros SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.servicos SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.templates_mensagens SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.whatsapp_conversas SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  RAISE NOTICE 'Migracao de dados concluida para tenant %', v_tenant_id;
END $$;