-- Correção #23: Tabela de idempotência para webhooks
CREATE TABLE IF NOT EXISTS whatsapp_mensagens_processadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  processado_em TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_processadas_message_id 
  ON whatsapp_mensagens_processadas(message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_processadas_processado_em 
  ON whatsapp_mensagens_processadas(processado_em);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_processadas_telefone 
  ON whatsapp_mensagens_processadas(telefone);

-- Função para auto-cleanup após 24h
CREATE OR REPLACE FUNCTION cleanup_mensagens_antigas()
RETURNS void AS $$
BEGIN
  DELETE FROM whatsapp_mensagens_processadas
  WHERE processado_em < NOW() - INTERVAL '24 hours';
  
  RAISE NOTICE 'Limpeza executada: removidas mensagens processadas com mais de 24h';
END;
$$ LANGUAGE plpgsql;

-- Agendar limpeza diária às 2h da manhã (apenas se pg_cron disponível)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-mensagens-processadas',
      '0 2 * * *',
      'SELECT cleanup_mensagens_antigas()'
    );
    RAISE NOTICE 'Limpeza automática agendada com sucesso';
  ELSE
    RAISE NOTICE 'pg_cron não disponível - limpeza manual necessária';
  END IF;
END $$;

-- RLS Policies (apenas admins podem ler logs de idempotência)
ALTER TABLE whatsapp_mensagens_processadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas service role pode gerenciar idempotência"
  ON whatsapp_mensagens_processadas
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE whatsapp_mensagens_processadas IS 'Registra message IDs processados para evitar duplicação de webhooks (TTL 24h)';
COMMENT ON COLUMN whatsapp_mensagens_processadas.message_id IS 'ID único da mensagem do webhook Ultramsg';
COMMENT ON COLUMN whatsapp_mensagens_processadas.telefone IS 'Número do cliente que enviou a mensagem';
COMMENT ON COLUMN whatsapp_mensagens_processadas.processado_em IS 'Timestamp de quando a mensagem foi processada';

-- Correção #21: Função para finalizar conversas órfãs automaticamente
CREATE OR REPLACE FUNCTION finalizar_conversas_orfas()
RETURNS INT AS $$
DECLARE
  conversas_finalizadas INT;
BEGIN
  WITH orfas AS (
    UPDATE whatsapp_conversas
    SET 
      finalizado = true,
      contexto = jsonb_set(
        COALESCE(contexto, '{}'::jsonb),
        '{erro}',
        '"timeout_auto_finalizado"'::jsonb
      )
    WHERE finalizado = false
      AND ultima_mensagem < NOW() - INTERVAL '10 minutes'
      AND estado_atual NOT IN ('inicial', 'finalizado')
    RETURNING id
  )
  SELECT COUNT(*) INTO conversas_finalizadas FROM orfas;
  
  IF conversas_finalizadas > 0 THEN
    RAISE NOTICE '✅ Auto-finalizadas % conversas órfãs (inativas >10min)', conversas_finalizadas;
  END IF;
  
  RETURN conversas_finalizadas;
END;
$$ LANGUAGE plpgsql;

-- Agendar finalização automática a cada 30 minutos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'finalizar-conversas-orfas',
      '*/30 * * * *',
      'SELECT finalizar_conversas_orfas()'
    );
    RAISE NOTICE 'Finalização automática de órfãs agendada com sucesso';
  ELSE
    RAISE NOTICE 'pg_cron não disponível - executar manualmente: SELECT finalizar_conversas_orfas()';
  END IF;
END $$;

COMMENT ON FUNCTION finalizar_conversas_orfas IS 'Finaliza automaticamente conversas inativas por mais de 10 minutos';
