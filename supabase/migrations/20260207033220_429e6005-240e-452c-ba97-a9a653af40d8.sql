-- =====================================================
-- GOVERNANÇA DE PLANOS ENTERPRISE - ETAPAS 1-6 (CORRIGIDA)
-- =====================================================

-- =====================================================
-- ETAPA 1: FUNÇÃO CENTRALIZADA can_use_feature()
-- =====================================================

-- Criar tabela tenant_features PRIMEIRO (antes da função que a usa)
CREATE TABLE IF NOT EXISTS public.tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  reason TEXT,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, feature_key)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tenant_features_tenant ON tenant_features(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_features_key ON tenant_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_tenant_features_expires ON tenant_features(expires_at) WHERE expires_at IS NOT NULL;

-- RLS
ALTER TABLE tenant_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_features_isolation" ON tenant_features;
CREATE POLICY "tenant_features_isolation" ON tenant_features
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION update_tenant_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_tenant_features_updated_at ON tenant_features;
CREATE TRIGGER trigger_tenant_features_updated_at
  BEFORE UPDATE ON tenant_features
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_features_updated_at();

-- Função principal que valida TUDO: plano, limites, addons, feature flags
CREATE OR REPLACE FUNCTION public.can_use_feature(p_feature_key text, p_tenant_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_plano saas_plano;
  v_tenant_status saas_tenant_status;
  v_features jsonb;
  v_feature_override RECORD;
BEGIN
  -- Determinar tenant
  v_tenant_id := COALESCE(p_tenant_id, get_user_tenant_id());
  
  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'NO_TENANT',
      'message', 'Usuário não está vinculado a nenhuma empresa'
    );
  END IF;
  
  -- Buscar info do tenant
  SELECT plano, status INTO v_plano, v_tenant_status
  FROM saas_tenants
  WHERE id = v_tenant_id;
  
  IF v_plano IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'TENANT_NOT_FOUND',
      'message', 'Empresa não encontrada'
    );
  END IF;
  
  -- Verificar status do tenant
  IF v_tenant_status NOT IN ('ativo', 'trial') THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'TENANT_INACTIVE',
      'message', 'Conta suspensa ou cancelada'
    );
  END IF;
  
  -- Verificar feature flag específico (override)
  SELECT * INTO v_feature_override
  FROM tenant_features
  WHERE tenant_id = v_tenant_id
    AND feature_key = p_feature_key
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Se tem override, usar ele
  IF v_feature_override.id IS NOT NULL THEN
    IF v_feature_override.enabled THEN
      RETURN jsonb_build_object(
        'allowed', true,
        'reason', 'FEATURE_FLAG',
        'message', 'Acesso liberado por feature flag',
        'expires_at', v_feature_override.expires_at
      );
    ELSE
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'FEATURE_DISABLED',
        'message', 'Recurso desabilitado para esta empresa'
      );
    END IF;
  END IF;
  
  -- Verificar no plano
  SELECT features INTO v_features
  FROM saas_plan_limits
  WHERE plano = v_plano;
  
  IF v_features IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'PLAN_NOT_FOUND',
      'message', 'Configuração de plano não encontrada'
    );
  END IF;
  
  -- Verificar se feature está no plano
  IF v_features ? p_feature_key AND (v_features ->> p_feature_key)::boolean = true THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'PLAN_FEATURE',
      'message', 'Recurso incluído no plano ' || v_plano::text
    );
  END IF;
  
  -- Feature não disponível
  RETURN jsonb_build_object(
    'allowed', false,
    'reason', 'UPGRADE_REQUIRED',
    'message', 'Recurso não disponível no plano ' || v_plano::text,
    'current_plan', v_plano::text
  );
END;
$$;

-- Função simplificada que retorna apenas boolean
CREATE OR REPLACE FUNCTION public.can_use_feature_simple(p_feature_key text, p_tenant_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (can_use_feature(p_feature_key, p_tenant_id) ->> 'allowed')::boolean;
$$;

-- =====================================================
-- ETAPA 3: USAGE METERING CENTRALIZADO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tenant_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  period_start DATE,
  period_end DATE,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, metric_key, period_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_tenant ON tenant_usage_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_key ON tenant_usage_metrics(metric_key);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON tenant_usage_metrics(period_start, period_end);

ALTER TABLE tenant_usage_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usage_metrics_isolation" ON tenant_usage_metrics;
CREATE POLICY "usage_metrics_isolation" ON tenant_usage_metrics
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- Função para verificar limite com bloqueio automático
CREATE OR REPLACE FUNCTION public.check_resource_limit(
  p_resource_key text,
  p_tenant_id uuid DEFAULT NULL,
  p_increment integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_plano saas_plano;
  v_limite INTEGER;
  v_uso_atual INTEGER;
  v_uso_com_incremento INTEGER;
BEGIN
  v_tenant_id := COALESCE(p_tenant_id, get_user_tenant_id());
  
  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'NO_TENANT',
      'message', 'Usuário sem empresa vinculada'
    );
  END IF;
  
  -- Buscar plano
  SELECT plano INTO v_plano FROM saas_tenants WHERE id = v_tenant_id;
  
  -- Buscar limite
  SELECT 
    CASE p_resource_key
      WHEN 'tecnicos' THEN max_tecnicos
      WHEN 'agendamentos_mes' THEN max_agendamentos_mes
      WHEN 'cupons' THEN max_cupons
      WHEN 'funcionarios_bot' THEN max_funcionarios_bot
      WHEN 'membros_dashboard' THEN max_membros_dashboard
      WHEN 'storage_mb' THEN max_storage_mb
      ELSE NULL
    END INTO v_limite
  FROM saas_plan_limits WHERE plano = v_plano;
  
  -- NULL = ilimitado
  IF v_limite IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'UNLIMITED',
      'current', 0,
      'limit', NULL
    );
  END IF;
  
  -- Buscar uso atual do período
  SELECT COALESCE(metric_value, 0) INTO v_uso_atual
  FROM tenant_usage_metrics
  WHERE tenant_id = v_tenant_id
    AND metric_key = p_resource_key
    AND (
      period_start IS NULL 
      OR (period_start <= CURRENT_DATE AND (period_end IS NULL OR period_end >= CURRENT_DATE))
    )
  ORDER BY period_start DESC NULLS LAST
  LIMIT 1;
  
  v_uso_atual := COALESCE(v_uso_atual, 0);
  v_uso_com_incremento := v_uso_atual + p_increment;
  
  IF v_uso_com_incremento > v_limite THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'LIMIT_EXCEEDED',
      'message', format('Limite de %s atingido (%s/%s)', p_resource_key, v_uso_atual, v_limite),
      'current', v_uso_atual,
      'limit', v_limite,
      'upgrade_url', '/upgrade'
    );
  END IF;
  
  IF v_uso_com_incremento >= (v_limite * 0.8) THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'NEAR_LIMIT',
      'message', format('Próximo do limite: %s/%s', v_uso_com_incremento, v_limite),
      'current', v_uso_atual,
      'limit', v_limite,
      'warning', true
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'reason', 'OK',
    'current', v_uso_atual,
    'limit', v_limite
  );
END;
$$;

-- Função para atualizar métricas de uso
CREATE OR REPLACE FUNCTION public.refresh_tenant_usage_metrics(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mes_inicio DATE;
  v_mes_fim DATE;
BEGIN
  v_mes_inicio := date_trunc('month', CURRENT_DATE)::DATE;
  v_mes_fim := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  -- Técnicos ativos
  INSERT INTO tenant_usage_metrics (tenant_id, metric_key, metric_value, period_start)
  SELECT 
    p_tenant_id,
    'tecnicos',
    COUNT(*),
    NULL
  FROM profiles p
  WHERE p.tenant_id = p_tenant_id
    AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'tecnico')
  ON CONFLICT (tenant_id, metric_key, period_start) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, last_calculated_at = now();
  
  -- Agendamentos do mês
  INSERT INTO tenant_usage_metrics (tenant_id, metric_key, metric_value, period_start, period_end)
  SELECT 
    p_tenant_id,
    'agendamentos_mes',
    COUNT(*),
    v_mes_inicio,
    v_mes_fim
  FROM agendamentos
  WHERE tenant_id = p_tenant_id
    AND data_agendamento >= v_mes_inicio
    AND data_agendamento <= v_mes_fim
  ON CONFLICT (tenant_id, metric_key, period_start) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value, 
    period_end = EXCLUDED.period_end,
    last_calculated_at = now();
  
  -- Cupons ativos
  INSERT INTO tenant_usage_metrics (tenant_id, metric_key, metric_value, period_start)
  SELECT 
    p_tenant_id,
    'cupons',
    COUNT(*),
    NULL
  FROM cupons_desconto
  WHERE tenant_id = p_tenant_id AND status = 'ativo'
  ON CONFLICT (tenant_id, metric_key, period_start) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, last_calculated_at = now();
  
  -- Funcionários do bot ativos
  INSERT INTO tenant_usage_metrics (tenant_id, metric_key, metric_value, period_start)
  SELECT 
    p_tenant_id,
    'funcionarios_bot',
    COUNT(*),
    NULL
  FROM funcionarios_bot
  WHERE tenant_id = p_tenant_id AND ativo = true
  ON CONFLICT (tenant_id, metric_key, period_start) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, last_calculated_at = now();
  
  -- Membros do dashboard
  INSERT INTO tenant_usage_metrics (tenant_id, metric_key, metric_value, period_start)
  SELECT 
    p_tenant_id,
    'membros_dashboard',
    COUNT(*),
    NULL
  FROM profiles p
  WHERE p.tenant_id = p_tenant_id
    AND EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('admin', 'operador'))
  ON CONFLICT (tenant_id, metric_key, period_start) 
  DO UPDATE SET metric_value = EXCLUDED.metric_value, last_calculated_at = now();
END;
$$;

-- =====================================================
-- ETAPA 5: SUPORTE A FRANQUIAS
-- =====================================================

ALTER TABLE saas_tenants 
ADD COLUMN IF NOT EXISTS parent_tenant_id UUID REFERENCES saas_tenants(id),
ADD COLUMN IF NOT EXISTS franquia_tipo TEXT CHECK (franquia_tipo IN ('master', 'filial', 'independente')) DEFAULT 'independente';

CREATE INDEX IF NOT EXISTS idx_tenants_parent ON saas_tenants(parent_tenant_id) WHERE parent_tenant_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.is_franqueador(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM saas_tenants 
    WHERE parent_tenant_id = p_tenant_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_tenant_filiais(p_tenant_id uuid)
RETURNS TABLE(
  id UUID,
  nome_empresa TEXT,
  nome_fantasia TEXT,
  plano saas_plano,
  status saas_tenant_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, nome_empresa, nome_fantasia, plano, status
  FROM saas_tenants
  WHERE parent_tenant_id = p_tenant_id
  ORDER BY nome_fantasia;
$$;

-- =====================================================
-- ETAPA 6: LOG GLOBAL DE AÇÕES POR TENANT
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tenant_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES saas_tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_tenant ON tenant_activity_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON tenant_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON tenant_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON tenant_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_tenant_created ON tenant_activity_log(tenant_id, created_at DESC);

ALTER TABLE tenant_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_log_isolation" ON tenant_activity_log;
CREATE POLICY "activity_log_isolation" ON tenant_activity_log
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

CREATE OR REPLACE FUNCTION public.log_tenant_action(
  p_action text,
  p_resource_type text DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
  v_tenant_id UUID;
BEGIN
  v_tenant_id := get_user_tenant_id();
  
  INSERT INTO tenant_activity_log (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address
  ) VALUES (
    v_tenant_id,
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION can_use_feature TO authenticated;
GRANT EXECUTE ON FUNCTION can_use_feature_simple TO authenticated;
GRANT EXECUTE ON FUNCTION check_resource_limit TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_tenant_usage_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION is_franqueador TO authenticated;
GRANT EXECUTE ON FUNCTION get_tenant_filiais TO authenticated;
GRANT EXECUTE ON FUNCTION log_tenant_action TO authenticated;