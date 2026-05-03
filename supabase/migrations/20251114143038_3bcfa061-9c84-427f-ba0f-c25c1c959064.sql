-- Remover constraint antigo que impede 'aguardando_confirmacao'
ALTER TABLE whatsapp_financeiro_log 
DROP CONSTRAINT IF EXISTS whatsapp_despesas_log_processamento_status_check;

-- Criar constraint atualizado com TODOS os status usados no código
ALTER TABLE whatsapp_financeiro_log 
ADD CONSTRAINT whatsapp_financeiro_log_processamento_status_check 
CHECK (processamento_status IN (
  'processando',
  'sucesso',
  'erro',
  'aguardando_confirmacao',
  'confianca_baixa',
  'cancelado',
  'nao_autorizado'
));