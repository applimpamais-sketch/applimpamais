-- ============================================================
-- TRIGGER DE DETECÇÃO AUTOMÁTICA DE LOOP EM TEMPO REAL
-- Finaliza automaticamente conversas que entram em loop
-- ============================================================

-- Função que detecta e interrompe loops
CREATE OR REPLACE FUNCTION detectar_loop_whatsapp()
RETURNS trigger AS $$
DECLARE
  mensagens_recentes integer;
  total_mensagens integer;
BEGIN
  -- Contar mensagens nos últimos 2 minutos
  SELECT COUNT(*) INTO mensagens_recentes
  FROM whatsapp_mensagens
  WHERE conversa_id = NEW.conversa_id
    AND criado_em > NOW() - INTERVAL '2 minutes';
  
  -- Contar total de mensagens na conversa
  SELECT COUNT(*) INTO total_mensagens
  FROM whatsapp_mensagens
  WHERE conversa_id = NEW.conversa_id;
  
  -- Se detectar loop (>10 mensagens em 2 min OU >100 mensagens total)
  IF mensagens_recentes > 10 OR total_mensagens > 100 THEN
    -- Finalizar conversa automaticamente
    UPDATE whatsapp_conversas
    SET 
      finalizado = true,
      contexto = jsonb_set(
        COALESCE(contexto, '{}'::jsonb),
        '{erro}',
        jsonb_build_object(
          'tipo', 'loop_detectado_automaticamente',
          'mensagens_2min', mensagens_recentes,
          'mensagens_total', total_mensagens,
          'timestamp', NOW()::text
        )::jsonb
      )
    WHERE id = NEW.conversa_id
      AND finalizado = false;
    
    -- Logar alerta crítico
    RAISE WARNING '[LOOP DETECTADO] Conversa % finalizada automaticamente. Mensagens 2min: %, Total: %',
      NEW.conversa_id, mensagens_recentes, total_mensagens;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger (executar APÓS cada insert em whatsapp_mensagens)
DROP TRIGGER IF EXISTS trigger_detectar_loop ON whatsapp_mensagens;

CREATE TRIGGER trigger_detectar_loop
  AFTER INSERT ON whatsapp_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION detectar_loop_whatsapp();

-- Comentários explicativos
COMMENT ON FUNCTION detectar_loop_whatsapp() IS 
'Detecta loops infinitos em conversas WhatsApp: >10 msgs em 2 min OU >100 msgs total. Finaliza automaticamente e registra erro no contexto.';

COMMENT ON TRIGGER trigger_detectar_loop ON whatsapp_mensagens IS
'Executa detectar_loop_whatsapp() após cada nova mensagem inserida. Previne loops que travam o sistema.';