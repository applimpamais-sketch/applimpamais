-- ==========================================
-- SPRINT 1: SEGURANÇA CRÍTICA
-- ==========================================

-- 1. Criar tabela de auditoria para has_role()
CREATE TABLE IF NOT EXISTS public.role_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  role_checked app_role NOT NULL,
  access_granted boolean NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.role_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view role access logs"
ON public.role_access_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System inserts role access logs"
ON public.role_access_log
FOR INSERT
WITH CHECK (true);

-- 2. Atualizar função has_role() com auditoria
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_exists boolean;
  is_admin_check boolean;
BEGIN
  -- Verificar se o usuário tem a role
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO role_exists;
  
  -- Detectar verificações suspeitas de admin
  is_admin_check := (_role = 'admin');
  
  -- Se for tentativa de verificar admin E não tem permissão, logar IMEDIATAMENTE
  IF is_admin_check AND NOT role_exists THEN
    BEGIN
      INSERT INTO public.role_access_log (
        user_id,
        role_checked,
        access_granted,
        ip_address
      ) VALUES (
        _user_id,
        _role,
        false,
        current_setting('request.headers', true)::json->>'x-forwarded-for'
      );
    EXCEPTION WHEN OTHERS THEN
      -- Não falhar se o log der erro
      NULL;
    END;
  END IF;
  
  RETURN role_exists;
END;
$$;

-- ==========================================
-- SPRINT 2: COMPLIANCE E PRIVACIDADE
-- ==========================================

-- 3. Criar tabela de consentimento LGPD
CREATE TABLE IF NOT EXISTS public.lgpd_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid,
  consent_given boolean NOT NULL,
  consent_version text NOT NULL DEFAULT 'v1.0',
  consent_text text NOT NULL,
  ip_address text,
  user_agent text,
  country text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.lgpd_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert LGPD consent"
ON public.lgpd_consents
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users view own consents"
ON public.lgpd_consents
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins view all consents"
ON public.lgpd_consents
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 4. Criar função de limpeza automática de dados antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_data_scheduled()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Carrinhos abandonados > 90 dias
  DELETE FROM carrinhos_abandonados 
  WHERE status = 'abandonado' 
  AND created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('carrinhos_abandonados', deleted_count, '90 days');
  
  -- Audit logs > 2 anos
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('audit_logs', deleted_count, '2 years');
  
  -- Leads não convertidos > 2 anos
  DELETE FROM leads_cupom 
  WHERE converteu_em_agendamento = false 
  AND created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('leads_cupom', deleted_count, '2 years');
  
  -- Sessions antigas > 30 dias
  DELETE FROM live_sessions 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('live_sessions', deleted_count, '30 days');
  
  -- Pixel events > 1 ano
  DELETE FROM pixel_events 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('pixel_events', deleted_count, '1 year');
  
  -- Role access logs > 6 meses
  DELETE FROM role_access_log 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('role_access_log', deleted_count, '6 months');
END;
$$;

-- ==========================================
-- SPRINT 3: MONITORAMENTO E ALERTAS
-- ==========================================

-- 5. Criar tabela de alertas de segurança
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage security alerts"
ON public.security_alerts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System creates security alerts"
ON public.security_alerts
FOR INSERT
WITH CHECK (true);

-- 6. Função para detectar atividades suspeitas
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rls_violations_count integer;
  failed_logins_count integer;
  high_request_rate_count integer;
BEGIN
  -- Detectar múltiplas tentativas falhadas de verificação de role admin
  SELECT COUNT(*) INTO rls_violations_count
  FROM role_access_log
  WHERE role_checked = 'admin'
  AND access_granted = false
  AND created_at > NOW() - INTERVAL '10 minutes';
  
  IF rls_violations_count > 10 THEN
    INSERT INTO security_alerts (
      alert_type,
      severity,
      description,
      metadata
    ) VALUES (
      'rls_violation_spike',
      'high',
      'Multiple failed admin role checks detected',
      jsonb_build_object(
        'count', rls_violations_count,
        'time_window', '10 minutes'
      )
    );
  END IF;
  
  -- Detectar taxa alta de requisições anônimas em tabelas públicas
  SELECT COUNT(*) INTO high_request_rate_count
  FROM carrinhos_abandonados
  WHERE created_at > NOW() - INTERVAL '1 minute';
  
  IF high_request_rate_count > 100 THEN
    INSERT INTO security_alerts (
      alert_type,
      severity,
      description,
      metadata
    ) VALUES (
      'high_request_rate',
      'medium',
      'Unusually high request rate detected',
      jsonb_build_object(
        'count', high_request_rate_count,
        'table', 'carrinhos_abandonados',
        'time_window', '1 minute'
      )
    );
  END IF;
END;
$$;

-- 7. Índices para performance de segurança
CREATE INDEX IF NOT EXISTS idx_role_access_log_user_created 
ON role_access_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_role_access_log_role_granted 
ON role_access_log(role_checked, access_granted, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_alerts_unresolved 
ON security_alerts(created_at DESC) WHERE resolved = false;

CREATE INDEX IF NOT EXISTS idx_lgpd_consents_session 
ON lgpd_consents(session_id);

-- ==========================================
-- DOCUMENTAÇÃO DE POLÍTICAS
-- ==========================================

COMMENT ON TABLE role_access_log IS 'Auditoria de todas verificações de permissão admin para detectar tentativas de escalada de privilégios';
COMMENT ON TABLE lgpd_consents IS 'Registro permanente de consentimentos LGPD com versão e IP para compliance legal';
COMMENT ON TABLE security_alerts IS 'Alertas automáticos de atividades suspeitas no sistema';
COMMENT ON FUNCTION cleanup_old_data_scheduled() IS 'Função executada diariamente via pg_cron para remover dados antigos conforme política de retenção';
COMMENT ON FUNCTION detect_suspicious_activity() IS 'Detecta padrões suspeitos e cria alertas para o time de segurança';