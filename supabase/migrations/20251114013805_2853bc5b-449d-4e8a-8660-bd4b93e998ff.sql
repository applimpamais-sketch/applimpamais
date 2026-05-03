-- Adicionar 'reembolsado' aos status válidos de pagamentos_agendamentos
-- Isso permite que a trigger processar_reembolso() atualize o status corretamente

-- Remover constraint antigo
ALTER TABLE public.pagamentos_agendamentos 
DROP CONSTRAINT IF EXISTS pagamentos_agendamentos_status_check;

-- Adicionar constraint atualizado incluindo 'reembolsado'
ALTER TABLE public.pagamentos_agendamentos 
ADD CONSTRAINT pagamentos_agendamentos_status_check 
CHECK (status = ANY (ARRAY['pendente'::text, 'parcial'::text, 'pago'::text, 'reembolsado'::text]));