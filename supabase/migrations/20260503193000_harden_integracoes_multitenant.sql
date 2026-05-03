-- Harden multi-tenant isolation for integrations module.
-- This removes cross-tenant visibility/write risks in integracoes.

-- 1) Add tenant_id to integracoes
ALTER TABLE public.integracoes
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id);

CREATE INDEX IF NOT EXISTS idx_integracoes_tenant_id ON public.integracoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_integracoes_tenant_tipo ON public.integracoes(tenant_id, tipo);

-- 2) Backfill tenant_id from JSON config when available
UPDATE public.integracoes
SET tenant_id = (configuracao ->> 'tenant_id')::uuid
WHERE tenant_id IS NULL
  AND (configuracao ? 'tenant_id')
  AND (configuracao ->> 'tenant_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- 3) Backfill from profile tenant when created_by is known
UPDATE public.integracoes i
SET tenant_id = p.tenant_id
FROM public.profiles p
WHERE i.tenant_id IS NULL
  AND i.criado_por = p.id
  AND p.tenant_id IS NOT NULL;

-- 4) Keep tenant_id mirrored inside configuracao for legacy readers
UPDATE public.integracoes
SET configuracao = jsonb_set(
  COALESCE(configuracao, '{}'::jsonb),
  '{tenant_id}',
  to_jsonb(tenant_id::text),
  true
)
WHERE tenant_id IS NOT NULL
  AND (
    NOT (COALESCE(configuracao, '{}'::jsonb) ? 'tenant_id')
    OR (configuracao ->> 'tenant_id') IS DISTINCT FROM tenant_id::text
  );

-- 5) Replace old broad policies with tenant-scoped policies
DROP POLICY IF EXISTS "Admins gerenciam integracoes" ON public.integracoes;
DROP POLICY IF EXISTS "Operadores visualizam integracoes" ON public.integracoes;
DROP POLICY IF EXISTS "integracoes_select_tenant" ON public.integracoes;
DROP POLICY IF EXISTS "integracoes_insert_tenant_admin" ON public.integracoes;
DROP POLICY IF EXISTS "integracoes_update_tenant_admin" ON public.integracoes;
DROP POLICY IF EXISTS "integracoes_delete_tenant_admin" ON public.integracoes;

CREATE POLICY "integracoes_select_tenant"
ON public.integracoes
FOR SELECT
TO authenticated
USING (
  is_super_admin(auth.uid())
  OR (
    tenant_id = public.get_user_tenant_id()
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'operador'::app_role)
    )
  )
);

CREATE POLICY "integracoes_insert_tenant_admin"
ON public.integracoes
FOR INSERT
TO authenticated
WITH CHECK (
  is_super_admin(auth.uid())
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND tenant_id = public.get_user_tenant_id()
  )
);

CREATE POLICY "integracoes_update_tenant_admin"
ON public.integracoes
FOR UPDATE
TO authenticated
USING (
  is_super_admin(auth.uid())
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND tenant_id = public.get_user_tenant_id()
  )
)
WITH CHECK (
  is_super_admin(auth.uid())
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND tenant_id = public.get_user_tenant_id()
  )
);

CREATE POLICY "integracoes_delete_tenant_admin"
ON public.integracoes
FOR DELETE
TO authenticated
USING (
  is_super_admin(auth.uid())
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND tenant_id = public.get_user_tenant_id()
  )
);

-- 6) Harden UTMify trigger to use tenant-scoped integration and no hardcoded keys
CREATE OR REPLACE FUNCTION public.trigger_send_utmify_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_api_token TEXT;
  v_integracao_id UUID;
  v_supabase_url TEXT;
  v_anon_key TEXT;
BEGIN
  IF NEW.status NOT IN ('pendente', 'confirmado', 'pago', 'concluido') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  SELECT id, configuracao->>'api_token'
    INTO v_integracao_id, v_api_token
  FROM public.integracoes
  WHERE tipo = 'utmify'
    AND status = 'ativo'
    AND configuracao->>'api_token' IS NOT NULL
    AND (
      (NEW.tenant_id IS NOT NULL AND tenant_id = NEW.tenant_id)
      OR (NEW.tenant_id IS NULL AND tenant_id IS NULL)
    )
  ORDER BY atualizado_em DESC NULLS LAST, criado_em DESC NULLS LAST
  LIMIT 1;

  IF v_api_token IS NULL THEN
    RETURN NEW;
  END IF;

  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_anon_key := current_setting('app.settings.anon_key', true);

  IF v_supabase_url IS NULL OR v_anon_key IS NULL OR v_anon_key = '' THEN
    RAISE WARNING '[UTMify] app.settings.supabase_url/app.settings.anon_key não configurados; envio ignorado.';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/send-utmify-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key,
      'apikey', v_anon_key
    ),
    body := jsonb_build_object(
      'agendamento_id', NEW.id,
      'status', NEW.status,
      'api_token', v_api_token,
      'tenant_id', NEW.tenant_id
    )
  );

  UPDATE public.integracoes
  SET ultimo_uso = now()
  WHERE id = v_integracao_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[UTMify] Erro ao enviar: %', SQLERRM;
    RETURN NEW;
END;
$$;
