-- Função que registra pagamento automaticamente quando status muda para 'concluido' ou 'pago'
CREATE OR REPLACE FUNCTION auto_registrar_pagamento()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'concluido' ou 'pago'
  IF (NEW.status IN ('concluido', 'pago')) AND 
     (OLD.status IS NULL OR OLD.status NOT IN ('concluido', 'pago')) THEN
    
    -- Verificar se já não existe um pagamento
    IF NOT EXISTS (
      SELECT 1 FROM pagamentos_agendamentos 
      WHERE agendamento_id = NEW.id
    ) THEN
      -- Criar registro de pagamento automático
      INSERT INTO pagamentos_agendamentos (
        agendamento_id,
        valor_pago,
        forma_pagamento,
        status,
        data_pagamento,
        observacoes
      ) VALUES (
        NEW.id,
        NEW.valor_total,
        COALESCE(NEW.forma_pagamento, 'nao_informado'),
        'pago',
        COALESCE(NEW.pago_em, NEW.concluido_em, NOW()),
        'Pagamento registrado automaticamente ao marcar como ' || NEW.status
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_auto_registrar_pagamento ON agendamentos;
CREATE TRIGGER trigger_auto_registrar_pagamento
  AFTER UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION auto_registrar_pagamento();

-- Sincronizar dados históricos: inserir pagamentos para agendamentos concluídos/pagos sem registro
INSERT INTO pagamentos_agendamentos (
  agendamento_id,
  valor_pago,
  forma_pagamento,
  status,
  data_pagamento,
  observacoes
)
SELECT 
  a.id,
  a.valor_total,
  COALESCE(a.forma_pagamento, 'nao_informado'),
  'pago',
  COALESCE(a.pago_em, a.concluido_em, a.created_at),
  'Pagamento registrado retroativamente'
FROM agendamentos a
LEFT JOIN pagamentos_agendamentos p ON p.agendamento_id = a.id
WHERE a.status IN ('concluido', 'pago')
  AND p.id IS NULL;