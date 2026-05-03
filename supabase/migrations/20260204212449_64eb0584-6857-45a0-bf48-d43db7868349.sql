-- Add column to track which bot staff member created the appointment
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS criado_por_funcionario_bot UUID REFERENCES public.funcionarios_bot(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agendamentos_criado_por_funcionario_bot 
ON public.agendamentos(criado_por_funcionario_bot);

-- Comment explaining the column
COMMENT ON COLUMN public.agendamentos.criado_por_funcionario_bot IS 'Reference to funcionarios_bot when appointment was created via WhatsApp staff forwarding';