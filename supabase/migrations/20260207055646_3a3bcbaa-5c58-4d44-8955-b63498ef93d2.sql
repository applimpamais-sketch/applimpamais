-- Tabela para armazenar criativos gerados
CREATE TABLE public.iarc_criativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('feed', 'stories', 'carrossel')),
  prompt TEXT NOT NULL,
  estilo TEXT CHECK (estilo IN ('minimalista', 'vibrante', 'profissional', 'moderno', 'elegante')),
  texto_overlay TEXT,
  imagens JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela para landing pages
CREATE TABLE public.iarc_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  template_tipo TEXT NOT NULL CHECK (template_tipo IN ('promocao_simples', 'vsl', 'captura_leads', 'comparativo', 'servico_local')),
  config JSONB DEFAULT '{}'::jsonb,
  copy_gerada JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada', 'arquivada')),
  slug TEXT UNIQUE,
  publicada_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela para copys geradas
CREATE TABLE public.iarc_copys_geradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE CASCADE,
  tipo_copy TEXT NOT NULL CHECK (tipo_copy IN ('headlines', 'subheadlines', 'bullets', 'cta', 'depoimentos', 'faq', 'urgencia')),
  contexto JSONB DEFAULT '{}'::jsonb,
  copys JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.iarc_criativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iarc_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iarc_copys_geradas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para iarc_criativos
CREATE POLICY "Tenant pode ver seus criativos"
ON public.iarc_criativos FOR SELECT
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant pode criar criativos"
ON public.iarc_criativos FOR INSERT
WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant pode deletar seus criativos"
ON public.iarc_criativos FOR DELETE
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

-- Políticas RLS para iarc_landing_pages
CREATE POLICY "Tenant pode ver suas landing pages"
ON public.iarc_landing_pages FOR SELECT
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant pode criar landing pages"
ON public.iarc_landing_pages FOR INSERT
WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant pode atualizar suas landing pages"
ON public.iarc_landing_pages FOR UPDATE
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant pode deletar suas landing pages"
ON public.iarc_landing_pages FOR DELETE
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

-- Políticas RLS para iarc_copys_geradas
CREATE POLICY "Tenant pode ver suas copys"
ON public.iarc_copys_geradas FOR SELECT
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant pode criar copys"
ON public.iarc_copys_geradas FOR INSERT
WITH CHECK (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Tenant pode deletar suas copys"
ON public.iarc_copys_geradas FOR DELETE
USING (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()));

-- Trigger para auto-set tenant_id em iarc_criativos
CREATE OR REPLACE FUNCTION public.auto_set_iarc_criativos_tenant()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := public.get_user_tenant_id();
  END IF;
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_iarc_criativos_tenant
BEFORE INSERT ON public.iarc_criativos
FOR EACH ROW EXECUTE FUNCTION public.auto_set_iarc_criativos_tenant();

-- Trigger para auto-set tenant_id em iarc_landing_pages
CREATE OR REPLACE FUNCTION public.auto_set_iarc_landing_pages_tenant()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := public.get_user_tenant_id();
  END IF;
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_iarc_landing_pages_tenant
BEFORE INSERT ON public.iarc_landing_pages
FOR EACH ROW EXECUTE FUNCTION public.auto_set_iarc_landing_pages_tenant();

-- Trigger para updated_at em landing pages
CREATE OR REPLACE FUNCTION public.update_iarc_landing_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_iarc_landing_pages_timestamp
BEFORE UPDATE ON public.iarc_landing_pages
FOR EACH ROW EXECUTE FUNCTION public.update_iarc_landing_pages_updated_at();

-- Trigger para auto-set tenant_id em iarc_copys_geradas
CREATE OR REPLACE FUNCTION public.auto_set_iarc_copys_tenant()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := public.get_user_tenant_id();
  END IF;
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_iarc_copys_tenant
BEFORE INSERT ON public.iarc_copys_geradas
FOR EACH ROW EXECUTE FUNCTION public.auto_set_iarc_copys_tenant();

-- Índices para performance
CREATE INDEX idx_iarc_criativos_tenant ON public.iarc_criativos(tenant_id);
CREATE INDEX idx_iarc_landing_pages_tenant ON public.iarc_landing_pages(tenant_id);
CREATE INDEX idx_iarc_landing_pages_status ON public.iarc_landing_pages(status);
CREATE INDEX idx_iarc_copys_tenant ON public.iarc_copys_geradas(tenant_id);