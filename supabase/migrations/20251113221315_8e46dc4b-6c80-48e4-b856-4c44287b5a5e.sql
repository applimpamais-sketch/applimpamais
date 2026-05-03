-- 1. Remover constraints antigas
ALTER TABLE despesas 
DROP CONSTRAINT IF EXISTS despesas_categoria_check;

ALTER TABLE despesas 
DROP CONSTRAINT IF EXISTS despesas_status_check;

ALTER TABLE despesas 
DROP CONSTRAINT IF EXISTS despesas_forma_pagamento_check;

-- 2. Migrar dados existentes
UPDATE despesas SET categoria = 'produtos_insumos' WHERE categoria = 'produtos';
UPDATE despesas SET categoria = 'fixas' WHERE categoria = 'aluguel';
UPDATE despesas SET forma_pagamento = 'cartao_credito' WHERE forma_pagamento = 'cartao';

-- 3. Adicionar constraints corretos

-- Constraint de categoria
ALTER TABLE despesas 
ADD CONSTRAINT despesas_categoria_check 
CHECK (categoria = ANY (ARRAY[
  'produtos_insumos',
  'equipamentos',
  'marketing',
  'salarios',
  'fixas',
  'combustivel',
  'impostos',
  'outras'
]));

-- Constraint de status
ALTER TABLE despesas 
ADD CONSTRAINT despesas_status_check 
CHECK (status = ANY (ARRAY['pendente', 'paga', 'vencida']));

-- Constraint de forma_pagamento
ALTER TABLE despesas 
ADD CONSTRAINT despesas_forma_pagamento_check 
CHECK (forma_pagamento IS NULL OR forma_pagamento = ANY (ARRAY[
  'dinheiro',
  'pix',
  'cartao_debito',
  'cartao_credito',
  'boleto',
  'transferencia',
  'outros'
]));