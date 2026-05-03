-- Criar tabela de reembolsos
CREATE TABLE IF NOT EXISTS public.reembolsos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  pagamento_id UUID REFERENCES public.pagamentos_agendamentos(id) ON DELETE SET NULL,
  valor_reembolsado NUMERIC NOT NULL CHECK (valor_reembolsado > 0),
  motivo TEXT NOT NULL,
  metodo_reembolso TEXT,
  data_reembolso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comprovante_url TEXT,
  observacoes TEXT,
  processado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reembolsos_agendamento ON public.reembolsos(agendamento_id);
CREATE INDEX idx_reembolsos_data ON public.reembolsos(data_reembolso);

-- RLS Policies
ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e operadores gerenciam reembolsos"
ON public.reembolsos
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

CREATE POLICY "Visualizadores veem reembolsos"
ON public.reembolsos
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'visualizador'));

-- Trigger para updated_at
CREATE TRIGGER update_reembolsos_updated_at
  BEFORE UPDATE ON public.reembolsos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar status 'em_andamento', 'pago' e 'reembolsado' como válidos
ALTER TABLE public.agendamentos 
DROP CONSTRAINT IF EXISTS agendamentos_status_check;

ALTER TABLE public.agendamentos 
ADD CONSTRAINT agendamentos_status_check 
CHECK (status = ANY (ARRAY[
  'pendente',
  'confirmado',
  'em_andamento',
  'concluido',
  'pago',
  'reembolsado',
  'cancelado'
]));

-- Função que processa reembolso automaticamente
CREATE OR REPLACE FUNCTION processar_reembolso()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'reembolsado'
  IF (NEW.status = 'reembolsado') AND 
     (OLD.status IS NULL OR OLD.status != 'reembolsado') THEN
    
    -- Verificar se existe pagamento
    IF EXISTS (
      SELECT 1 FROM pagamentos_agendamentos 
      WHERE agendamento_id = NEW.id AND status = 'pago'
    ) THEN
      -- Atualizar pagamento para status 'reembolsado'
      UPDATE pagamentos_agendamentos
      SET 
        status = 'reembolsado',
        observacoes = COALESCE(observacoes, '') || ' | REEMBOLSADO em ' || NOW()::DATE,
        updated_at = NOW()
      WHERE agendamento_id = NEW.id;
      
      -- Criar registro de reembolso (se não foi criado manualmente)
      IF NOT EXISTS (
        SELECT 1 FROM reembolsos WHERE agendamento_id = NEW.id
      ) THEN
        INSERT INTO reembolsos (
          agendamento_id,
          valor_reembolsado,
          motivo,
          data_reembolso,
          observacoes,
          processado_por
        ) VALUES (
          NEW.id,
          NEW.valor_total,
          'Reembolso automático via mudança de status',
          NOW(),
          'Processado automaticamente pela trigger',
          auth.uid()
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_processar_reembolso ON agendamentos;
CREATE TRIGGER trigger_processar_reembolso
  AFTER UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION processar_reembolso();