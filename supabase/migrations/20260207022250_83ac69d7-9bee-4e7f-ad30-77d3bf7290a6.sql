-- Tabela de catálogo de módulos vendáveis
CREATE TABLE public.saas_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_base DECIMAL(10,2) NOT NULL,
  categoria TEXT,
  dependencias TEXT[] DEFAULT '{}',
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de módulos contratados por tenant
CREATE TABLE public.tenant_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.saas_tenants(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES public.saas_modulos(id) ON DELETE CASCADE,
  preco_negociado DECIMAL(10,2),
  ativado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  desativado_em TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, modulo_id)
);

-- Índices para performance
CREATE INDEX idx_tenant_modulos_tenant ON public.tenant_modulos(tenant_id);
CREATE INDEX idx_tenant_modulos_status ON public.tenant_modulos(status);
CREATE INDEX idx_saas_modulos_codigo ON public.saas_modulos(codigo);
CREATE INDEX idx_saas_modulos_ativo ON public.saas_modulos(ativo);

-- Função para verificar se tenant tem módulo
CREATE OR REPLACE FUNCTION public.has_module(p_tenant_id UUID, p_modulo_codigo TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.tenant_modulos tm
    JOIN public.saas_modulos m ON m.id = tm.modulo_id
    WHERE tm.tenant_id = p_tenant_id
    AND m.codigo = p_modulo_codigo
    AND tm.status = 'ativo'
    AND tm.desativado_em IS NULL
    AND m.ativo = TRUE
  )
$$;

-- Função para obter módulos ativos de um tenant
CREATE OR REPLACE FUNCTION public.get_tenant_modules(p_tenant_id UUID)
RETURNS TABLE (
  modulo_id UUID,
  codigo TEXT,
  nome TEXT,
  preco_negociado DECIMAL,
  preco_base DECIMAL,
  ativado_em TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.id as modulo_id,
    m.codigo,
    m.nome,
    tm.preco_negociado,
    m.preco_base,
    tm.ativado_em
  FROM public.tenant_modulos tm
  JOIN public.saas_modulos m ON m.id = tm.modulo_id
  WHERE tm.tenant_id = p_tenant_id
  AND tm.status = 'ativo'
  AND tm.desativado_em IS NULL
  AND m.ativo = TRUE
  ORDER BY m.ordem, m.nome
$$;

-- Enable RLS
ALTER TABLE public.saas_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_modulos ENABLE ROW LEVEL SECURITY;

-- Políticas para saas_modulos (catálogo público para leitura)
CREATE POLICY "Módulos visíveis para todos autenticados"
ON public.saas_modulos FOR SELECT
TO authenticated
USING (ativo = TRUE);

CREATE POLICY "Super admins podem gerenciar módulos"
ON public.saas_modulos FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Políticas para tenant_modulos
CREATE POLICY "Super admins podem gerenciar tenant_modulos"
ON public.tenant_modulos FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Usuários podem ver módulos do próprio tenant"
ON public.tenant_modulos FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_saas_modulos_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_saas_modulos_timestamp
BEFORE UPDATE ON public.saas_modulos
FOR EACH ROW EXECUTE FUNCTION public.update_saas_modulos_updated_at();

CREATE TRIGGER update_tenant_modulos_timestamp
BEFORE UPDATE ON public.tenant_modulos
FOR EACH ROW EXECUTE FUNCTION public.update_saas_modulos_updated_at();

-- Seed inicial com módulos
INSERT INTO public.saas_modulos (codigo, nome, descricao, preco_base, categoria, dependencias, icone, ordem) VALUES
('dashboard_gestao', 'Dashboard de Gestão', 'Painel administrativo com agendamentos, técnicos e relatórios básicos', 147.00, 'core', '{}', 'LayoutDashboard', 1),
('loja_online', 'Loja Online', 'Agendamento online com checkout, carrinho e pagamentos', 97.00, 'core', '{dashboard_gestao}', 'ShoppingCart', 2),
('financeiro', 'Módulo Financeiro', 'DRE, fluxo de caixa, metas financeiras e controle de despesas', 97.00, 'gestao', '{dashboard_gestao}', 'DollarSign', 3),
('whatsapp_bot', 'Bot WhatsApp', 'Atendimento automático via WhatsApp com IA', 197.00, 'automacao', '{dashboard_gestao}', 'MessageSquare', 4),
('rastreamento_rota', 'Rastreamento de Rota', 'Tracking em tempo real para técnicos e clientes', 67.00, 'operacao', '{dashboard_gestao}', 'MapPin', 5),
('marketing_tools', 'Ferramentas de Marketing', 'Cupons, carrinhos abandonados e push notifications', 97.00, 'marketing', '{dashboard_gestao}', 'Megaphone', 6),
('blog_seo', 'Blog/SEO', 'Geração automática de conteúdo otimizado para SEO', 147.00, 'marketing', '{}', 'FileText', 7),
('parcerias', 'Sistema de Parcerias', 'Programa de afiliados e indicações com comissões', 47.00, 'vendas', '{dashboard_gestao}', 'Users', 8),
('relatorios_avancados', 'Relatórios Avançados', 'Análises detalhadas, exportação e dashboards customizados', 97.00, 'gestao', '{dashboard_gestao}', 'BarChart3', 9),
('api_access', 'Acesso API', 'Integração via API REST para sistemas externos', 197.00, 'integracao', '{}', 'Code', 10),
('white_label', 'White Label', 'Marca própria, domínio customizado e sem menção à plataforma', 297.00, 'premium', '{dashboard_gestao}', 'Palette', 11);