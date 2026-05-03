
-- Adicionar referência ao funcionário no log financeiro do WhatsApp
ALTER TABLE public.whatsapp_financeiro_log 
ADD COLUMN funcionario_bot_id UUID REFERENCES public.funcionarios_bot(id);

-- Adicionar referência à despesa criada
ALTER TABLE public.whatsapp_financeiro_log 
ADD COLUMN despesa_id UUID REFERENCES public.despesas(id);

-- Index para consultas por funcionário
CREATE INDEX idx_whatsapp_financeiro_log_funcionario ON public.whatsapp_financeiro_log(funcionario_bot_id);
