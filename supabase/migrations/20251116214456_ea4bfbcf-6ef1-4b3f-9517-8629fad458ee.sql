-- ============================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA - RLS POLICIES
-- ============================================

-- 1. CORRIGIR TABELA agendamentos
-- Remover políticas públicas inseguras
DROP POLICY IF EXISTS "Permitir SELECT anônimo em agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Permitir INSERT anônimo em agendamentos" ON agendamentos;

-- Manter apenas as políticas seguras existentes e adicionar política para inserção anônima controlada
CREATE POLICY "Allow anonymous insert for new bookings"
  ON agendamentos FOR INSERT
  TO anon
  WITH CHECK (
    -- Permite inserção anônima apenas com dados válidos
    nome_cliente IS NOT NULL 
    AND telefone IS NOT NULL 
    AND endereco IS NOT NULL
  );

-- 2. CORRIGIR TABELA carrinhos_abandonados  
-- Remover políticas de leitura/update anônimas
DROP POLICY IF EXISTS "Permitir INSERT anônimo em carrinhos_abandonados" ON carrinhos_abandonados;
DROP POLICY IF EXISTS "Permitir UPDATE anônimo em carrinhos_abandonados" ON carrinhos_abandonados;

-- Permitir apenas INSERT anônimo (sem leitura/update)
CREATE POLICY "Allow anonymous insert abandoned carts"
  ON carrinhos_abandonados FOR INSERT
  TO anon
  WITH CHECK (
    session_id IS NOT NULL 
    AND itens_carrinho IS NOT NULL
  );

-- Permitir UPDATE anônimo apenas pelo session_id (para atualizar carrinho ativo)
CREATE POLICY "Allow anonymous update own cart by session"
  ON carrinhos_abandonados FOR UPDATE
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- 3. CORRIGIR TABELA live_sessions
-- Remover políticas públicas inseguras
DROP POLICY IF EXISTS "Qualquer um pode inserir sessões" ON live_sessions;
DROP POLICY IF EXISTS "Qualquer um pode atualizar sessões" ON live_sessions;

-- Permitir apenas INSERT/UPDATE para tracking (sem leitura pública)
CREATE POLICY "Allow anonymous session tracking insert"
  ON live_sessions FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Allow anonymous session tracking update"
  ON live_sessions FOR UPDATE
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- 4. GARANTIR PROTEÇÃO EM pixel_events
DROP POLICY IF EXISTS "Permitir INSERT anônimo em pixel_events" ON pixel_events;

CREATE POLICY "Allow anonymous pixel tracking"
  ON pixel_events FOR INSERT
  TO anon
  WITH CHECK (
    event_type IS NOT NULL 
    AND event_time IS NOT NULL
  );

-- 5. CRIAR TABELA DE AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para audit_logs (apenas admins podem ler)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Função para logar acessos sensíveis
CREATE OR REPLACE FUNCTION log_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, metadata)
  VALUES (
    auth.uid(), 
    TG_OP, 
    TG_TABLE_NAME, 
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger em tabelas sensíveis
DROP TRIGGER IF EXISTS audit_agendamentos ON agendamentos;
CREATE TRIGGER audit_agendamentos
  AFTER UPDATE OR DELETE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_access();

DROP TRIGGER IF EXISTS audit_user_roles ON user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_access();