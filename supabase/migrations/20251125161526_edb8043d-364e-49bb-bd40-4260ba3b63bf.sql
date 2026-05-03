-- Criar tabela para armazenar investimentos em ads
CREATE TABLE IF NOT EXISTS public.marketing_investimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_referencia DATE NOT NULL,
  valor_investido NUMERIC NOT NULL DEFAULT 0,
  plataforma TEXT NOT NULL DEFAULT 'meta_ads',
  usar_despesas_automatico BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mes_referencia, plataforma)
);

-- Habilitar RLS
ALTER TABLE public.marketing_investimentos ENABLE ROW LEVEL SECURITY;

-- Policy para admins e operadores gerenciarem
CREATE POLICY "Admins e operadores gerenciam investimentos"
ON public.marketing_investimentos
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- Policy para visualizadores verem
CREATE POLICY "Visualizadores veem investimentos"
ON public.marketing_investimentos
FOR SELECT
USING (has_role(auth.uid(), 'visualizador'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_marketing_investimentos_updated_at
BEFORE UPDATE ON public.marketing_investimentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_marketing_investimentos_mes 
ON public.marketing_investimentos(mes_referencia DESC);