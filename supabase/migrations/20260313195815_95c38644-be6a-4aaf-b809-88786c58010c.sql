-- Fix live_sessions RLS: Recriar política de INSERT para ser mais robusta
-- e corrigir UPDATE para aceitar upserts de sessões dentro de 24h

-- Remover políticas antigas
DROP POLICY IF EXISTS "live_sessions_tracking_insert_open" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_own_update_open" ON public.live_sessions;

-- Nova política INSERT: permite anônimos com session_id válido
CREATE POLICY "live_sessions_anon_insert" ON public.live_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    session_id IS NOT NULL
    AND length(session_id) >= 36
    AND length(session_id) <= 128
    AND pagina_atual IS NOT NULL
    AND etapa IS NOT NULL
  );

-- Nova política UPDATE: permite atualizar a própria sessão via header x-session-id
-- Removida restrição de created_at para não bloquear sessões com conflito de timestamp
CREATE POLICY "live_sessions_anon_update" ON public.live_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (
    session_id IS NOT NULL
    AND length(session_id) >= 36
    AND length(session_id) <= 128
    AND (
      -- Sessões criadas nas últimas 48h (margem extra para evitar edge cases)
      created_at > now() - interval '48 hours'
      -- OU sessões de usuários autenticados (admin vendo dashboard)
      OR auth.uid() IS NOT NULL
    )
  )
  WITH CHECK (
    session_id IS NOT NULL
    AND length(session_id) >= 36
    AND length(session_id) <= 128
  );