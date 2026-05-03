-- Harden public catalog access for SaaS multitenancy.
-- Public reads on servicos/alugueis/calendario must be scoped by x-tenant-id.

DROP POLICY IF EXISTS "Servicos são visíveis para todos" ON public.servicos;
DROP POLICY IF EXISTS "Servicos sao visiveis para todos" ON public.servicos;
DROP POLICY IF EXISTS "servicos_publicos_por_tenant_ativo" ON public.servicos;

CREATE POLICY "servicos_publicos_por_tenant_ativo"
ON public.servicos
FOR SELECT
TO anon
USING (
  tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
  AND EXISTS (
    SELECT 1
    FROM public.saas_tenants t
    WHERE t.id = servicos.tenant_id
      AND t.status = 'ativo'
  )
);

DROP POLICY IF EXISTS "Alugueis são visíveis para todos" ON public.alugueis;
DROP POLICY IF EXISTS "Alugueis sao visiveis para todos" ON public.alugueis;
DROP POLICY IF EXISTS "alugueis_publicos_por_tenant_ativo" ON public.alugueis;

CREATE POLICY "alugueis_publicos_por_tenant_ativo"
ON public.alugueis
FOR SELECT
TO anon
USING (
  tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
  AND EXISTS (
    SELECT 1
    FROM public.saas_tenants t
    WHERE t.id = alugueis.tenant_id
      AND t.status = 'ativo'
  )
);

DROP POLICY IF EXISTS "Calendario é visível para todos" ON public.calendario_disponibilidade;
DROP POLICY IF EXISTS "Calendario e visivel para todos" ON public.calendario_disponibilidade;
DROP POLICY IF EXISTS "calendario_publico_por_tenant_ativo" ON public.calendario_disponibilidade;

CREATE POLICY "calendario_publico_por_tenant_ativo"
ON public.calendario_disponibilidade
FOR SELECT
TO anon
USING (
  tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
  AND EXISTS (
    SELECT 1
    FROM public.saas_tenants t
    WHERE t.id = calendario_disponibilidade.tenant_id
      AND t.status = 'ativo'
  )
);
