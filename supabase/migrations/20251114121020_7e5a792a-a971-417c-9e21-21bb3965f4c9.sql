-- Adicionar campos origem e categoria_receita na tabela agendamentos
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS origem text DEFAULT 'site'::text,
ADD COLUMN IF NOT EXISTS categoria_receita text DEFAULT 'servicos_limpeza'::text;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_origem ON agendamentos(origem);
CREATE INDEX IF NOT EXISTS idx_agendamentos_categoria_receita ON agendamentos(categoria_receita);

-- Atualizar agendamentos existentes para definir origem baseado na presença de campos
UPDATE agendamentos 
SET origem = 'site' 
WHERE origem IS NULL;

-- Atualizar categoria_receita baseado nos itens do carrinho
UPDATE agendamentos 
SET categoria_receita = CASE
  WHEN itens_carrinho::text ILIKE '%aluguel%' THEN 'aluguel_equipamentos'
  WHEN itens_carrinho::text ILIKE '%impermeabilização%' OR itens_carrinho::text ILIKE '%impermeabilizacao%' THEN 'servicos_impermeabilizacao'
  ELSE 'servicos_limpeza'
END
WHERE categoria_receita = 'servicos_limpeza';