-- Remove broken header-based INSERT policy
DROP POLICY IF EXISTS live_sessions_tracking_insert_secure ON public.live_sessions;

-- New policy: validate format without depending on custom header
CREATE POLICY live_sessions_tracking_insert_open
ON public.live_sessions
FOR INSERT TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 36 AND 128
  AND pagina_atual IS NOT NULL
  AND etapa IS NOT NULL
);