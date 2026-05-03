
-- =====================================================
-- CORREÇÃO CRÍTICA: Isolamento Multi-Tenant via RLS
-- Converter policies PERMISSIVE para RESTRICTIVE
-- =====================================================

-- 1. AGENDAMENTOS
DROP POLICY IF EXISTS tenant_isolation_agendamentos ON agendamentos;
CREATE POLICY tenant_isolation_agendamentos ON agendamentos
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 2. DESPESAS
DROP POLICY IF EXISTS tenant_isolation_despesas ON despesas;
CREATE POLICY tenant_isolation_despesas ON despesas
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 3. CUPONS_DESCONTO
DROP POLICY IF EXISTS tenant_isolation_cupons ON cupons_desconto;
CREATE POLICY tenant_isolation_cupons ON cupons_desconto
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 4. SERVICOS
DROP POLICY IF EXISTS tenant_isolation_servicos ON servicos;
CREATE POLICY tenant_isolation_servicos ON servicos
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 5. AVALIACOES_CLIENTES
DROP POLICY IF EXISTS tenant_isolation_avaliacoes ON avaliacoes_clientes;
CREATE POLICY tenant_isolation_avaliacoes ON avaliacoes_clientes
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 6. CALENDARIO_DISPONIBILIDADE
DROP POLICY IF EXISTS tenant_isolation_calendario ON calendario_disponibilidade;
CREATE POLICY tenant_isolation_calendario ON calendario_disponibilidade
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 7. CANAIS_EMPRESA
DROP POLICY IF EXISTS tenant_isolation_canais ON canais_empresa;
CREATE POLICY tenant_isolation_canais ON canais_empresa
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 8. CARRINHOS_ABANDONADOS
DROP POLICY IF EXISTS tenant_isolation_carrinhos ON carrinhos_abandonados;
CREATE POLICY tenant_isolation_carrinhos ON carrinhos_abandonados
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 9. COMUNICACOES
DROP POLICY IF EXISTS tenant_isolation_comunicacoes ON comunicacoes;
CREATE POLICY tenant_isolation_comunicacoes ON comunicacoes
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 10. FILA_AVALIACOES
DROP POLICY IF EXISTS tenant_isolation_fila_avaliacoes ON fila_avaliacoes;
CREATE POLICY tenant_isolation_fila_avaliacoes ON fila_avaliacoes
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 11. FILA_NOTIFICACOES_TECNICO
DROP POLICY IF EXISTS tenant_isolation_fila_notif ON fila_notificacoes_tecnico;
CREATE POLICY tenant_isolation_fila_notif ON fila_notificacoes_tecnico
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 12. FUNCIONARIOS_BOT (remover duplicatas primeiro)
DROP POLICY IF EXISTS tenant_isolation_funcionarios ON funcionarios_bot;
DROP POLICY IF EXISTS tenant_isolation_funcionarios_bot ON funcionarios_bot;
CREATE POLICY tenant_isolation_funcionarios_bot ON funcionarios_bot
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 13. HISTORICO_AGENDAMENTOS
DROP POLICY IF EXISTS tenant_isolation_historico_ag ON historico_agendamentos;
CREATE POLICY tenant_isolation_historico_ag ON historico_agendamentos
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 14. HISTORICO_ATRIBUICOES
DROP POLICY IF EXISTS tenant_isolation_historico_atr ON historico_atribuicoes;
CREATE POLICY tenant_isolation_historico_atr ON historico_atribuicoes
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 15. LEADS_CUPOM (remover duplicatas primeiro)
DROP POLICY IF EXISTS tenant_isolation_leads ON leads_cupom;
DROP POLICY IF EXISTS tenant_isolation_leads_cupom ON leads_cupom;
CREATE POLICY tenant_isolation_leads_cupom ON leads_cupom
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 16. LEDGER_ENTRIES
DROP POLICY IF EXISTS tenant_isolation_ledger ON ledger_entries;
CREATE POLICY tenant_isolation_ledger ON ledger_entries
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 17. PAGAMENTOS_AGENDAMENTOS
DROP POLICY IF EXISTS tenant_isolation_pagamentos ON pagamentos_agendamentos;
CREATE POLICY tenant_isolation_pagamentos ON pagamentos_agendamentos
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 18. REEMBOLSOS
DROP POLICY IF EXISTS tenant_isolation_reembolsos ON reembolsos;
CREATE POLICY tenant_isolation_reembolsos ON reembolsos
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- 19. PROFILES (especial - permite ver próprio profile)
DROP POLICY IF EXISTS tenant_isolation_profiles ON profiles;
CREATE POLICY tenant_isolation_profiles ON profiles
AS RESTRICTIVE FOR SELECT TO authenticated
USING (id = auth.uid() OR tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- =====================================================
-- FUNÇÃO has_role_for_tenant (tenant-aware role check)
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role_for_tenant(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_tenant_id uuid;
  role_exists boolean;
BEGIN
  -- Super admin sempre passa
  IF is_super_admin(_user_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Buscar tenant do usuário
  SELECT p.tenant_id INTO user_tenant_id
  FROM profiles p
  WHERE p.id = _user_id;
  
  -- Se usuário tem tenant_id, só vale role DAQUELE tenant
  IF user_tenant_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = _user_id 
        AND ur.role = _role
        AND (ur.tenant_id = user_tenant_id OR ur.tenant_id IS NULL)
    ) INTO role_exists;
    
    RETURN role_exists;
  END IF;
  
  -- Usuário sem tenant (master) - verificar role normalmente
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO role_exists;
  
  RETURN role_exists;
END;
$$;

-- =====================================================
-- FUNÇÃO is_master_user (usuário sem tenant = master)
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_master_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = _user_id 
    AND tenant_id IS NOT NULL
  )
$$;
