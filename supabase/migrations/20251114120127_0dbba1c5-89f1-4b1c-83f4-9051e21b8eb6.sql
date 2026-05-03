-- Habilitar Realtime para whatsapp_despesas_log
ALTER TABLE public.whatsapp_despesas_log REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_despesas_log;