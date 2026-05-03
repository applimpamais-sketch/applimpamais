
DROP POLICY IF EXISTS live_sessions_own_update_secure ON public.live_sessions;

CREATE POLICY live_sessions_own_update_open
ON public.live_sessions
FOR UPDATE TO anon, authenticated
USING (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 36 AND 128
  AND created_at > now() - interval '24 hours'
)
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 36 AND 128
);
