-- Corrigir isolamento de tenant para tabelas que estão faltando

-- 1. notas_fiscais - adicionar política de isolamento
CREATE POLICY "tenant_isolation_notas_fiscais"
ON public.notas_fiscais FOR ALL
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id() 
  OR public.is_super_admin(auth.uid()) 
  OR tenant_id IS NULL
)
WITH CHECK (
  tenant_id = public.get_user_tenant_id() 
  OR public.is_super_admin(auth.uid())
);

-- 2. orcamentos - adicionar política de isolamento
CREATE POLICY "tenant_isolation_orcamentos"
ON public.orcamentos FOR ALL
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id() 
  OR public.is_super_admin(auth.uid()) 
  OR tenant_id IS NULL
)
WITH CHECK (
  tenant_id = public.get_user_tenant_id() 
  OR public.is_super_admin(auth.uid())
);

-- 3. saas_subscriptions - já é gerenciado por super admin, mas precisa isolamento para tenants verem seus próprios dados
CREATE POLICY "tenant_isolation_saas_subscriptions"
ON public.saas_subscriptions FOR SELECT
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id() 
  OR public.is_super_admin(auth.uid())
);

-- 4. saas_usage_metrics - tenants devem ver apenas suas métricas
CREATE POLICY "tenant_isolation_saas_usage_metrics"
ON public.saas_usage_metrics FOR SELECT
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id() 
  OR public.is_super_admin(auth.uid())
);

-- Super admin pode gerenciar subscriptions e metrics
CREATE POLICY "super_admin_manage_saas_subscriptions"
ON public.saas_subscriptions FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "super_admin_manage_saas_usage_metrics"
ON public.saas_usage_metrics FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));