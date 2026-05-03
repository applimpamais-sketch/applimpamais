-- Corrigir RLS de live_sessions para permitir upsert anônimo sem header x-session-id
-- Isso resolve os erros "new row violates row-level security policy for table live_sessions"

-- Remover políticas atuais que exigem header x-session-id no UPDATE
DROP POLICY IF EXISTS "Allow anonymous session tracking insert" ON live_sessions;
DROP POLICY IF EXISTS "Allow anonymous session tracking update" ON live_sessions;
DROP POLICY IF EXISTS "Admins visualizam todas as sessões" ON live_sessions;

-- Permitir INSERT anônimo com session_id obrigatório
CREATE POLICY "Anon insert live_sessions"
  ON live_sessions
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL);

-- Permitir UPDATE anônimo em qualquer sessão (dados de analytics não sensíveis)
-- Isso permite que upsert funcione sem precisar do header x-session-id
CREATE POLICY "Anon update live_sessions"
  ON live_sessions
  AS PERMISSIVE
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Manter SELECT apenas para roles autenticadas (admin/operador/visualizador)
CREATE POLICY "Admins visualizam todas as sessões"
  ON live_sessions
  AS PERMISSIVE
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operador'::app_role) OR 
    has_role(auth.uid(), 'visualizador'::app_role)
  );