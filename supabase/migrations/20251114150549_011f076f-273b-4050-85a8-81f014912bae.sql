-- Criar tabela para funcionários do bot (apenas WhatsApp, sem acesso ao dashboard)
CREATE TABLE public.funcionarios_bot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone_whatsapp TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Comentário explicativo
COMMENT ON TABLE public.funcionarios_bot IS 'Funcionários que recebem notificações via WhatsApp, sem acesso ao dashboard';

-- Habilitar RLS
ALTER TABLE public.funcionarios_bot ENABLE ROW LEVEL SECURITY;

-- Policy: Admins e operadores gerenciam funcionarios_bot
CREATE POLICY "Admins e operadores gerenciam funcionarios_bot"
ON public.funcionarios_bot
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- Policy: Visualizadores veem funcionarios_bot
CREATE POLICY "Visualizadores veem funcionarios_bot"
ON public.funcionarios_bot
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'visualizador'::app_role));

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER set_funcionarios_bot_updated_at
BEFORE UPDATE ON public.funcionarios_bot
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para busca por telefone
CREATE INDEX idx_funcionarios_bot_telefone ON public.funcionarios_bot(telefone_whatsapp);

-- Índice para busca por status ativo
CREATE INDEX idx_funcionarios_bot_ativo ON public.funcionarios_bot(ativo);