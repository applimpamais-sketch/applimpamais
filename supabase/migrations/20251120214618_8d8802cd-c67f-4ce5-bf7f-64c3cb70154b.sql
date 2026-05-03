-- ============================================
-- SPRINT 1: CORREÇÕES CRÍTICAS DE SEGURANÇA
-- ============================================

-- 1. ADICIONAR RLS POLICIES FALTANTES

-- Profiles: Restringir acesso aos próprios dados
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "profiles_own_select" ON profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
DROP POLICY IF EXISTS "profiles_staff_select" ON profiles;

CREATE POLICY "profiles_own_select" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_own_update" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_staff_select" ON profiles
FOR SELECT USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'operador') OR 
  has_role(auth.uid(), 'visualizador')
);

CREATE POLICY "profiles_admin_full_access" ON profiles
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Live Sessions: Corrigir policy conflitante
DROP POLICY IF EXISTS "live_sessions_public_insert" ON live_sessions;
DROP POLICY IF EXISTS "live_sessions_anon_update" ON live_sessions;

CREATE POLICY "live_sessions_anon_full_access" ON live_sessions
FOR ALL USING (true)
WITH CHECK (session_id IS NOT NULL);

-- Audit Logs: Adicionar inserção automática
CREATE POLICY "audit_logs_system_insert" ON audit_logs
FOR INSERT WITH CHECK (true);

-- 2. CONFIGURAÇÃO DE SENHA FORTE
-- Nota: Estas configurações serão aplicadas via auth config

-- 3. FUNÇÃO DE AUDITORIA AUTOMÁTICA
CREATE OR REPLACE FUNCTION public.audit_user_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    metadata,
    ip_address
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'timestamp', now()
    ),
    current_setting('request.headers', true)::json->>'x-forwarded-for'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. ADICIONAR TRIGGERS DE AUDITORIA EM TABELAS SENSÍVEIS
DROP TRIGGER IF EXISTS audit_agendamentos ON agendamentos;
CREATE TRIGGER audit_agendamentos
AFTER INSERT OR UPDATE OR DELETE ON agendamentos
FOR EACH ROW EXECUTE FUNCTION audit_user_action();

DROP TRIGGER IF EXISTS audit_pagamentos ON pagamentos_agendamentos;
CREATE TRIGGER audit_pagamentos
AFTER INSERT OR UPDATE OR DELETE ON pagamentos_agendamentos
FOR EACH ROW EXECUTE FUNCTION audit_user_action();

DROP TRIGGER IF EXISTS audit_despesas ON despesas;
CREATE TRIGGER audit_despesas
AFTER INSERT OR UPDATE OR DELETE ON despesas
FOR EACH ROW EXECUTE FUNCTION audit_user_action();

DROP TRIGGER IF EXISTS audit_user_roles ON user_roles;
CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION audit_user_action();

-- 5. ADICIONAR ÍNDICES PARA PERFORMANCE DE AUDITORIA
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- 6. POLÍTICA DE RETENÇÃO DE DADOS (LGPD)
CREATE TABLE IF NOT EXISTS public.data_retention_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  records_deleted integer NOT NULL,
  executed_at timestamp with time zone DEFAULT now(),
  retention_period text NOT NULL
);

-- 7. FUNÇÃO DE LIMPEZA AUTOMÁTICA DE DADOS ANTIGOS
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Deletar carrinhos abandonados > 90 dias
  DELETE FROM carrinhos_abandonados 
  WHERE status = 'abandonado' 
  AND created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('carrinhos_abandonados', deleted_count, '90 days');
  
  -- Deletar audit logs > 2 anos
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('audit_logs', deleted_count, '2 years');
  
  -- Deletar leads não convertidos > 2 anos
  DELETE FROM leads_cupom 
  WHERE converteu_em_agendamento = false 
  AND created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('leads_cupom', deleted_count, '2 years');
END;
$$;

-- 8. ADICIONAR VALIDAÇÃO DE EMAIL E TELEFONE
CREATE OR REPLACE FUNCTION public.validate_contact_info()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar email se fornecido
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  
  -- Validar telefone (formato brasileiro)
  IF NEW.telefone IS NOT NULL AND NEW.telefone !~ '^\d{10,11}$' THEN
    RAISE EXCEPTION 'Telefone inválido. Use formato: 11987654321';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_agendamento_contact ON agendamentos;
CREATE TRIGGER validate_agendamento_contact
BEFORE INSERT OR UPDATE ON agendamentos
FOR EACH ROW EXECUTE FUNCTION validate_contact_info();

DROP TRIGGER IF EXISTS validate_profile_contact ON profiles;
CREATE TRIGGER validate_profile_contact
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION validate_contact_info();