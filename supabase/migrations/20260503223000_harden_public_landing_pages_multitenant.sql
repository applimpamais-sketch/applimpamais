-- Harden public landing page access for SaaS multitenancy.
-- Public reads must be scoped by tenant header and only for published pages.

DROP POLICY IF EXISTS "Landing pages públicas podem ser visualizadas por qualquer um"
ON public.iarc_landing_pages;

DROP POLICY IF EXISTS "Landing pages publicas podem ser visualizadas por qualquer um"
ON public.iarc_landing_pages;

DROP POLICY IF EXISTS "Landing pages publicas por tenant ativo"
ON public.iarc_landing_pages;

CREATE POLICY "Landing pages publicas por tenant ativo"
ON public.iarc_landing_pages
FOR SELECT
TO anon
USING (
  status = 'publicada'
  AND tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
  AND EXISTS (
    SELECT 1
    FROM public.saas_tenants t
    WHERE t.id = iarc_landing_pages.tenant_id
      AND t.status = 'ativo'
  )
);
