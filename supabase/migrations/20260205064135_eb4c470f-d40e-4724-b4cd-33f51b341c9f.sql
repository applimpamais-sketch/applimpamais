-- =============================================
-- BLOG AUTOMATION SYSTEM TABLES
-- =============================================

-- 1. Blog Posts Queue - Main queue for post generation and publishing
CREATE TABLE public.blog_posts_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster TEXT NOT NULL CHECK (cluster IN ('sofa', 'colchao', 'poltrona', 'cadeira', 'tapete', 'carro', 'bebe', 'aluguel', 'outros')),
  servico_item TEXT,
  objective TEXT NOT NULL CHECK (objective IN ('topo', 'meio', 'fundo')),
  region_city TEXT,
  region_bairro TEXT,
  seed_keyword TEXT NOT NULL,
  chosen_keyword TEXT NOT NULL,
  secondary_keywords JSONB DEFAULT '[]'::jsonb,
  title TEXT,
  slug TEXT,
  meta_title TEXT,
  meta_description TEXT,
  excerpt TEXT,
  content_html TEXT,
  faqs_json JSONB DEFAULT '[]'::jsonb,
  faq_schema_jsonld TEXT,
  internal_links JSONB DEFAULT '[]'::jsonb,
  cta_type TEXT CHECK (cta_type IN ('orcamento', 'aluguel', 'servico')),
  cta_link TEXT,
  images JSONB DEFAULT '{}'::jsonb,
  word_count INTEGER DEFAULT 0,
  seo_score INTEGER DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
  difficulty_estimate TEXT CHECK (difficulty_estimate IN ('baixa', 'media', 'alta')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'generating', 'generated', 'reviewed', 'ready', 'publishing', 'published', 'failed')),
  wp_post_id INTEGER,
  wp_post_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id)
);

-- 2. Blog Keywords Bank - Pre-populated keyword combinations
CREATE TABLE public.blog_keywords_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster TEXT NOT NULL,
  servico_item TEXT,
  keyword TEXT NOT NULL,
  funnel_stage TEXT NOT NULL CHECK (funnel_stage IN ('topo', 'meio', 'fundo')),
  intent TEXT CHECK (intent IN ('info', 'comparativo', 'transacional', 'local')),
  city TEXT,
  bairro TEXT,
  difficulty_score INTEGER DEFAULT 50 CHECK (difficulty_score >= 1 AND difficulty_score <= 100),
  opportunity_score INTEGER DEFAULT 50 CHECK (opportunity_score >= 1 AND opportunity_score <= 100),
  used BOOLEAN DEFAULT false,
  post_id UUID REFERENCES public.blog_posts_queue(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Blog Config - WordPress and SEO settings
CREATE TABLE public.blog_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- 4. Blog Publish Logs - Detailed pipeline logs
CREATE TABLE public.blog_publish_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_queue_id UUID REFERENCES public.blog_posts_queue(id) ON DELETE CASCADE,
  step TEXT NOT NULL CHECK (step IN ('generate_keywords', 'generate_outline', 'generate_content', 'generate_images', 'upload_media', 'create_post', 'update_post')),
  success BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  duration_ms INTEGER,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_queue_status ON public.blog_posts_queue(status);
CREATE INDEX idx_blog_posts_queue_cluster ON public.blog_posts_queue(cluster);
CREATE INDEX idx_blog_posts_queue_created_at ON public.blog_posts_queue(created_at DESC);
CREATE INDEX idx_blog_keywords_bank_cluster ON public.blog_keywords_bank(cluster);
CREATE INDEX idx_blog_keywords_bank_funnel ON public.blog_keywords_bank(funnel_stage);
CREATE INDEX idx_blog_keywords_bank_used ON public.blog_keywords_bank(used);
CREATE INDEX idx_blog_keywords_bank_keyword ON public.blog_keywords_bank(keyword);
CREATE INDEX idx_blog_publish_logs_post ON public.blog_publish_logs(post_queue_id);

-- Enable RLS
ALTER TABLE public.blog_posts_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_keywords_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_publish_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access (using cargo field)
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND cargo = 'admin')
  );

CREATE POLICY "Admins can manage keywords" ON public.blog_keywords_bank
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND cargo = 'admin')
  );

CREATE POLICY "Admins can manage blog config" ON public.blog_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND cargo = 'admin')
  );

CREATE POLICY "Admins can view blog logs" ON public.blog_publish_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND cargo = 'admin')
  );

-- Updated_at trigger for blog_posts_queue
CREATE TRIGGER update_blog_posts_queue_updated_at
  BEFORE UPDATE ON public.blog_posts_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default config values
INSERT INTO public.blog_config (key, value, description) VALUES
  ('wordpress_url', '"https://limpezadeverdade.com.br"', 'URL base do WordPress'),
  ('wordpress_username', '""', 'Username do WordPress'),
  ('min_word_count', '1200', 'Mínimo de palavras por post'),
  ('min_h2_count', '4', 'Mínimo de H2 por post'),
  ('min_faq_count', '5', 'Mínimo de FAQs por post'),
  ('auto_publish', 'false', 'Publicar automaticamente'),
  ('default_status', '"draft"', 'Status padrão no WordPress'),
  ('ai_temperature', '0.7', 'Temperatura do modelo de IA'),
  ('category_mapping', '{"sofa": 1, "colchao": 2, "poltrona": 3, "cadeira": 4, "tapete": 5, "carro": 6, "bebe": 7, "aluguel": 8, "outros": 9}', 'Mapeamento cluster -> categoria WP');