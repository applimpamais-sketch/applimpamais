-- ROLLBACK SCRIPT - Bot WhatsApp RC Limpa Mais
-- Usar APENAS em caso de falha crítica detectada em staging/produção
-- Data de criação: 2024-12-24

-- =====================================================
-- CENÁRIO 1: LOOP INFINITO MASSIVO DETECTADO
-- =====================================================
-- Finalizar todas as conversas ativas com mais de 10 mensagens em 2 minutos

BEGIN;

-- Backup das conversas afetadas antes de finalizar
CREATE TEMP TABLE conversas_loop_backup AS
SELECT 
  c.*,
  COUNT(m.id) as total_mensagens
FROM whatsapp_conversas c
JOIN whatsapp_mensagens m ON m.conversa_id = c.id
WHERE 
  c.finalizado = false
  AND m.criado_em >= NOW() - INTERVAL '2 minutes'
GROUP BY c.id
HAVING COUNT(m.id) > 10;

-- Finalizar conversas em loop
UPDATE whatsapp_conversas
SET 
  finalizado = true,
  contexto = jsonb_set(
    COALESCE(contexto, '{}'::jsonb),
    '{rollback_reason}',
    '"Loop infinito detectado - conversa finalizada automaticamente por segurança"'::jsonb
  ),
  contexto = jsonb_set(
    contexto,
    '{rollback_timestamp}',
    to_jsonb(NOW()::text)
  )
WHERE id IN (SELECT id FROM conversas_loop_backup);

-- Log de quantas conversas foram finalizadas
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected_count FROM conversas_loop_backup;
  RAISE NOTICE 'Rollback Cenário 1: % conversas finalizadas devido a loop infinito', affected_count;
END $$;

COMMIT;

-- =====================================================
-- CENÁRIO 2: CONVERSAS TRAVADAS EM ESTADOS CRÍTICOS
-- =====================================================
-- Resetar conversas travadas há mais de 30 minutos

BEGIN;

-- Backup das conversas travadas
CREATE TEMP TABLE conversas_travadas_backup AS
SELECT *
FROM whatsapp_conversas
WHERE 
  finalizado = false 
  AND ultima_mensagem < NOW() - INTERVAL '30 minutes'
  AND estado_atual IN (
    'identificando_item',
    'coletando_tamanho_sofa',
    'coletando_opcao_item',
    'apresentando_orcamento',
    'explicando_servico'
  );

-- Resetar conversas para estado inicial
UPDATE whatsapp_conversas
SET 
  estado_atual = 'inicial',
  contexto = jsonb_set(
    COALESCE(contexto, '{}'::jsonb),
    '{rollback_reason}',
    '"Conversa travada resetada para estado inicial"'::jsonb
  ),
  contexto = jsonb_set(
    contexto,
    '{rollback_timestamp}',
    to_jsonb(NOW()::text)
  )
WHERE id IN (SELECT id FROM conversas_travadas_backup);

-- Log
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected_count FROM conversas_travadas_backup;
  RAISE NOTICE 'Rollback Cenário 2: % conversas resetadas para estado inicial', affected_count;
END $$;

COMMIT;

-- =====================================================
-- CENÁRIO 3: ROLLBACK TOTAL - DESATIVAR BOT
-- =====================================================
-- Criar flag global para desativar bot temporariamente

BEGIN;

-- Criar tabela de flags se não existir
CREATE TABLE IF NOT EXISTS bot_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT UNIQUE NOT NULL,
  flag_value BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Inserir ou atualizar flag de desativação
INSERT INTO bot_flags (flag_name, flag_value, updated_by)
VALUES ('bot_whatsapp_ativo', false, 'ROLLBACK_SCRIPT')
ON CONFLICT (flag_name) 
DO UPDATE SET 
  flag_value = false,
  updated_at = NOW(),
  updated_by = 'ROLLBACK_SCRIPT';

-- Finalizar TODAS as conversas ativas
UPDATE whatsapp_conversas
SET 
  finalizado = true,
  contexto = jsonb_set(
    COALESCE(contexto, '{}'::jsonb),
    '{rollback_reason}',
    '"Bot desativado para manutenção emergencial"'::jsonb
  ),
  contexto = jsonb_set(
    contexto,
    '{rollback_timestamp}',
    to_jsonb(NOW()::text)
  )
WHERE finalizado = false;

RAISE NOTICE 'Rollback Cenário 3: Bot completamente desativado. Todas as conversas finalizadas.';

COMMIT;

-- =====================================================
-- CENÁRIO 4: REATIVAR BOT (após correções)
-- =====================================================

BEGIN;

-- Reativar bot
UPDATE bot_flags
SET 
  flag_value = true,
  updated_at = NOW(),
  updated_by = 'REATIVACAO_MANUAL'
WHERE flag_name = 'bot_whatsapp_ativo';

RAISE NOTICE 'Bot WhatsApp reativado com sucesso.';

COMMIT;

-- =====================================================
-- QUERIES DE VERIFICAÇÃO PÓS-ROLLBACK
-- =====================================================

-- Verificar status do bot
SELECT * FROM bot_flags WHERE flag_name = 'bot_whatsapp_ativo';

-- Conversas finalizadas por rollback (últimas 24h)
SELECT 
  COUNT(*) as total_rollbacks,
  contexto->>'rollback_reason' as motivo
FROM whatsapp_conversas
WHERE 
  contexto->>'rollback_reason' IS NOT NULL
  AND criado_em >= NOW() - INTERVAL '24 hours'
GROUP BY contexto->>'rollback_reason';

-- Conversas ativas restantes
SELECT 
  COUNT(*) as conversas_ativas,
  estado_atual,
  MAX(ultima_mensagem) as ultima_atividade
FROM whatsapp_conversas
WHERE finalizado = false
GROUP BY estado_atual;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
/*
COMO USAR ESTE SCRIPT:

1. CENÁRIO 1 (Loop Infinito):
   - Executar apenas o bloco "CENÁRIO 1"
   - Verificar conversas_loop_backup antes de finalizar
   - Executar queries de verificação

2. CENÁRIO 2 (Conversas Travadas):
   - Executar apenas o bloco "CENÁRIO 2"
   - Verificar conversas_travadas_backup antes de resetar
   - Executar queries de verificação

3. CENÁRIO 3 (Desativar Bot Completamente):
   - Executar bloco "CENÁRIO 3"
   - Aplicar correções no código
   - Testar em ambiente de desenvolvimento
   - Executar CENÁRIO 4 para reativar

4. CENÁRIO 4 (Reativar Bot):
   - Executar apenas após correções aplicadas e testadas
   - Monitorar intensamente primeiras 2 horas
   - Ter este script pronto para novo rollback se necessário

IMPORTANTE:
- Sempre fazer backup manual antes de executar rollback
- Documentar no Slack/Notion o motivo do rollback
- Executar queries de verificação após cada rollback
- Monitorar por pelo menos 1 hora após reativação
*/
