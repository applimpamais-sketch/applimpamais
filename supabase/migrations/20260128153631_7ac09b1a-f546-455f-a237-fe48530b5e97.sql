-- Função que processa a dedução do saldo quando saque é pago
CREATE OR REPLACE FUNCTION public.processar_saque_pago()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_saldo_atual numeric;
BEGIN
  -- Apenas processar quando status muda para 'pago'
  IF NEW.status = 'pago' AND OLD.status != 'pago' THEN
    
    -- Buscar saldo atual do parceiro com lock para evitar race conditions
    SELECT saldo_disponivel INTO v_saldo_atual
    FROM parceiros
    WHERE id = NEW.parceiro_id
    FOR UPDATE;
    
    -- Validar se tem saldo suficiente
    IF v_saldo_atual < NEW.valor THEN
      RAISE EXCEPTION 'Saldo insuficiente. Disponível: %, Solicitado: %', 
        v_saldo_atual, NEW.valor;
    END IF;
    
    -- Deduzir o valor do saldo disponível
    UPDATE parceiros
    SET 
      saldo_disponivel = saldo_disponivel - NEW.valor,
      updated_at = now()
    WHERE id = NEW.parceiro_id;
    
    RAISE LOG '[processar_saque_pago] Saque % processado. Valor: %, Parceiro: %', 
      NEW.id, NEW.valor, NEW.parceiro_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que dispara antes de atualizar parceiro_saques
DROP TRIGGER IF EXISTS trigger_processar_saque_pago ON parceiro_saques;
CREATE TRIGGER trigger_processar_saque_pago
  BEFORE UPDATE ON parceiro_saques
  FOR EACH ROW
  EXECUTE FUNCTION processar_saque_pago();