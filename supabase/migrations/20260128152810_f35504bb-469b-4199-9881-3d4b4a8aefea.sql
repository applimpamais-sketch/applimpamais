-- Atualizar função do trigger para aceitar tanto 'concluido' quanto 'pago'
CREATE OR REPLACE FUNCTION aprovar_comissao_parceiro()
RETURNS TRIGGER AS $$
DECLARE
  v_parceiro_id uuid;
  v_comissao numeric;
BEGIN
  -- Se o status mudou para 'concluido' OU 'pago' e tem parceiro_codigo
  IF NEW.status IN ('concluido', 'pago') 
     AND OLD.status NOT IN ('concluido', 'pago') 
     AND NEW.parceiro_codigo IS NOT NULL THEN
    
    -- Busca a conversão pendente para este agendamento
    SELECT pc.parceiro_id, pc.valor_comissao
    INTO v_parceiro_id, v_comissao
    FROM public.parceiro_conversoes pc
    WHERE pc.agendamento_id = NEW.id 
      AND pc.status = 'pendente'
    LIMIT 1;
    
    -- Se encontrou conversão pendente
    IF v_parceiro_id IS NOT NULL THEN
      -- Atualiza a conversão para aprovada
      UPDATE public.parceiro_conversoes
      SET 
        status = 'aprovada',
        aprovada_em = now()
      WHERE agendamento_id = NEW.id AND status = 'pendente';
      
      -- Atualiza o saldo do parceiro
      UPDATE public.parceiros
      SET 
        saldo_disponivel = saldo_disponivel + v_comissao,
        total_ganhos = total_ganhos + v_comissao,
        updated_at = now()
      WHERE id = v_parceiro_id;
      
      RAISE LOG 'Comissão aprovada: parceiro=%, valor=%', v_parceiro_id, v_comissao;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;