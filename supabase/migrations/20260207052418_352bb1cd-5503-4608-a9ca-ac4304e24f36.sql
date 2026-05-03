-- Add tenant_id to alugueis for multi-tenant isolation
ALTER TABLE alugueis ADD COLUMN tenant_id UUID REFERENCES saas_tenants(id);

-- Assign existing equipment to RC Limpa Mais master tenant
UPDATE alugueis SET tenant_id = '2046cf1c-af8c-4e5e-b992-092ec922c35c' WHERE tenant_id IS NULL;

-- Enable RLS
ALTER TABLE alugueis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY "tenant_isolation_alugueis_select" ON alugueis 
  FOR SELECT USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

CREATE POLICY "tenant_isolation_alugueis_insert" ON alugueis 
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

CREATE POLICY "tenant_isolation_alugueis_update" ON alugueis 
  FOR UPDATE USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

CREATE POLICY "tenant_isolation_alugueis_delete" ON alugueis 
  FOR DELETE USING (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));