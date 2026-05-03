-- Remove hardcoded tenant fallback from auto_set_tenant_id().
-- New behavior:
-- 1) Prefer authenticated user's tenant.
-- 2) For anonymous/public requests, accept x-tenant-id header when it matches an active tenant.
-- 3) Optional fallback via app.settings.default_tenant_id (database setting), without hardcoded UUID.

CREATE OR REPLACE FUNCTION public.auto_set_tenant_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tenant_id UUID;
  v_header_tenant_id UUID;
  v_default_tenant_id UUID;
  v_header_tenant_text TEXT;
  v_default_tenant_text TEXT;
BEGIN
  IF NEW.tenant_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Authenticated flow
  v_tenant_id := public.get_user_tenant_id(auth.uid());

  -- Anonymous/public flow via request header
  IF v_tenant_id IS NULL THEN
    v_header_tenant_text := COALESCE((current_setting('request.headers', true)::jsonb ->> 'x-tenant-id'), '');
    IF v_header_tenant_text <> '' THEN
      BEGIN
        v_header_tenant_id := v_header_tenant_text::uuid;
      EXCEPTION
        WHEN OTHERS THEN
          v_header_tenant_id := NULL;
      END;

      IF v_header_tenant_id IS NOT NULL THEN
        IF EXISTS (
          SELECT 1
          FROM public.saas_tenants st
          WHERE st.id = v_header_tenant_id
            AND st.status = 'ativo'
        ) THEN
          v_tenant_id := v_header_tenant_id;
        END IF;
      END IF;
    END IF;
  END IF;

  -- Optional default fallback configured at DB level
  IF v_tenant_id IS NULL THEN
    v_default_tenant_text := NULLIF(current_setting('app.settings.default_tenant_id', true), '');
    IF v_default_tenant_text IS NOT NULL THEN
      BEGIN
        v_default_tenant_id := v_default_tenant_text::uuid;
      EXCEPTION
        WHEN OTHERS THEN
          v_default_tenant_id := NULL;
      END;

      IF v_default_tenant_id IS NOT NULL THEN
        IF EXISTS (
          SELECT 1
          FROM public.saas_tenants st
          WHERE st.id = v_default_tenant_id
            AND st.status = 'ativo'
        ) THEN
          v_tenant_id := v_default_tenant_id;
        END IF;
      END IF;
    END IF;
  END IF;

  IF v_tenant_id IS NOT NULL THEN
    NEW.tenant_id := v_tenant_id;
  END IF;

  RETURN NEW;
END;
$$;
