-- Harden public upsells access for SaaS multitenancy.
-- Anonymous users can read active upsells only for the tenant sent in x-tenant-id.

DROP POLICY IF EXISTS "Anon can read active upsells" ON public.upsells;
DROP POLICY IF EXISTS "Anon can read active upsells by tenant header" ON public.upsells;

CREATE POLICY "Anon can read active upsells by tenant header"
ON public.upsells
FOR SELECT
TO anon
USING (
  ativo = true
  AND tenant_id::text = COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-tenant-id'), '')
  AND EXISTS (
    SELECT 1
    FROM public.saas_tenants st
    WHERE st.id = upsells.tenant_id
      AND st.status = 'ativo'
  )
);
