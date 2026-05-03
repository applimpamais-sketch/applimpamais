-- Adicionar policy para permitir que usuários vejam seu próprio tenant
CREATE POLICY "Users can view their own tenant"
ON saas_tenants
FOR SELECT
TO authenticated
USING (
  -- Responsável do tenant pode ver
  responsavel_user_id = auth.uid()
  OR
  -- Usuário pertence ao tenant (via profile)
  id = public.get_user_tenant_id()
  OR
  -- Super admin sempre pode ver
  is_super_admin(auth.uid())
);

-- Também precisa permitir leitura da subscription
CREATE POLICY "Users can view their own subscriptions"
ON saas_subscriptions
FOR SELECT
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id()
  OR is_super_admin(auth.uid())
);