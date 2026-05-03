-- =====================================================
-- SUPER ADMIN - PARTE 2: Tabelas, Funções e Policies
-- =====================================================

-- 1. Criar enum para planos SaaS
CREATE TYPE public.saas_plano AS ENUM ('starter', 'professional', 'enterprise');

-- 2. Criar enum para status do tenant
CREATE TYPE public.saas_tenant_status AS ENUM ('trial', 'ativo', 'inadimplente', 'cancelado', 'pausado');

-- 3. Criar enum para status de pagamento
CREATE TYPE public.saas_payment_status AS ENUM ('pago', 'pendente', 'atrasado', 'cancelado');

-- =====================================================
-- TABELA: saas_tenants (Empresas Clientes)
-- =====================================================
CREATE TABLE public.saas_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE,
  email_contato TEXT NOT NULL,
  telefone TEXT,
  responsavel_nome TEXT NOT NULL,
  responsavel_email TEXT NOT NULL,
  responsavel_user_id UUID REFERENCES auth.users(id),
  
  plano saas_plano NOT NULL DEFAULT 'starter',
  status saas_tenant_status NOT NULL DEFAULT 'trial',
  valor_mensal NUMERIC(10,2) NOT NULL DEFAULT 297.00,
  dia_vencimento INTEGER DEFAULT 10 CHECK (dia_vencimento BETWEEN 1 AND 28),
  
  trial_termina_em TIMESTAMP WITH TIME ZONE,
  ativado_em TIMESTAMP WITH TIME ZONE,
  cancelado_em TIMESTAMP WITH TIME ZONE,
  ultimo_pagamento_em TIMESTAMP WITH TIME ZONE,
  
  configuracoes JSONB DEFAULT '{}'::jsonb,
  dominio_customizado TEXT,
  logo_url TEXT,
  cores_personalizadas JSONB,
  
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id)
);

CREATE TRIGGER update_saas_tenants_updated_at
  BEFORE UPDATE ON public.saas_tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TABELA: saas_subscriptions (Histórico de Pagamentos)
-- =====================================================
CREATE TABLE public.saas_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.saas_tenants(id) ON DELETE CASCADE,
  mes_referencia DATE NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  desconto NUMERIC(10,2) DEFAULT 0,
  valor_pago NUMERIC(10,2),
  status saas_payment_status NOT NULL DEFAULT 'pendente',
  data_vencimento DATE NOT NULL,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  forma_pagamento TEXT,
  comprovante_url TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, mes_referencia)
);

CREATE TRIGGER update_saas_subscriptions_updated_at
  BEFORE UPDATE ON public.saas_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TABELA: saas_usage_metrics (Métricas de Uso)
-- =====================================================
CREATE TABLE public.saas_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.saas_tenants(id) ON DELETE CASCADE,
  mes_referencia DATE NOT NULL,
  agendamentos_criados INTEGER DEFAULT 0,
  agendamentos_concluidos INTEGER DEFAULT 0,
  mensagens_whatsapp_enviadas INTEGER DEFAULT 0,
  mensagens_whatsapp_recebidas INTEGER DEFAULT 0,
  tecnicos_ativos INTEGER DEFAULT 0,
  usuarios_ativos INTEGER DEFAULT 0,
  receita_cliente NUMERIC(10,2) DEFAULT 0,
  ticket_medio NUMERIC(10,2) DEFAULT 0,
  storage_usado_mb NUMERIC(10,2) DEFAULT 0,
  calculado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, mes_referencia)
);

-- =====================================================
-- FUNÇÃO: is_super_admin() - Verificar se é super admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- =====================================================
-- RLS POLICIES - saas_tenants
-- =====================================================
ALTER TABLE public.saas_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can view all tenants"
  ON public.saas_tenants FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can insert tenants"
  ON public.saas_tenants FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can update tenants"
  ON public.saas_tenants FOR UPDATE
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can delete tenants"
  ON public.saas_tenants FOR DELETE
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- =====================================================
-- RLS POLICIES - saas_subscriptions
-- =====================================================
ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage subscriptions"
  ON public.saas_subscriptions FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- =====================================================
-- RLS POLICIES - saas_usage_metrics
-- =====================================================
ALTER TABLE public.saas_usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage usage metrics"
  ON public.saas_usage_metrics FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_saas_tenants_status ON public.saas_tenants(status);
CREATE INDEX idx_saas_tenants_plano ON public.saas_tenants(plano);
CREATE INDEX idx_saas_tenants_trial ON public.saas_tenants(trial_termina_em) WHERE status = 'trial';
CREATE INDEX idx_saas_subscriptions_tenant ON public.saas_subscriptions(tenant_id);
CREATE INDEX idx_saas_subscriptions_status ON public.saas_subscriptions(status);
CREATE INDEX idx_saas_subscriptions_mes ON public.saas_subscriptions(mes_referencia);
CREATE INDEX idx_saas_usage_tenant_mes ON public.saas_usage_metrics(tenant_id, mes_referencia);

-- =====================================================
-- VIEW: Resumo SaaS para Dashboard
-- =====================================================
CREATE OR REPLACE VIEW public.vw_saas_dashboard AS
SELECT
  COALESCE(SUM(CASE WHEN status = 'ativo' THEN valor_mensal ELSE 0 END), 0) as mrr,
  COUNT(*) FILTER (WHERE status = 'ativo') as clientes_ativos,
  COUNT(*) FILTER (WHERE status = 'trial') as clientes_trial,
  COUNT(*) FILTER (WHERE status = 'inadimplente') as clientes_inadimplentes,
  COUNT(*) FILTER (WHERE status = 'cancelado' AND cancelado_em >= date_trunc('month', CURRENT_DATE)) as churn_mes,
  COUNT(*) FILTER (WHERE status = 'trial' AND trial_termina_em <= CURRENT_DATE + INTERVAL '7 days') as trials_expirando,
  COALESCE(SUM(CASE WHEN status = 'ativo' AND plano = 'starter' THEN valor_mensal ELSE 0 END), 0) as mrr_starter,
  COALESCE(SUM(CASE WHEN status = 'ativo' AND plano = 'professional' THEN valor_mensal ELSE 0 END), 0) as mrr_professional,
  COALESCE(SUM(CASE WHEN status = 'ativo' AND plano = 'enterprise' THEN valor_mensal ELSE 0 END), 0) as mrr_enterprise,
  COUNT(*) as total_tenants
FROM public.saas_tenants;