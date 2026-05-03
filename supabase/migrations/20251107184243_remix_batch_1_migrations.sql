
-- Migration: 20251029104956
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Tabela de serviços de limpeza
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL,
  subcategoria TEXT NOT NULL,
  item TEXT NOT NULL,
  tamanho TEXT,
  preco_limpeza DECIMAL(10,2),
  preco_impermeabilizacao DECIMAL(10,2),
  preco_limpeza_impermeabilizacao DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de aluguel de equipamentos
CREATE TABLE public.alugueis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipamento TEXT NOT NULL,
  periodo_aluguel TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de disponibilidade do calendário
CREATE TABLE public.calendario_disponibilidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  vagas_disponiveis INTEGER NOT NULL DEFAULT 10,
  vagas_totais INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de agendamentos/pedidos
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  bairro TEXT,
  cidade TEXT,
  cep TEXT,
  data_agendamento DATE NOT NULL,
  horario TEXT,
  itens_carrinho JSONB NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alugueis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario_disponibilidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Public read access for servicos and alugueis (catalog data)
CREATE POLICY "Servicos são visíveis para todos"
ON public.servicos FOR SELECT
USING (true);

CREATE POLICY "Alugueis são visíveis para todos"
ON public.alugueis FOR SELECT
USING (true);

CREATE POLICY "Calendario é visível para todos"
ON public.calendario_disponibilidade FOR SELECT
USING (true);

-- Anyone can create agendamentos
CREATE POLICY "Qualquer pessoa pode criar agendamento"
ON public.agendamentos FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_agendamentos_updated_at
BEFORE UPDATE ON public.agendamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_servicos_categoria ON public.servicos(categoria);
CREATE INDEX idx_servicos_subcategoria ON public.servicos(subcategoria);
CREATE INDEX idx_alugueis_equipamento ON public.alugueis(equipamento);
CREATE INDEX idx_calendario_data ON public.calendario_disponibilidade(data);
CREATE INDEX idx_agendamentos_data ON public.agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);
