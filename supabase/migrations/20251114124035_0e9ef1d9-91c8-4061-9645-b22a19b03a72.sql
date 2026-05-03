-- Remover políticas antigas da tabela original
DROP POLICY IF EXISTS "Admins e operadores gerenciam logs WhatsApp" ON whatsapp_despesas_log;
DROP POLICY IF EXISTS "Visualizadores veem logs WhatsApp" ON whatsapp_despesas_log;

-- Renomear tabela de despesas_log para financeiro_log
ALTER TABLE whatsapp_despesas_log RENAME TO whatsapp_financeiro_log;

-- Adicionar campo para identificar tipo (despesa ou receita)
ALTER TABLE whatsapp_financeiro_log 
ADD COLUMN IF NOT EXISTS tipo_lancamento text CHECK (tipo_lancamento IN ('despesa', 'receita'));

-- Renomear coluna despesa_id para lancamento_id (mais genérico)
ALTER TABLE whatsapp_financeiro_log 
RENAME COLUMN despesa_id TO lancamento_id;

-- Adicionar campo para identificar a tabela de origem
ALTER TABLE whatsapp_financeiro_log 
ADD COLUMN IF NOT EXISTS tabela_origem text CHECK (tabela_origem IN ('despesas', 'agendamentos'));

-- Atualizar registros existentes para tipo 'despesa' e tabela 'despesas'
UPDATE whatsapp_financeiro_log 
SET tipo_lancamento = 'despesa',
    tabela_origem = 'despesas'
WHERE lancamento_id IS NOT NULL;

-- Criar políticas RLS para a nova tabela
CREATE POLICY "Admins e operadores gerenciam logs WhatsApp" 
ON whatsapp_financeiro_log
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

CREATE POLICY "Visualizadores veem logs WhatsApp" 
ON whatsapp_financeiro_log
FOR SELECT
USING (has_role(auth.uid(), 'visualizador'::app_role));