-- Criar tabela para log de despesas via WhatsApp
CREATE TABLE public.whatsapp_despesas_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  despesa_id UUID REFERENCES public.despesas(id) ON DELETE SET NULL,
  telefone_remetente TEXT NOT NULL,
  tipo_mensagem TEXT NOT NULL CHECK (tipo_mensagem IN ('texto', 'imagem', 'audio')),
  conteudo_original TEXT,
  arquivo_url TEXT,
  transcricao_ia TEXT,
  analise_ia JSONB,
  processamento_status TEXT NOT NULL DEFAULT 'processando' CHECK (processamento_status IN ('processando', 'sucesso', 'erro')),
  erro_mensagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo origem na tabela despesas
ALTER TABLE public.despesas 
ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT 'manual' CHECK (origem IN ('manual', 'whatsapp'));

-- Índices para performance
CREATE INDEX idx_whatsapp_despesas_log_despesa_id ON public.whatsapp_despesas_log(despesa_id);
CREATE INDEX idx_whatsapp_despesas_log_telefone ON public.whatsapp_despesas_log(telefone_remetente);
CREATE INDEX idx_whatsapp_despesas_log_created ON public.whatsapp_despesas_log(created_at DESC);
CREATE INDEX idx_despesas_origem ON public.despesas(origem);

-- RLS Policies
ALTER TABLE public.whatsapp_despesas_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e operadores gerenciam logs WhatsApp"
ON public.whatsapp_despesas_log
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

CREATE POLICY "Visualizadores veem logs WhatsApp"
ON public.whatsapp_despesas_log
FOR SELECT
USING (has_role(auth.uid(), 'visualizador'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_whatsapp_despesas_log_updated_at
BEFORE UPDATE ON public.whatsapp_despesas_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.whatsapp_despesas_log IS 'Registra todas as mensagens de WhatsApp recebidas para lançamento de despesas';
COMMENT ON COLUMN public.whatsapp_despesas_log.tipo_mensagem IS 'Tipo de mensagem recebida: texto, imagem ou audio';
COMMENT ON COLUMN public.whatsapp_despesas_log.analise_ia IS 'Análise estruturada da IA contendo categoria, valor, descrição, etc';
COMMENT ON COLUMN public.despesas.origem IS 'Origem do lançamento: manual (interface) ou whatsapp';