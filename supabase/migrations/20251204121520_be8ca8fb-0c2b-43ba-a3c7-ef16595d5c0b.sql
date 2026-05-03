-- Tabela para armazenar avaliações de clientes com moderação
CREATE TABLE public.avaliacoes_clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT NOT NULL,
  servico TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  aprovado_por UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX idx_avaliacoes_clientes_status ON public.avaliacoes_clientes(status);
CREATE INDEX idx_avaliacoes_clientes_created_at ON public.avaliacoes_clientes(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.avaliacoes_clientes ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer pessoa pode inserir avaliações (formulário público)
CREATE POLICY "Qualquer pessoa pode enviar avaliação"
ON public.avaliacoes_clientes
FOR INSERT
WITH CHECK (
  nome IS NOT NULL AND 
  cidade IS NOT NULL AND 
  bairro IS NOT NULL AND 
  comentario IS NOT NULL AND
  servico IS NOT NULL AND
  rating >= 1 AND rating <= 5 AND
  status = 'pendente'
);

-- Política: Todos podem ver apenas avaliações aprovadas
CREATE POLICY "Avaliações aprovadas são públicas"
ON public.avaliacoes_clientes
FOR SELECT
USING (status = 'aprovado');

-- Política: Admins e operadores podem ver todas as avaliações
CREATE POLICY "Staff vê todas as avaliações"
ON public.avaliacoes_clientes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- Política: Admins e operadores podem atualizar status (aprovar/rejeitar)
CREATE POLICY "Staff pode moderar avaliações"
ON public.avaliacoes_clientes
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- Política: Apenas admins podem deletar
CREATE POLICY "Admins podem deletar avaliações"
ON public.avaliacoes_clientes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));