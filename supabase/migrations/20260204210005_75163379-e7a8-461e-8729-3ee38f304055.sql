-- Tabela de orçamentos
CREATE TABLE public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL NOT NULL,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'recusado', 'expirado')),
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT,
  cliente_telefone TEXT,
  cliente_documento TEXT,
  cliente_endereco TEXT,
  cliente_cidade TEXT,
  empresa_nome TEXT,
  itens JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  desconto_tipo TEXT CHECK (desconto_tipo IN ('percentual', 'fixo')),
  desconto_valor NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  condicoes_pagamento TEXT,
  observacoes TEXT,
  validade_dias INTEGER DEFAULT 15,
  data_validade DATE,
  url_pdf TEXT,
  enviado_em TIMESTAMP WITH TIME ZONE,
  respondido_em TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX idx_orcamentos_created_by ON public.orcamentos(created_by);
CREATE INDEX idx_orcamentos_data_validade ON public.orcamentos(data_validade);

-- Habilitar RLS
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Admins e operadores podem gerenciar (usando user_roles)
CREATE POLICY "Admins podem ver todos orcamentos" 
ON public.orcamentos FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'operador')
  )
);

CREATE POLICY "Admins podem criar orcamentos" 
ON public.orcamentos FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'operador')
  )
);

CREATE POLICY "Admins podem atualizar orcamentos" 
ON public.orcamentos FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'operador')
  )
);

CREATE POLICY "Admins podem deletar orcamentos" 
ON public.orcamentos FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'operador')
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_orcamentos_updated_at
BEFORE UPDATE ON public.orcamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket para armazenar PDFs dos orçamentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('orcamentos', 'orcamentos', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage - acesso público para leitura
CREATE POLICY "Orcamentos PDFs são públicos para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'orcamentos');

-- Política de storage - admins podem fazer upload
CREATE POLICY "Admins podem fazer upload de orcamentos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'orcamentos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'operador')
  )
);

-- Política de storage - admins podem deletar
CREATE POLICY "Admins podem deletar orcamentos storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'orcamentos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'operador')
  )
);