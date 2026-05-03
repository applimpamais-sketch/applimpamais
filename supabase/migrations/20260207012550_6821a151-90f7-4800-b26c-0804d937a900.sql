-- =============================================
-- ETAPA 1: Estrutura Base Multi-Tenancy (Corrigida)
-- =============================================

-- 1. Adicionar tenant_id na tabela profiles PRIMEIRO
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);

-- 3. Criar tabela de limites por plano
CREATE TABLE IF NOT EXISTS public.saas_plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano saas_plano UNIQUE NOT NULL,
  max_tecnicos INTEGER,
  max_agendamentos_mes INTEGER,
  max_cupons INTEGER,
  max_templates_whatsapp INTEGER,
  max_funcionarios_bot INTEGER,
  max_membros_dashboard INTEGER,
  max_storage_mb INTEGER,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Inserir limites dos 3 planos
INSERT INTO public.saas_plan_limits (plano, max_tecnicos, max_agendamentos_mes, max_cupons, max_templates_whatsapp, max_funcionarios_bot, max_membros_dashboard, max_storage_mb, features)
VALUES 
  ('starter', 1, 100, 5, 3, 0, 1, 100, '{"whatsapp_bot": false, "relatorios_avancados": false, "api_access": false}'::jsonb),
  ('professional', 5, NULL, NULL, 10, 1, 3, 1024, '{"whatsapp_bot": true, "relatorios_avancados": true, "api_access": false}'::jsonb),
  ('enterprise', NULL, NULL, NULL, NULL, NULL, NULL, 10240, '{"whatsapp_bot": true, "relatorios_avancados": true, "api_access": true, "white_label": true}'::jsonb)
ON CONFLICT (plano) DO UPDATE SET
  max_tecnicos = EXCLUDED.max_tecnicos,
  max_agendamentos_mes = EXCLUDED.max_agendamentos_mes,
  max_cupons = EXCLUDED.max_cupons,
  max_templates_whatsapp = EXCLUDED.max_templates_whatsapp,
  max_funcionarios_bot = EXCLUDED.max_funcionarios_bot,
  max_membros_dashboard = EXCLUDED.max_membros_dashboard,
  max_storage_mb = EXCLUDED.max_storage_mb,
  features = EXCLUDED.features,
  updated_at = now();

-- 5. RLS para saas_plan_limits
ALTER TABLE public.saas_plan_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read plan limits" ON public.saas_plan_limits;
CREATE POLICY "Authenticated can read plan limits"
ON public.saas_plan_limits FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Super admin can manage plan limits" ON public.saas_plan_limits;
CREATE POLICY "Super admin can manage plan limits"
ON public.saas_plan_limits FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- 6. Função para obter tenant_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.tenant_id 
  FROM public.profiles p
  WHERE p.id = _user_id
  LIMIT 1
$$;

-- 7. Função para verificar limites do tenant (versão simplificada inicial)
CREATE OR REPLACE FUNCTION public.check_tenant_limit(
  p_tenant_id UUID,
  p_resource TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plano saas_plano;
  v_limite INTEGER;
  v_uso_atual INTEGER;
BEGIN
  -- Obter plano do tenant
  SELECT plano INTO v_plano
  FROM public.saas_tenants
  WHERE id = p_tenant_id;
  
  IF v_plano IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Obter limite baseado no recurso
  SELECT 
    CASE p_resource
      WHEN 'tecnicos' THEN max_tecnicos
      WHEN 'agendamentos_mes' THEN max_agendamentos_mes
      WHEN 'cupons' THEN max_cupons
      WHEN 'funcionarios_bot' THEN max_funcionarios_bot
      WHEN 'membros_dashboard' THEN max_membros_dashboard
      ELSE NULL
    END INTO v_limite
  FROM public.saas_plan_limits
  WHERE plano = v_plano;
  
  -- NULL significa ilimitado
  IF v_limite IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Contar uso atual (será atualizado quando tenant_id for adicionado nas outras tabelas)
  CASE p_resource
    WHEN 'tecnicos' THEN
      SELECT COUNT(*) INTO v_uso_atual
      FROM public.profiles p
      WHERE p.tenant_id = p_tenant_id
      AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'tecnico');
      
    WHEN 'membros_dashboard' THEN
      SELECT COUNT(*) INTO v_uso_atual
      FROM public.profiles p
      WHERE p.tenant_id = p_tenant_id
      AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('admin', 'operador'));
      
    ELSE
      -- Para recursos que ainda não tem tenant_id, retorna TRUE temporariamente
      RETURN TRUE;
  END CASE;
  
  RETURN v_uso_atual < v_limite;
END;
$$;

-- 8. Função para obter uso atual e limites do tenant
CREATE OR REPLACE FUNCTION public.get_tenant_usage(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plano saas_plano;
  v_limites RECORD;
  v_tecnicos INTEGER;
  v_membros INTEGER;
BEGIN
  -- Obter plano e limites
  SELECT t.plano INTO v_plano
  FROM public.saas_tenants t
  WHERE t.id = p_tenant_id;
  
  IF v_plano IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT * INTO v_limites
  FROM public.saas_plan_limits
  WHERE plano = v_plano;
  
  -- Contar recursos que já tem tenant_id
  SELECT COUNT(*) INTO v_tecnicos
  FROM public.profiles p
  WHERE p.tenant_id = p_tenant_id
  AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'tecnico');
  
  SELECT COUNT(*) INTO v_membros
  FROM public.profiles p
  WHERE p.tenant_id = p_tenant_id
  AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('admin', 'operador'));
  
  RETURN jsonb_build_object(
    'plano', v_plano,
    'tecnicos', jsonb_build_object('atual', v_tecnicos, 'limite', v_limites.max_tecnicos),
    'agendamentos_mes', jsonb_build_object('atual', 0, 'limite', v_limites.max_agendamentos_mes),
    'cupons', jsonb_build_object('atual', 0, 'limite', v_limites.max_cupons),
    'funcionarios_bot', jsonb_build_object('atual', 0, 'limite', v_limites.max_funcionarios_bot),
    'membros_dashboard', jsonb_build_object('atual', v_membros, 'limite', v_limites.max_membros_dashboard),
    'storage_mb', jsonb_build_object('limite', v_limites.max_storage_mb),
    'features', v_limites.features
  );
END;
$$;