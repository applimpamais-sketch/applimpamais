-- Adicionar 'tecnico' ao enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'tecnico';

-- Adicionar campos telefone em profiles se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='telefone') THEN
    ALTER TABLE profiles ADD COLUMN telefone TEXT;
  END IF;
END $$;

-- Garantir que os campos necessários existem na tabela agendamentos
-- (tecnico_id, data_atribuicao, atribuido_por já existem)

-- Garantir que a tabela historico_atribuicoes existe
-- (já existe conforme o schema)