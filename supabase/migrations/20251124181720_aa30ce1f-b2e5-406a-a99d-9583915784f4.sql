-- ============================================================
-- SCRIPT DE LIMPEZA DE CONVERSAS TRAVADAS POR LOOP INFINITO
-- Executar APÓS correção do bug do BOT_NUMBER
-- ============================================================

-- 1. Finalizar conversas do bot consigo mesmo (telefone = número do bot)
UPDATE whatsapp_conversas
SET 
  finalizado = true,
  contexto = jsonb_set(
    COALESCE(contexto, '{}'::jsonb),
    '{erro}',
    '"Loop infinito - bot processando próprias mensagens (bug corrigido)"'::jsonb
  )
WHERE telefone IN ('553194103135@c.us', '5531994103135@c.us', '+553194103135@c.us')
  AND finalizado = false;

-- 2. Finalizar conversas com loops evidentes (>100 mensagens em qualquer conversa)
UPDATE whatsapp_conversas c
SET 
  finalizado = true,
  contexto = jsonb_set(
    COALESCE(c.contexto, '{}'::jsonb),
    '{erro}',
    ('"Loop infinito detectado - ' || (SELECT COUNT(*) FROM whatsapp_mensagens WHERE conversa_id = c.id)::text || ' mensagens totais"')::jsonb
  )
WHERE c.finalizado = false
  AND (
    SELECT COUNT(*) 
    FROM whatsapp_mensagens m 
    WHERE m.conversa_id = c.id
  ) > 100;