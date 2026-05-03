-- Adicionar coluna valor_frete que está faltando na tabela carrinhos_abandonados
ALTER TABLE carrinhos_abandonados 
ADD COLUMN IF NOT EXISTS valor_frete numeric DEFAULT 0;