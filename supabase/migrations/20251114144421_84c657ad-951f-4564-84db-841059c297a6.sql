-- Limpar logs antigos em status 'processando'
-- Isso remove apenas os logs que ficaram presos e não foram processados corretamente
DELETE FROM whatsapp_financeiro_log 
WHERE processamento_status = 'processando';