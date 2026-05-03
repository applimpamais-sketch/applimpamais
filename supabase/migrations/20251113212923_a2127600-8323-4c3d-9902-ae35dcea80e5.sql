-- Criar tabela de histórico de agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  tipo_alteracao TEXT NOT NULL,
  campo_alterado TEXT,
  valor_anterior TEXT,
  valor_novo TEXT,
  alterado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar índice para melhorar performance
CREATE INDEX idx_agendamentos_historico_agendamento_id ON public.agendamentos_historico(agendamento_id);
CREATE INDEX idx_agendamentos_historico_created_at ON public.agendamentos_historico(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.agendamentos_historico ENABLE ROW LEVEL SECURITY;

-- Política de leitura para admins, operadores e visualizadores
CREATE POLICY "Admins e operadores veem histórico"
  ON public.agendamentos_historico
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operador'::app_role) OR 
    has_role(auth.uid(), 'visualizador'::app_role)
  );

-- Política de inserção para admins e operadores
CREATE POLICY "Admins e operadores criam histórico"
  ON public.agendamentos_historico
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operador'::app_role)
  );

-- Trigger para registrar mudanças de status automaticamente
CREATE OR REPLACE FUNCTION public.registrar_mudanca_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Registrar apenas se o status mudou
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.agendamentos_historico (
      agendamento_id,
      tipo_alteracao,
      campo_alterado,
      valor_anterior,
      valor_novo,
      alterado_por
    ) VALUES (
      NEW.id,
      'status_alterado',
      'status',
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER trigger_registrar_mudanca_status
  AFTER UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_mudanca_status();

-- Habilitar realtime para agendamentos_historico
ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos_historico;