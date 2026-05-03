-- Create upsells table for additional products
CREATE TABLE public.upsells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.saas_tenants(id) NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  aplicavel_a TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.upsells ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenant users can view their upsells"
ON public.upsells FOR SELECT
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant users can insert their upsells"
ON public.upsells FOR INSERT
WITH CHECK (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant users can update their upsells"
ON public.upsells FOR UPDATE
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant users can delete their upsells"
ON public.upsells FOR DELETE
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

-- Auto-set tenant_id trigger
CREATE TRIGGER auto_set_tenant_id_upsells
  BEFORE INSERT ON public.upsells
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_tenant_id();

-- Updated_at trigger
CREATE TRIGGER update_upsells_updated_at
  BEFORE UPDATE ON public.upsells
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_upsells_tenant_id ON public.upsells(tenant_id);
CREATE INDEX idx_upsells_ativo ON public.upsells(ativo) WHERE ativo = true;

-- Seed initial upsells data for master tenant
INSERT INTO public.upsells (tenant_id, nome, descricao, preco, aplicavel_a, ativo) VALUES
('00000000-0000-0000-0000-000000000001', 'Escova Automática', 'Escova elétrica para limpeza profunda', 50.00, ARRAY['locacoes'], true),
('00000000-0000-0000-0000-000000000001', 'Kit Shampoo Estofados', '4 frascos de shampoo especial para estofados', 50.00, ARRAY['locacoes'], true),
('00000000-0000-0000-0000-000000000001', 'Kit Odorizador', '3 frascos de odorizador profissional', 45.00, ARRAY['locacoes'], true);