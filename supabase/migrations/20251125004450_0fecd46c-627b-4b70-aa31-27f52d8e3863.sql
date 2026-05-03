-- Correção do search_path na função increment_cupom_uso (security linter warning)
CREATE OR REPLACE FUNCTION increment_cupom_uso(cupom_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cupons_desconto
  SET uso_atual = uso_atual + 1
  WHERE id = cupom_id
    AND status = 'ativo'
    AND (uso_maximo IS NULL OR uso_atual < uso_maximo);
END;
$$;