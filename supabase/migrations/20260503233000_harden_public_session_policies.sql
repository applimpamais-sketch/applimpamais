-- Harden public session writes for multitenancy.
-- Anonymous writes must carry both x-session-id and x-tenant-id headers.

-- Carrinhos abandonados
DROP POLICY IF EXISTS "tenant_isolation_carrinhos" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "public_insert_carrinhos" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "carrinhos_public_session_insert" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "carrinhos_public_session_update" ON public.carrinhos_abandonados;

CREATE POLICY "carrinhos_public_session_insert"
ON public.carrinhos_abandonados
FOR INSERT
TO anon
WITH CHECK (
  session_id = nullif(current_setting('request.headers', true)::json ->> 'x-session-id', '')
  AND tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
  AND EXISTS (
    SELECT 1
    FROM public.saas_tenants t
    WHERE t.id = carrinhos_abandonados.tenant_id
      AND t.status = 'ativo'
  )
);

CREATE POLICY "carrinhos_public_session_update"
ON public.carrinhos_abandonados
FOR UPDATE
TO anon
USING (
  session_id = nullif(current_setting('request.headers', true)::json ->> 'x-session-id', '')
  AND tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
)
WITH CHECK (
  session_id = nullif(current_setting('request.headers', true)::json ->> 'x-session-id', '')
  AND tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
  AND EXISTS (
    SELECT 1
    FROM public.saas_tenants t
    WHERE t.id = carrinhos_abandonados.tenant_id
      AND t.status = 'ativo'
  )
);

-- Live sessions
DROP POLICY IF EXISTS "live_sessions_anon_upsert" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_public_session_insert" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_public_session_update" ON public.live_sessions;

CREATE POLICY "live_sessions_public_session_insert"
ON public.live_sessions
FOR INSERT
TO anon
WITH CHECK (
  session_id = nullif(current_setting('request.headers', true)::json ->> 'x-session-id', '')
  AND tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
  AND EXISTS (
    SELECT 1
    FROM public.saas_tenants t
    WHERE t.id = live_sessions.tenant_id
      AND t.status = 'ativo'
  )
);

CREATE POLICY "live_sessions_public_session_update"
ON public.live_sessions
FOR UPDATE
TO anon
USING (
  session_id = nullif(current_setting('request.headers', true)::json ->> 'x-session-id', '')
  AND tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
)
WITH CHECK (
  session_id = nullif(current_setting('request.headers', true)::json ->> 'x-session-id', '')
  AND tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
  AND EXISTS (
    SELECT 1
    FROM public.saas_tenants t
    WHERE t.id = live_sessions.tenant_id
      AND t.status = 'ativo'
  )
);
