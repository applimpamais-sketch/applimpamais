-- Correção de warnings de segurança da migration anterior

-- 1. Adicionar search_path às funções (corrige WARN search_path_mutable)
CREATE OR REPLACE FUNCTION cleanup_mensagens_antigas()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM whatsapp_mensagens_processadas
  WHERE processado_em < NOW() - INTERVAL '24 hours';
  
  RAISE NOTICE 'Limpeza executada: removidas mensagens processadas com mais de 24h';
END;
$$;

CREATE OR REPLACE FUNCTION finalizar_conversas_orfas()
RETURNS INT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 2. Garantir RLS está habilitado (já foi feito na migration anterior, mas confirmando)
ALTER TABLE whatsapp_mensagens_processadas ENABLE ROW LEVEL SECURITY;

-- 3. Adicionar comentários de auditoria
COMMENT ON FUNCTION cleanup_mensagens_antigas IS 'Função de manutenção: remove mensagens processadas com mais de 24h (TTL automático)';
COMMENT ON FUNCTION finalizar_conversas_orfas IS 'Função de manutenção: finaliza conversas inativas por mais de 10 minutos automaticamente';
