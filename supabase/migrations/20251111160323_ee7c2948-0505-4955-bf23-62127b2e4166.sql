-- Criar enum para tipo de aplicação de cupom
CREATE TYPE public.tipo_aplicacao_cupom AS ENUM ('todos', 'servicos_limpeza', 'combos', 'alugueis');

-- Criar tabela de cupons de desconto
CREATE TABLE public.cupons_desconto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  desconto_percentual numeric NOT NULL CHECK (desconto_percentual > 0 AND desconto_percentual <= 100),
  categorias_aplicaveis text[] NOT NULL,
  tipo_aplicacao tipo_aplicacao_cupom NOT NULL DEFAULT 'servicos_limpeza',
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  data_validade_inicio date,
  data_validade_fim date,
  uso_maximo integer,
  uso_atual integer DEFAULT 0,
  auto_aplicar boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_cupons_codigo ON public.cupons_desconto(codigo);
CREATE INDEX idx_cupons_status ON public.cupons_desconto(status);
CREATE INDEX idx_cupons_auto_aplicar ON public.cupons_desconto(auto_aplicar);

-- RLS Policies
ALTER TABLE public.cupons_desconto ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar cupons
CREATE POLICY "Admins manage cupons" ON public.cupons_desconto
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Qualquer um pode visualizar cupons ativos (necessário para validação no frontend)
CREATE POLICY "Anyone can view active cupons" ON public.cupons_desconto
  FOR SELECT
  USING (status = 'ativo');

-- Trigger para updated_at
CREATE TRIGGER update_cupons_updated_at
  BEFORE UPDATE ON public.cupons_desconto
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir cupom RC30OFF
INSERT INTO public.cupons_desconto (
  codigo, 
  desconto_percentual, 
  categorias_aplicaveis, 
  tipo_aplicacao,
  status,
  auto_aplicar,
  data_validade_inicio,
  uso_maximo
) VALUES (
  'RC30OFF',
  30,
  ARRAY['home'],
  'servicos_limpeza',
  'ativo',
  true,
  CURRENT_DATE,
  NULL
);

-- Adicionar campos de cupom na tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN cupom_codigo text,
ADD COLUMN cupom_desconto_percentual numeric,
ADD COLUMN valor_desconto numeric DEFAULT 0;