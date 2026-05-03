-- Harden anonymous session-based tracking policies to prevent broad access by arbitrary session IDs

-- =====================================================
-- carrinhos_abandonados
-- =====================================================
DROP POLICY IF EXISTS public_insert_carrinhos ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS carrinhos_tracking_insert ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS carrinhos_own_session_update ON public.carrinhos_abandonados;

CREATE POLICY carrinhos_tracking_insert_secure
ON public.carrinhos_abandonados
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 36 AND 128
  AND session_id = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-session-id'), '')
  AND itens_carrinho IS NOT NULL
  AND valor_total >= 0
);

CREATE POLICY carrinhos_own_session_update_secure
ON public.carrinhos_abandonados
FOR UPDATE
TO anon, authenticated
USING (
  session_id = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-session-id'), '')
  AND status = 'abandonado'
  AND created_at > now() - interval '24 hours'
)
WITH CHECK (
  session_id = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-session-id'), '')
  AND length(session_id) BETWEEN 36 AND 128
);

-- =====================================================
-- live_sessions
-- =====================================================
DROP POLICY IF EXISTS live_sessions_anon_upsert ON public.live_sessions;
DROP POLICY IF EXISTS live_sessions_tracking_insert ON public.live_sessions;
DROP POLICY IF EXISTS live_sessions_own_update ON public.live_sessions;

CREATE POLICY live_sessions_tracking_insert_secure
ON public.live_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 36 AND 128
  AND session_id = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-session-id'), '')
  AND pagina_atual IS NOT NULL
  AND etapa IS NOT NULL
);

CREATE POLICY live_sessions_own_update_secure
ON public.live_sessions
FOR UPDATE
TO anon, authenticated
USING (
  session_id = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-session-id'), '')
  AND created_at > now() - interval '24 hours'
)
WITH CHECK (
  session_id = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-session-id'), '')
  AND length(session_id) BETWEEN 36 AND 128
);

-- =====================================================
-- pixel_events
-- =====================================================
DROP POLICY IF EXISTS pixel_events_tracking_insert ON public.pixel_events;

CREATE POLICY pixel_events_staff_insert_with_tenant
ON public.pixel_events
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
  AND ((tenant_id = get_user_tenant_id()) OR is_super_admin(auth.uid()))
);