-- ============================================================================
-- FASE 1: CORRIGIR ERROS OPERACIONAIS URGENTES
-- ============================================================================

-- 1.1 Corrigir RLS de live_sessions
DROP POLICY IF EXISTS "Allow anonymous session tracking insert" ON live_sessions;
DROP POLICY IF EXISTS "Allow anonymous session tracking update" ON live_sessions;
DROP POLICY IF EXISTS "Anon insert live_sessions" ON live_sessions;
DROP POLICY IF EXISTS "Anon update live_sessions" ON live_sessions;
DROP POLICY IF EXISTS "Admins visualizam todas as sessões" ON live_sessions;

CREATE POLICY "live_sessions_anon_insert"
  ON live_sessions
  FOR INSERT
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "live_sessions_anon_update"
  ON live_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "live_sessions_admin_select"
  ON live_sessions
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador') OR 
    has_role(auth.uid(), 'visualizador')
  );

-- 1.2 Corrigir RLS de pixel_events
DROP POLICY IF EXISTS "Allow anonymous pixel tracking" ON pixel_events;
DROP POLICY IF EXISTS "Admins visualizam eventos" ON pixel_events;

CREATE POLICY "pixel_events_anon_insert"
  ON pixel_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "pixel_events_admin_select"
  ON pixel_events
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador') OR 
    has_role(auth.uid(), 'visualizador')
  );

-- ============================================================================
-- FASE 2: CORRIGIR VAZAMENTOS CRÍTICOS DE DADOS (PII)
-- ============================================================================

-- 2.1 Proteger tabela profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON profiles;

CREATE POLICY "profiles_own_select"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_staff_select"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador') OR 
    has_role(auth.uid(), 'visualizador')
  );

CREATE POLICY "profiles_own_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2.2 Proteger tabela agendamentos (manter INSERT público)
DROP POLICY IF EXISTS "Public can view agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admins view all agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Tecnicos veem seus agendamentos" ON agendamentos;

-- Manter INSERT público (necessário para agendamentos anônimos)
-- Policy "Allow public booking creation" já existe e está correta

CREATE POLICY "agendamentos_staff_select"
  ON agendamentos
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador') OR 
    has_role(auth.uid(), 'visualizador') OR
    (has_role(auth.uid(), 'tecnico') AND tecnico_id = auth.uid())
  );

-- 2.3 Proteger tabela carrinhos_abandonados
DROP POLICY IF EXISTS "Public can view carrinhos" ON carrinhos_abandonados;
DROP POLICY IF EXISTS "Admins gerenciam carrinhos_abandonados" ON carrinhos_abandonados;

-- Manter policies de INSERT/UPDATE anônimo por session
-- "Allow anonymous insert abandoned carts" já existe
-- "Allow anonymous update own cart by session" já existe

CREATE POLICY "carrinhos_staff_select"
  ON carrinhos_abandonados
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador') OR 
    has_role(auth.uid(), 'visualizador')
  );

CREATE POLICY "carrinhos_staff_update"
  ON carrinhos_abandonados
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador')
  );

CREATE POLICY "carrinhos_staff_delete"
  ON carrinhos_abandonados
  FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador')
  );

-- 2.4 Proteger tabela leads_cupom
DROP POLICY IF EXISTS "Public can view leads" ON leads_cupom;
DROP POLICY IF EXISTS "Admin pode ler leads" ON leads_cupom;
DROP POLICY IF EXISTS "Admin pode atualizar leads" ON leads_cupom;

-- "Permitir INSERT público em leads" já existe e está correto

CREATE POLICY "leads_cupom_staff_select"
  ON leads_cupom
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador') OR 
    has_role(auth.uid(), 'visualizador')
  );

CREATE POLICY "leads_cupom_staff_update"
  ON leads_cupom
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador')
  );

-- ============================================================================
-- FASE 3: CORRIGIR SEARCH_PATH EM FUNÇÕES (SQL INJECTION)
-- ============================================================================

ALTER FUNCTION public.update_push_subscription_updated_at() 
  SET search_path TO 'public';

ALTER FUNCTION public.create_default_push_preferences() 
  SET search_path TO 'public';

ALTER FUNCTION public.log_sensitive_access() 
  SET search_path TO 'public';

ALTER FUNCTION public.atualizar_valor_realizado_meta() 
  SET search_path TO 'public';

ALTER FUNCTION public.registrar_mudanca_status() 
  SET search_path TO 'public';

ALTER FUNCTION public.auto_registrar_pagamento() 
  SET search_path TO 'public';

ALTER FUNCTION public.processar_reembolso() 
  SET search_path TO 'public';

ALTER FUNCTION public.handle_new_user() 
  SET search_path TO 'public';

ALTER FUNCTION public.identificar_genero(text) 
  SET search_path TO 'public';

ALTER FUNCTION public.auto_identificar_genero() 
  SET search_path TO 'public';

-- Nota: trigger_send_push_on_agendamento_concluido já tem search_path configurado

-- ============================================================================
-- FASE 4: PROTEÇÕES EXTRAS
-- ============================================================================

-- 4.1 Proteger audit_logs (apenas admins)
DROP POLICY IF EXISTS "Admins view audit logs" ON audit_logs;

CREATE POLICY "audit_logs_admin_only"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 4.2 Garantir consistência em tabelas financeiras
DROP POLICY IF EXISTS "Visualizadores veem despesas" ON despesas;
DROP POLICY IF EXISTS "Visualizadores veem pagamentos" ON pagamentos_agendamentos;

CREATE POLICY "despesas_staff_select"
  ON despesas
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador') OR 
    has_role(auth.uid(), 'visualizador')
  );

CREATE POLICY "pagamentos_staff_select"
  ON pagamentos_agendamentos
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'operador') OR 
    has_role(auth.uid(), 'visualizador') OR
    (has_role(auth.uid(), 'tecnico') AND EXISTS (
      SELECT 1 FROM agendamentos 
      WHERE agendamentos.id = pagamentos_agendamentos.agendamento_id 
      AND agendamentos.tecnico_id = auth.uid()
    ))
  );