-- ===============================================
-- SQL QUERIES PARA AUDITORIA CARRINHOS ABANDONADOS
-- Data: 2025-11-25
-- ===============================================

-- ============================================
-- SEÇÃO 1: QUERIES DE VALIDAÇÃO BÁSICA
-- ============================================

-- 1.1 Ver todos os carrinhos (últimos 20)
SELECT 
  id,
  session_id,
  nome_cliente,
  telefone,
  email,
  endereco,
  cidade,
  valor_total,
  etapa_abandonada,
  status,
  tentativas_contato,
  created_at,
  last_activity,
  ultima_tentativa_contato,
  percentual_preenchimento
FROM carrinhos_abandonados
ORDER BY created_at DESC
LIMIT 20;

-- 1.2 Contagem total por status
SELECT 
  status,
  COUNT(*) as quantidade,
  SUM(valor_total) as valor_total,
  AVG(valor_total) as ticket_medio
FROM carrinhos_abandonados
GROUP BY status
ORDER BY quantidade DESC;

-- 1.3 Carrinhos criados hoje
SELECT 
  id,
  nome_cliente,
  telefone,
  valor_total,
  status,
  created_at
FROM carrinhos_abandonados
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- ============================================
-- SEÇÃO 2: DIAGNÓSTICO DE PROBLEMAS
-- ============================================

-- 2.1 Carrinhos TRAVADOS (deveria ter sido contatado mas não foi)
-- ⚠️ Se retornar registros = BUG CONFIRMADO
SELECT 
  id,
  nome_cliente,
  telefone,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutos_desde_criacao,
  status,
  tentativas_contato,
  last_activity
FROM carrinhos_abandonados
WHERE status = 'abandonado'
  AND tentativas_contato = 0
  AND telefone IS NOT NULL
  AND created_at < NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- 2.2 Carrinhos sem telefone (normal não serem processados)
SELECT 
  COUNT(*) as total_sem_telefone,
  SUM(valor_total) as valor_perdido
FROM carrinhos_abandonados
WHERE telefone IS NULL
  AND created_at >= NOW() - INTERVAL '7 days';

-- 2.3 Carrinhos com múltiplas tentativas de contato
SELECT 
  id,
  nome_cliente,
  telefone,
  tentativas_contato,
  status,
  created_at,
  ultima_tentativa_contato
FROM carrinhos_abandonados
WHERE tentativas_contato > 1
ORDER BY tentativas_contato DESC, created_at DESC;

-- ============================================
-- SEÇÃO 3: MÉTRICAS DE NEGÓCIO
-- ============================================

-- 3.1 Taxa de recuperação (últimos 7 dias)
SELECT 
  COUNT(*) as total_carrinhos,
  COUNT(*) FILTER (WHERE status = 'abandonado') as abandonados,
  COUNT(*) FILTER (WHERE status = 'contatado') as contatados,
  COUNT(*) FILTER (WHERE status = 'recuperado') as recuperados,
  COUNT(*) FILTER (WHERE status = 'perdido') as perdidos,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'recuperado') / 
    NULLIF(COUNT(*), 0), 
    2
  ) as taxa_recuperacao_pct,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE tentativas_contato > 0) / 
    NULLIF(COUNT(*), 0), 
    2
  ) as taxa_contato_pct
FROM carrinhos_abandonados
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 3.2 Valor em risco por status
SELECT 
  status,
  COUNT(*) as quantidade,
  SUM(valor_total) as valor_total_bruto,
  SUM(valor_total - COALESCE(valor_desconto, 0)) as valor_liquido,
  AVG(valor_total) as ticket_medio,
  ROUND(AVG(percentual_preenchimento), 2) as preenchimento_medio
FROM carrinhos_abandonados
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY status
ORDER BY valor_liquido DESC;

-- 3.3 Evolução diária (últimos 7 dias)
SELECT 
  DATE_TRUNC('day', created_at)::date as dia,
  COUNT(*) as carrinhos_criados,
  COUNT(*) FILTER (WHERE tentativas_contato > 0) as contatos_enviados,
  COUNT(*) FILTER (WHERE status = 'recuperado') as recuperados,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'recuperado') / 
    NULLIF(COUNT(*), 0), 
    2
  ) as taxa_recuperacao_diaria,
  SUM(valor_total) as valor_total_dia
FROM carrinhos_abandonados
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY dia DESC;

-- ============================================
-- SEÇÃO 4: ANÁLISE DE ABANDONO
-- ============================================

-- 4.1 Distribuição por etapa de abandono
SELECT 
  etapa_abandonada,
  COUNT(*) as quantidade,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentual,
  AVG(valor_total) as ticket_medio,
  AVG(percentual_preenchimento) as preenchimento_medio
FROM carrinhos_abandonados
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY etapa_abandonada
ORDER BY quantidade DESC;

-- 4.2 Cidades com mais abandonos
SELECT 
  COALESCE(cidade, 'Não informado') as cidade,
  COUNT(*) as abandonos,
  SUM(valor_total) as valor_total,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'recuperado') / 
    NULLIF(COUNT(*), 0), 
    2
  ) as taxa_recuperacao_local
FROM carrinhos_abandonados
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY cidade
ORDER BY abandonos DESC
LIMIT 10;

-- 4.3 Análise de itens mais abandonados
-- ⚠️ Requer análise do JSON itens_carrinho
SELECT 
  id,
  nome_cliente,
  etapa_abandonada,
  jsonb_array_length(itens_carrinho) as qtd_itens,
  valor_total,
  status
FROM carrinhos_abandonados
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY qtd_itens DESC, valor_total DESC
LIMIT 20;

-- ============================================
-- SEÇÃO 5: TEMPO DE RESPOSTA E EFICÁCIA
-- ============================================

-- 5.1 Tempo médio até primeiro contato
SELECT 
  AVG(EXTRACT(EPOCH FROM (ultima_tentativa_contato - created_at))/60) as minutos_ate_contato,
  MIN(EXTRACT(EPOCH FROM (ultima_tentativa_contato - created_at))/60) as tempo_minimo,
  MAX(EXTRACT(EPOCH FROM (ultima_tentativa_contato - created_at))/60) as tempo_maximo
FROM carrinhos_abandonados
WHERE tentativas_contato > 0
  AND ultima_tentativa_contato IS NOT NULL
  AND created_at >= NOW() - INTERVAL '7 days';

-- 5.2 Carrinhos por horário de abandono (análise de pico)
SELECT 
  EXTRACT(HOUR FROM created_at) as hora,
  COUNT(*) as abandonos,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'recuperado') / 
    NULLIF(COUNT(*), 0), 
    2
  ) as taxa_recuperacao_por_hora
FROM carrinhos_abandonados
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hora;

-- 5.3 Efetividade por dia da semana
SELECT 
  TO_CHAR(created_at, 'Day') as dia_semana,
  EXTRACT(DOW FROM created_at) as dia_numero,
  COUNT(*) as abandonos,
  COUNT(*) FILTER (WHERE tentativas_contato > 0) as contatados,
  COUNT(*) FILTER (WHERE status = 'recuperado') as recuperados,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'recuperado') / 
    NULLIF(COUNT(*), 0), 
    2
  ) as taxa_recuperacao_semanal
FROM carrinhos_abandonados
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'Day'), EXTRACT(DOW FROM created_at)
ORDER BY dia_numero;

-- ============================================
-- SEÇÃO 6: VALIDAÇÃO DO TESTE MANUAL
-- ============================================

-- 6.1 Buscar carrinho de teste específico (trocar telefone)
SELECT 
  id,
  session_id,
  nome_cliente,
  telefone,
  status,
  valor_total,
  tentativas_contato,
  created_at,
  ultima_tentativa_contato,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutos_desde_criacao
FROM carrinhos_abandonados
WHERE telefone LIKE '%99999999%'  -- Trocar pelo telefone de teste
ORDER BY created_at DESC
LIMIT 5;

-- 6.2 Ver detalhes completos de um carrinho específico (trocar ID)
SELECT 
  *
FROM carrinhos_abandonados
WHERE id = 'ID_DO_CARRINHO_AQUI';  -- Substituir com ID real

-- 6.3 Histórico de sessão (rastrear jornada completa)
SELECT 
  session_id,
  nome_cliente,
  telefone,
  status,
  etapa_abandonada,
  created_at,
  last_activity,
  ultima_tentativa_contato,
  tentativas_contato
FROM carrinhos_abandonados
WHERE session_id = 'SESSION_ID_AQUI'  -- Substituir com session_id real
ORDER BY created_at DESC;

-- ============================================
-- SEÇÃO 7: LIMPEZA E MANUTENÇÃO
-- ============================================

-- 7.1 Ver carrinhos antigos (> 90 dias) - candidatos para limpeza
SELECT 
  COUNT(*) as total_antigos,
  SUM(valor_total) as valor_total
FROM carrinhos_abandonados
WHERE created_at < NOW() - INTERVAL '90 days';

-- 7.2 Ver carrinhos duplicados pela mesma sessão
SELECT 
  session_id,
  COUNT(*) as quantidade,
  array_agg(id ORDER BY created_at DESC) as ids,
  array_agg(status ORDER BY created_at DESC) as status_list
FROM carrinhos_abandonados
GROUP BY session_id
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 7.3 Estatísticas de storage (tamanho dos dados)
SELECT 
  COUNT(*) as total_registros,
  pg_size_pretty(pg_total_relation_size('carrinhos_abandonados')) as tamanho_tabela
FROM carrinhos_abandonados;

-- ============================================
-- SEÇÃO 8: LOGS E AUDITORIA
-- ============================================

-- 8.1 Ver comunicações relacionadas (tabela comunicacoes)
SELECT 
  c.id,
  c.created_at,
  c.tipo,
  c.status_entrega,
  c.carrinho_id,
  ca.nome_cliente,
  ca.telefone,
  ca.status as carrinho_status
FROM comunicacoes c
LEFT JOIN carrinhos_abandonados ca ON c.carrinho_id = ca.id
WHERE c.tipo = 'whatsapp_recuperacao'
ORDER BY c.created_at DESC
LIMIT 20;

-- 8.2 Ver logs de edge functions (requer permissão de admin)
-- ⚠️ Esta query pode não funcionar dependendo das permissões
SELECT 
  timestamp,
  event_message,
  level
FROM function_edge_logs
WHERE function_id LIKE '%abandoned%'
  OR function_id LIKE '%recovery%'
ORDER BY timestamp DESC
LIMIT 50;

-- ============================================
-- QUERIES ÚTEIS PARA COPIAR & COLAR RÁPIDO
-- ============================================

-- RÁPIDO: Ver últimos 5 carrinhos
SELECT id, nome_cliente, telefone, status, created_at 
FROM carrinhos_abandonados 
ORDER BY created_at DESC LIMIT 5;

-- RÁPIDO: Contar total de carrinhos
SELECT COUNT(*) FROM carrinhos_abandonados;

-- RÁPIDO: Ver carrinhos de hoje
SELECT id, nome_cliente, telefone, status, created_at 
FROM carrinhos_abandonados 
WHERE DATE(created_at) = CURRENT_DATE;

-- RÁPIDO: Ver carrinhos não contatados
SELECT id, nome_cliente, telefone, created_at 
FROM carrinhos_abandonados 
WHERE status = 'abandonado' AND tentativas_contato = 0;

-- RÁPIDO: Ver carrinhos recuperados
SELECT id, nome_cliente, telefone, valor_total, created_at 
FROM carrinhos_abandonados 
WHERE status = 'recuperado' 
ORDER BY created_at DESC 
LIMIT 10;
