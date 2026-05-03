-- Criar tabela de leads capturados via cupom
CREATE TABLE IF NOT EXISTS public.leads_cupom (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cupom_codigo TEXT NOT NULL DEFAULT 'LIMPA20',
  origem TEXT DEFAULT 'popup_homepage',
  converteu_em_agendamento BOOLEAN DEFAULT false,
  agendamento_id UUID REFERENCES public.agendamentos(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index para buscas por WhatsApp (verificar duplicatas)
CREATE INDEX idx_leads_cupom_whatsapp ON public.leads_cupom(whatsapp);
CREATE INDEX idx_leads_cupom_created_at ON public.leads_cupom(created_at DESC);
CREATE INDEX idx_leads_cupom_converteu ON public.leads_cupom(converteu_em_agendamento);

-- RLS: permitir inserção pública (leads anônimos)
ALTER TABLE public.leads_cupom ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir INSERT público em leads"
  ON public.leads_cupom
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Apenas admin/operador/visualizador podem ler leads
CREATE POLICY "Admin pode ler leads"
  ON public.leads_cupom
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role));

-- Admin/operador podem atualizar leads
CREATE POLICY "Admin pode atualizar leads"
  ON public.leads_cupom
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_leads_cupom_updated_at
  BEFORE UPDATE ON public.leads_cupom
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();