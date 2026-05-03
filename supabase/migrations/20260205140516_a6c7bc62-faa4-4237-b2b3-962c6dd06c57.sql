-- Adicionar colunas trend_score e competitor_gap_score ao blog_keywords_bank
ALTER TABLE public.blog_keywords_bank 
ADD COLUMN IF NOT EXISTS trend_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS competitor_gap_score integer DEFAULT 0;