
-- =====================================================
-- CORREÇÃO ADICIONAL: Tabelas restantes para RESTRICTIVE
-- =====================================================

-- MARKETING_INVESTIMENTOS
DROP POLICY IF EXISTS tenant_isolation_marketing ON marketing_investimentos;
CREATE POLICY tenant_isolation_marketing ON marketing_investimentos
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- METAS_FINANCEIRAS
DROP POLICY IF EXISTS tenant_isolation_metas ON metas_financeiras;
CREATE POLICY tenant_isolation_metas ON metas_financeiras
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- NOTAS_FISCAIS
DROP POLICY IF EXISTS tenant_isolation_notas_fiscais ON notas_fiscais;
CREATE POLICY tenant_isolation_notas_fiscais ON notas_fiscais
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- ORCAMENTOS
DROP POLICY IF EXISTS tenant_isolation_orcamentos ON orcamentos;
CREATE POLICY tenant_isolation_orcamentos ON orcamentos
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- PARCEIRO_CONVERSOES
DROP POLICY IF EXISTS tenant_isolation_parceiro_conv ON parceiro_conversoes;
CREATE POLICY tenant_isolation_parceiro_conv ON parceiro_conversoes
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- PARCEIRO_LINKS
DROP POLICY IF EXISTS tenant_isolation_parceiro_links ON parceiro_links;
CREATE POLICY tenant_isolation_parceiro_links ON parceiro_links
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- PARCEIRO_SAQUES
DROP POLICY IF EXISTS tenant_isolation_parceiro_saques ON parceiro_saques;
CREATE POLICY tenant_isolation_parceiro_saques ON parceiro_saques
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- PARCEIROS
DROP POLICY IF EXISTS tenant_isolation_parceiros ON parceiros;
CREATE POLICY tenant_isolation_parceiros ON parceiros
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- TEMPLATES_MENSAGENS
DROP POLICY IF EXISTS tenant_isolation_templates ON templates_mensagens;
CREATE POLICY tenant_isolation_templates ON templates_mensagens
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- WHATSAPP_CONVERSAS
DROP POLICY IF EXISTS tenant_isolation_whatsapp_conversas ON whatsapp_conversas;
CREATE POLICY tenant_isolation_whatsapp_conversas ON whatsapp_conversas
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- WHATSAPP_MENSAGENS
DROP POLICY IF EXISTS tenant_isolation_whatsapp_mensagens ON whatsapp_mensagens;
CREATE POLICY tenant_isolation_whatsapp_mensagens ON whatsapp_mensagens
AS RESTRICTIVE FOR ALL TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- SAAS_SUBSCRIPTIONS (apenas super_admin pode ver)
DROP POLICY IF EXISTS tenant_isolation_saas_subscriptions ON saas_subscriptions;
CREATE POLICY tenant_isolation_saas_subscriptions ON saas_subscriptions
AS RESTRICTIVE FOR SELECT TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

-- SAAS_USAGE_METRICS (apenas super_admin ou próprio tenant)
DROP POLICY IF EXISTS tenant_isolation_saas_usage_metrics ON saas_usage_metrics;
CREATE POLICY tenant_isolation_saas_usage_metrics ON saas_usage_metrics
AS RESTRICTIVE FOR SELECT TO authenticated
USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));
