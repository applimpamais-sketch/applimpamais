-- ============================================================================
-- QUERIES SQL DE INVESTIGAÇÃO - BOT WHATSAPP LOOP "NÃO PEGUEI"
-- ============================================================================
-- Referência: user-uploads://image-205.png
-- Criado: 2025-11-25
-- Objetivo: Detectar loops de fallback, conversas presas, perda de contexto

-- ============================================================================
-- QUERY #1: Detectar conversas com loop "não peguei" (últimas 24h)
-- ============================================================================
-- Identifica conversas onde bot enviou 3+ mensagens de erro consecutivas
-- Usar para: Confirmar que bug foi reproduzido ou corrigido

SELECT 
  wc.id AS conversa_id,
  wc.telefone,
  wc.estado_atual,
  wc.criado_em,
  wc.ultima_mensagem,
  COUNT(wm.id) AS total_mensagens,
  COUNT(*) FILTER (
    WHERE wm.direcao = 'saida' 
    AND (
      wm.conteudo LIKE '%não consegui entender%' OR
      wm.conteudo LIKE '%bugou minha cabeça%' OR
      wm.conteudo LIKE '%não peguei%' OR
      wm.conteudo LIKE '%tenta de novo%'
    )
  ) AS erros_fallback,
  ROUND(
    100.0 * COUNT(*) FILTER (
      WHERE wm.direcao = 'saida' 
      AND (wm.conteudo LIKE '%não consegui entender%' OR wm.conteudo LIKE '%bugou%')
    ) / NULLIF(COUNT(*) FILTER (WHERE wm.direcao = 'saida'), 0),
    2
  ) AS taxa_erro_pct,
  wc.contexto->'erros_consecutivos' AS erros_consecutivos_ctx,
  wc.contexto->'itens_informados' AS itens_pendentes
FROM whatsapp_conversas wc
JOIN whatsapp_mensagens wm ON wm.conversa_id = wc.id
WHERE wc.finalizado = false
  AND wc.criado_em > NOW() - INTERVAL '24 hours'
GROUP BY wc.id
HAVING COUNT(*) FILTER (
  WHERE wm.direcao = 'saida' 
  AND (wm.conteudo LIKE '%não consegui entender%' OR wm.conteudo LIKE '%bugou%')
) >= 3
ORDER BY erros_fallback DESC, wc.ultima_mensagem DESC
LIMIT 50;

-- Resultado esperado ANTES do hotfix: 
--   - 1+ conversas com 3+ erros_fallback
-- Resultado esperado DEPOIS do hotfix: 
--   - 0 conversas (ou < 1% das conversas ativas)


-- ============================================================================
-- QUERY #2: Detectar conversas presas em estado identificando_item (>5min)
-- ============================================================================
-- Identifica conversas que ficaram presas tentando identificar item

SELECT 
  id,
  telefone,
  estado_atual,
  criado_em,
  ultima_mensagem,
  EXTRACT(EPOCH FROM (NOW() - ultima_mensagem))/60 AS minutos_inativo,
  contexto->'itens_informados' AS itens_detectados,
  contexto->'texto_item_mencionado' AS item_mencionado,
  contexto->'erros_consecutivos' AS erros_consecutivos,
  (SELECT COUNT(*) FROM whatsapp_mensagens wm 
   WHERE wm.conversa_id = whatsapp_conversas.id 
   AND wm.criado_em > NOW() - INTERVAL '10 minutes') AS mensagens_recentes
FROM whatsapp_conversas
WHERE finalizado = false
  AND estado_atual = 'identificando_item'
  AND ultima_mensagem < NOW() - INTERVAL '5 minutes'
  AND criado_em > NOW() - INTERVAL '24 hours'
ORDER BY minutos_inativo DESC
LIMIT 50;

-- Resultado esperado: 
--   - Conversas com minutos_inativo > 5 devem ter itens_detectados preenchidos
--   - Se itens_detectados está null e há 5+ mensagens, indica perda de contexto


-- ============================================================================
-- QUERY #3: Analisar última conversa de telefone específico (debugging)
-- ============================================================================
-- Substitua '5531999999999' pelo telefone do teste

WITH ultima_conversa AS (
  SELECT id, telefone, estado_atual, contexto, criado_em, ultima_mensagem
  FROM whatsapp_conversas
  WHERE telefone = '5531999999999'  -- ← SUBSTITUIR AQUI
  ORDER BY criado_em DESC
  LIMIT 1
)
SELECT 
  wm.id AS mensagem_id,
  wm.direcao,
  LEFT(wm.conteudo, 100) AS conteudo_preview,
  wm.criado_em,
  wm.tipo,
  uc.estado_atual AS estado_conversa,
  uc.contexto
FROM ultima_conversa uc
JOIN whatsapp_mensagens wm ON wm.conversa_id = uc.id
ORDER BY wm.criado_em ASC;

-- Resultado esperado (sequência do bug):
-- 1. entrada: "limpeza"    → saida: "Anotado! ✅ limpeza então"
-- 2. entrada: "contagem"   → saida: "Entendi! ✅ Atendemos aí sim" (APÓS hotfix #3)
-- 3. entrada: "sofá"       → saida: "Qual o modelo do seu sofá? 🛋️" (APÓS hotfix #1+#2)
-- NÃO DEVE ter: "não consegui entender" ou "bugou minha cabeça"


-- ============================================================================
-- QUERY #4: Taxa de reconhecimento de itens por tipo (últimos 7 dias)
-- ============================================================================
-- Mede eficácia da detecção de itens (sofá, colchão, etc.)

WITH mensagens_usuarios AS (
  SELECT 
    wm.conversa_id,
    wm.conteudo,
    wm.criado_em,
    wc.estado_atual,
    wc.contexto
  FROM whatsapp_mensagens wm
  JOIN whatsapp_conversas wc ON wc.id = wm.conversa_id
  WHERE wm.direcao = 'entrada'
    AND wc.estado_atual = 'identificando_item'
    AND wm.criado_em > NOW() - INTERVAL '7 days'
),
itens_mencionados AS (
  SELECT 
    conversa_id,
    conteudo,
    CASE 
      WHEN conteudo ~* '\bsof[aá]\b' THEN 'Sofá'
      WHEN conteudo ~* '\bcolch[aã]o\b' THEN 'Colchão'
      WHEN conteudo ~* '\bpoltrona\b' THEN 'Poltrona'
      WHEN conteudo ~* '\btapete\b' THEN 'Tapete'
      WHEN conteudo ~* '\bbanco\b' THEN 'Banco Automotivo'
      ELSE 'Outro'
    END AS item_detectado,
    contexto->'subcategoria' AS subcategoria_salva
  FROM mensagens_usuarios
)
SELECT 
  item_detectado,
  COUNT(*) AS total_mencoes,
  COUNT(*) FILTER (WHERE subcategoria_salva IS NOT NULL) AS reconhecidos,
  COUNT(*) FILTER (WHERE subcategoria_salva IS NULL) AS nao_reconhecidos,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE subcategoria_salva IS NOT NULL) / COUNT(*),
    2
  ) AS taxa_reconhecimento_pct
FROM itens_mencionados
WHERE item_detectado != 'Outro'
GROUP BY item_detectado
ORDER BY total_mencoes DESC;

-- Resultado esperado ANTES do hotfix:
--   - Sofá: taxa_reconhecimento_pct ~30-50% (baixo!)
-- Resultado esperado DEPOIS do hotfix:
--   - Sofá: taxa_reconhecimento_pct >90%


-- ============================================================================
-- QUERY #5: Conversas que transicionaram de verificando_cidade → identificando_item
-- ============================================================================
-- Verifica se transição cidade→item está funcionando

WITH transicoes AS (
  SELECT 
    wc.id,
    wc.telefone,
    wc.estado_atual,
    wc.criado_em,
    LAG(wc.estado_atual) OVER (PARTITION BY wc.id ORDER BY wc.updated_at) AS estado_anterior,
    wc.contexto->'cidade' AS cidade_salva,
    wc.contexto->'itens_informados' AS itens_detectados
  FROM whatsapp_conversas wc
  WHERE wc.criado_em > NOW() - INTERVAL '24 hours'
)
SELECT 
  id,
  telefone,
  estado_anterior,
  estado_atual,
  cidade_salva,
  itens_detectados,
  CASE 
    WHEN cidade_salva IS NULL AND itens_detectados IS NOT NULL 
    THEN '✅ Usuário pulou cidade e foi direto para item'
    WHEN cidade_salva IS NOT NULL 
    THEN '✅ Cidade detectada normalmente'
    ELSE '❌ Problema: sem cidade e sem itens'
  END AS diagnostico
FROM transicoes
WHERE estado_anterior = 'verificando_cidade'
  AND estado_atual = 'identificando_item'
ORDER BY id DESC
LIMIT 50;


-- ============================================================================
-- QUERY #6: Contenção manual de conversas em loop (EMERGÊNCIA)
-- ============================================================================
-- Usar apenas se detectar loop massivo em produção
-- ATENÇÃO: Isto finaliza conversas forçadamente!

-- PASSO 1: Verificar quantas conversas serão afetadas
SELECT COUNT(*)
FROM whatsapp_conversas
WHERE finalizado = false
  AND estado_atual = 'identificando_item'
  AND ultima_mensagem < NOW() - INTERVAL '10 minutes';

-- PASSO 2: Se número acima for razoável, executar contenção
-- DESCOMENTAR APENAS SE NECESSÁRIO:
/*
UPDATE whatsapp_conversas
SET 
  finalizado = true,
  contexto = jsonb_set(
    COALESCE(contexto, '{}'::jsonb),
    '{erro}',
    '"contencao_manual_loop"'::jsonb
  )
WHERE finalizado = false
  AND estado_atual = 'identificando_item'
  AND ultima_mensagem < NOW() - INTERVAL '10 minutes';
*/


-- ============================================================================
-- QUERY #7: Análise de cidades não reconhecidas (detectar typos comuns)
-- ============================================================================

SELECT 
  wm.conteudo AS texto_usuario,
  COUNT(*) AS frequencia,
  ARRAY_AGG(DISTINCT wc.telefone) AS telefones_afetados
FROM whatsapp_mensagens wm
JOIN whatsapp_conversas wc ON wc.id = wm.conversa_id
WHERE wc.estado_atual = 'verificando_cidade'
  AND wm.direcao = 'entrada'
  AND wm.criado_em > NOW() - INTERVAL '7 days'
  -- Filtrar apenas cidades que receberam erro
  AND EXISTS (
    SELECT 1 FROM whatsapp_mensagens wm2
    WHERE wm2.conversa_id = wm.conversa_id
      AND wm2.direcao = 'saida'
      AND wm2.conteudo LIKE '%não atendemos nessa região%'
      AND wm2.criado_em > wm.criado_em
    LIMIT 1
  )
GROUP BY wm.conteudo
ORDER BY frequencia DESC
LIMIT 20;

-- Resultado esperado:
--   - Se aparecer "contagem" (minúsculo), confirma bug ISSUE-003
--   - Após hotfix, essa query deve retornar 0 linhas para "contagem"


-- ============================================================================
-- FIM DAS QUERIES
-- ============================================================================
-- Para executar estas queries:
--   1. Conectar ao banco: psql $DATABASE_URL
--   2. Copiar/colar a query desejada
--   3. Analisar resultados conforme comentários "Resultado esperado"
