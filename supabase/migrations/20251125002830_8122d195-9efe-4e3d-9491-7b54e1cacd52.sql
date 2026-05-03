-- ============================================================================
-- HOTFIX CRÍTICO #3: order_code (bypass de triggers durante migração)
-- ============================================================================

-- Adicionar coluna order_code (se não existir)
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS order_code TEXT;

-- Criar índice único
CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamentos_order_code 
ON agendamentos(order_code) 
WHERE order_code IS NULL;

-- BYPASS de triggers temporariamente para UPDATE massivo
DO $$
BEGIN
  -- Desabilitar triggers de usuário temporariamente
  SET session_replication_role = replica;
  
  -- Gerar códigos para registros existentes
  UPDATE agendamentos 
  SET order_code = 'LS-' || UPPER(SUBSTRING(MD5(id::text || created_at::text) FROM 1 FOR 6))
  WHERE order_code IS NULL;
  
  -- Reabilitar triggers
  SET session_replication_role = DEFAULT;
END $$;

-- Função para gerar order_code automaticamente em novos registros
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_code IS NULL THEN
    NEW.order_code := 'LS-' || UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text || RANDOM()::text) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para order_code em novos agendamentos
DROP TRIGGER IF EXISTS trigger_generate_order_code ON agendamentos;
CREATE TRIGGER trigger_generate_order_code
BEFORE INSERT ON agendamentos
FOR EACH ROW
EXECUTE FUNCTION generate_order_code();

-- Documentação
COMMENT ON COLUMN agendamentos.order_code IS 'Código único de pedido exibido ao cliente no checkout (formato: LS-XXXXXX)';