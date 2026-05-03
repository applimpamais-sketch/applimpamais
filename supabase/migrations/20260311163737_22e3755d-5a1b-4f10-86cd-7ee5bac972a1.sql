
CREATE TABLE public.scripts_atendimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL DEFAULT 'servico',
  etapa text NOT NULL DEFAULT 'abertura',
  variante text NOT NULL DEFAULT 'A',
  conteudo text NOT NULL,
  variaveis text[] DEFAULT '{}',
  contexto text,
  ativo boolean DEFAULT true,
  uso_count integer DEFAULT 0,
  conversoes integer DEFAULT 0,
  ab_grupo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.scripts_atendimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read scripts"
  ON public.scripts_atendimento FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert scripts"
  ON public.scripts_atendimento FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update scripts"
  ON public.scripts_atendimento FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete scripts"
  ON public.scripts_atendimento FOR DELETE
  TO authenticated
  USING (true);
