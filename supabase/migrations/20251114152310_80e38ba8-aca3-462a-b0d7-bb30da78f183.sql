-- =============================================
-- LIMPEZA COMPLETA DE DADOS DE TESTE
-- =============================================

-- 1. Desabilitar triggers temporariamente
SET session_replication_role = 'replica';

-- 2. LOGS E COMUNICAÇÕES
DELETE FROM public.webhook_logs;
DELETE FROM public.whatsapp_financeiro_log;
DELETE FROM public.comunicacoes;
DELETE FROM public.pixel_events;
DELETE FROM public.live_sessions;

-- 3. CARRINHOS ABANDONADOS
DELETE FROM public.carrinhos_abandonados;

-- 4. AGENDAMENTOS E RELACIONADOS (ordem importa por foreign keys)
DELETE FROM public.entregas_equipamentos;
DELETE FROM public.historico_atribuicoes;
DELETE FROM public.agendamentos_historico;
DELETE FROM public.historico_agendamentos;
DELETE FROM public.reembolsos;
DELETE FROM public.pagamentos_agendamentos;
DELETE FROM public.agendamentos;

-- 5. DESPESAS
DELETE FROM public.despesas;

-- 6. METAS FINANCEIRAS
DELETE FROM public.metas_financeiras;

-- 7. RESETAR CONTADORES DOS CUPONS
UPDATE public.cupons_desconto
SET uso_atual = 0
WHERE uso_atual > 0;

-- 8. Reabilitar triggers
SET session_replication_role = 'origin';