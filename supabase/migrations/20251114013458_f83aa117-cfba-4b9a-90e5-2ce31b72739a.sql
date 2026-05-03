-- Corrigir função trigger para permitir INSERT em reembolsos
-- A função usa SECURITY DEFINER com set search_path para segurança
-- O INSERT agora funciona porque a função roda com privilégios elevados
-- Isso é seguro porque:
-- 1. Apenas admins/operadores podem mudar status para 'reembolsado' (RLS em agendamentos)
-- 2. A trigger valida todas as condições antes de inserir
-- 3. O campo processado_por ainda captura auth.uid()

CREATE OR REPLACE FUNCTION public.processar_reembolso()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        -- INSERT com privilégios elevados (SECURITY DEFINER permite bypassar RLS)
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
$$;