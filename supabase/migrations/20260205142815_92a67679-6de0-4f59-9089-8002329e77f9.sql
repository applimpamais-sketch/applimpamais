-- Adicionar colunas para importação de keywords do Google Keyword Planner
ALTER TABLE public.blog_keywords_bank 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'generated',
ADD COLUMN IF NOT EXISTS search_volume integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS competition text DEFAULT null,
ADD COLUMN IF NOT EXISTS cpc numeric(10,2) DEFAULT null,
ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT null;

-- Criar índice para filtrar por source
CREATE INDEX IF NOT EXISTS idx_blog_keywords_source ON public.blog_keywords_bank(source);

-- Criar índice para buscar por batch
CREATE INDEX IF NOT EXISTS idx_blog_keywords_batch ON public.blog_keywords_bank(import_batch_id);

COMMENT ON COLUMN public.blog_keywords_bank.source IS 'Origem da keyword: generated, google_planner, autocomplete, manual';
COMMENT ON COLUMN public.blog_keywords_bank.search_volume IS 'Volume de buscas mensais do Google Keyword Planner';
COMMENT ON COLUMN public.blog_keywords_bank.competition IS 'Nível de concorrência: low, medium, high';
COMMENT ON COLUMN public.blog_keywords_bank.cpc IS 'Custo por clique estimado';
COMMENT ON COLUMN public.blog_keywords_bank.import_batch_id IS 'ID do lote de importação para agrupar keywords importadas juntas';