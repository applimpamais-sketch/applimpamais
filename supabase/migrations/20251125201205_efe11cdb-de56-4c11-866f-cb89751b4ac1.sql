-- Corrigir a trigger auto_registrar_pagamento para aceitar NULL
-- ao invés de 'nao_informado' que viola o CHECK constraint

CREATE OR REPLACE FUNCTION public.auto_registrar_pagamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Se o status mudou para 'concluido' ou 'pago'
  IF (NEW.status IN ('concluido', 'pago')) AND 
     (OLD.status IS NULL OR OLD.status NOT IN ('concluido', 'pago')) THEN
    
    -- Verificar se já não existe um pagamento
    IF NOT EXISTS (
      SELECT 1 FROM pagamentos_agendamentos 
      WHERE agendamento_id = NEW.id
    ) THEN
      -- Criar registro de pagamento
      -- CORREÇÃO: Usar NEW.forma_pagamento diretamente (pode ser NULL)
      -- ao invés de COALESCE(..., 'nao_informado') que violava o constraint
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
        NEW.forma_pagamento,  -- Permite NULL (sem COALESCE)
        CASE 
          WHEN NEW.forma_pagamento IS NOT NULL THEN 'pago'
          ELSE 'pendente'
        END,
        COALESCE(NEW.pago_em, NEW.concluido_em, NOW()),
        CASE 
          WHEN NEW.forma_pagamento IS NULL 
          THEN 'Aguardando confirmação da forma de pagamento'
          ELSE 'Pagamento registrado automaticamente ao marcar como ' || NEW.status
        END
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;