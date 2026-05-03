-- Permitir leitura pública de landing pages pelo slug (para visualização)
CREATE POLICY "Landing pages públicas podem ser visualizadas por qualquer um"
  ON public.iarc_landing_pages
  FOR SELECT
  USING (true);