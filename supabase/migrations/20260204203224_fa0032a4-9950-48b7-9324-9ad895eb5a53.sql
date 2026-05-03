-- Criar tabela notas_fiscais para controle de notas fiscais
CREATE TABLE public.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
  numero_nota TEXT,
  serie TEXT DEFAULT '1',
  tipo TEXT DEFAULT 'nfse' CHECK (tipo IN ('nfse', 'nfce', 'manual')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'emitida', 'cancelada', 'rejeitada')),
  valor_total NUMERIC(10,2) NOT NULL,
  valor_impostos NUMERIC(10,2) DEFAULT 0,
  cliente_nome TEXT NOT NULL,
  cliente_documento TEXT,
  cliente_endereco TEXT,
  cliente_email TEXT,
  descricao_servico TEXT NOT NULL,
  data_emissao TIMESTAMP WITH TIME ZONE,
  data_competencia DATE DEFAULT CURRENT_DATE,
  codigo_verificacao TEXT,
  url_pdf TEXT,
  url_xml TEXT,
  resposta_api JSONB,
  observacoes TEXT,
  emitida_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_notas_fiscais_agendamento ON public.notas_fiscais(agendamento_id);
CREATE INDEX idx_notas_fiscais_status ON public.notas_fiscais(status);
CREATE INDEX idx_notas_fiscais_data_emissao ON public.notas_fiscais(data_emissao);
CREATE INDEX idx_notas_fiscais_cliente_documento ON public.notas_fiscais(cliente_documento);

-- Trigger para updated_at
CREATE TRIGGER update_notas_fiscais_updated_at
BEFORE UPDATE ON public.notas_fiscais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem gerenciar notas fiscais
CREATE POLICY "Admins podem gerenciar notas fiscais"
ON public.notas_fiscais
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Criar bucket para armazenar PDFs e XMLs de notas fiscais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'notas-fiscais',
  'notas-fiscais',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/xml', 'text/xml']
) ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para admins
CREATE POLICY "Admins podem fazer upload de notas fiscais"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'notas-fiscais' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins podem visualizar notas fiscais"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'notas-fiscais' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins podem deletar notas fiscais"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'notas-fiscais' 
  AND public.has_role(auth.uid(), 'admin')
);