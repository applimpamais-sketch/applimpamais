
-- Tabela de eventos UTMify (postbacks recebidos)
CREATE TABLE public.utmify_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.saas_tenants(id),
  order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  valor NUMERIC DEFAULT 0,
  plataforma TEXT,
  campanha TEXT,
  ad_set TEXT,
  ad_name TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  custo_campanha NUMERIC DEFAULT 0,
  payload_raw JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_utmify_events_tenant ON public.utmify_events(tenant_id);
CREATE INDEX idx_utmify_events_campanha ON public.utmify_events(campanha);
CREATE INDEX idx_utmify_events_created ON public.utmify_events(created_at);
CREATE INDEX idx_utmify_events_status ON public.utmify_events(status);

-- RLS
ALTER TABLE public.utmify_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "utmify_events_select_authenticated"
ON public.utmify_events FOR SELECT TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

CREATE POLICY "utmify_events_insert_anon"
ON public.utmify_events FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Tabela de resumo de campanhas
CREATE TABLE public.utmify_campanhas_resumo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.saas_tenants(id),
  campanha TEXT NOT NULL,
  periodo DATE NOT NULL,
  total_vendas INTEGER DEFAULT 0,
  total_valor NUMERIC DEFAULT 0,
  total_reembolsos INTEGER DEFAULT 0,
  valor_reembolsos NUMERIC DEFAULT 0,
  custo_ads NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  cpa NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, campanha, periodo)
);

ALTER TABLE public.utmify_campanhas_resumo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "utmify_resumo_select_authenticated"
ON public.utmify_campanhas_resumo FOR SELECT TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

CREATE POLICY "utmify_resumo_insert_anon"
ON public.utmify_campanhas_resumo FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "utmify_resumo_update_anon"
ON public.utmify_campanhas_resumo FOR UPDATE TO anon, authenticated
USING (true) WITH CHECK (true);

-- Adicionar 'utmify' ao check constraint da tabela integracoes
ALTER TABLE integracoes DROP CONSTRAINT IF EXISTS integracoes_tipo_check;
ALTER TABLE integracoes ADD CONSTRAINT integracoes_tipo_check CHECK (tipo = ANY (ARRAY['facebook'::text, 'webhook'::text, 'whatsapp'::text, 'avaliacoes'::text, 'utmify'::text]));
