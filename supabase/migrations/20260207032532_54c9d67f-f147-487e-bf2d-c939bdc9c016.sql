-- =====================================================
-- FASE 1: FUNDAÇÃO ENTERPRISE MULTI-TENANT
-- =====================================================

-- 1. CRIAR TENANT MASTER PARA RC LIMPA MAIS (dados legados)
INSERT INTO public.saas_tenants (
  id,
  nome_empresa,
  nome_fantasia,
  email_contato,
  responsavel_nome,
  responsavel_email,
  plano,
  status,
  valor_mensal
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'RC Limpa Mais Ltda',
  'RC Limpa Mais (Master)',
  'contato@rclimpamais.com.br',
  'Sistema',
  'sistema@rclimpamais.com.br',
  'enterprise',
  'ativo',
  0
) ON CONFLICT (id) DO NOTHING;

-- 2. FUNÇÃO MELHORADA get_user_tenant_id COM SUPORTE A IMPERSONAÇÃO
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_impersonated_tenant uuid;
  v_user_tenant uuid;
BEGIN
  -- Verificar se há tenant impersonado na sessão (para super_admin)
  BEGIN
    v_impersonated_tenant := current_setting('app.current_tenant_id', true)::uuid;
    IF v_impersonated_tenant IS NOT NULL THEN
      -- Verificar se o usuário é super_admin
      IF is_super_admin(_user_id) THEN
        RETURN v_impersonated_tenant;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar se setting não existir
    NULL;
  END;
  
  -- Retornar tenant do perfil do usuário
  SELECT p.tenant_id INTO v_user_tenant
  FROM public.profiles p
  WHERE p.id = _user_id
  LIMIT 1;
  
  RETURN v_user_tenant;
END;
$$;

-- 3. FUNÇÃO PARA SUPER ADMIN SETAR TENANT DE IMPERSONAÇÃO
CREATE OR REPLACE FUNCTION public.set_impersonation_tenant(p_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Apenas super_admin pode impersonar
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas super_admin pode impersonar tenants';
  END IF;
  
  -- Verificar se tenant existe
  IF NOT EXISTS (SELECT 1 FROM public.saas_tenants WHERE id = p_tenant_id) THEN
    RAISE EXCEPTION 'Tenant não encontrado';
  END IF;
  
  -- Setar tenant na sessão
  PERFORM set_config('app.current_tenant_id', p_tenant_id::text, false);
  
  RETURN true;
END;
$$;

-- 4. FUNÇÃO PARA LIMPAR IMPERSONAÇÃO
CREATE OR REPLACE FUNCTION public.clear_impersonation_tenant()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', '', false);
  RETURN true;
END;
$$;

-- 5. FUNÇÃO has_role ATUALIZADA PARA CONSIDERAR TENANT (preparação)
CREATE OR REPLACE FUNCTION public.has_role_in_tenant(_user_id uuid, _role app_role, _tenant_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  )
$$;

-- 6. FUNÇÃO PARA BLOQUEAR QUERIES SEM TENANT (exceto super_admin)
CREATE OR REPLACE FUNCTION public.require_tenant_context()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tenant uuid;
BEGIN
  v_tenant := get_user_tenant_id();
  
  -- Super admin pode acessar sem tenant específico
  IF is_super_admin(auth.uid()) THEN
    RETURN true;
  END IF;
  
  -- Usuários normais precisam de tenant
  IF v_tenant IS NULL THEN
    RAISE EXCEPTION 'Contexto de tenant obrigatório. Faça login novamente.';
  END IF;
  
  RETURN true;
END;
$$;

-- 7. CONSTANTE DO TENANT MASTER (para referência em código)
CREATE OR REPLACE FUNCTION public.get_master_tenant_id()
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT '00000000-0000-0000-0000-000000000001'::uuid
$$;

-- 8. GRANTS
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_impersonation_tenant TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_impersonation_tenant TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role_in_tenant TO authenticated;
GRANT EXECUTE ON FUNCTION public.require_tenant_context TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_master_tenant_id TO authenticated, anon;