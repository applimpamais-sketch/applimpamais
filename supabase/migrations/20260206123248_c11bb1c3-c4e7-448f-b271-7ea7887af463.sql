-- Corrigir views para usar SECURITY INVOKER (padrão seguro)
-- Recriar as views com configuração explícita

DROP VIEW IF EXISTS public.vw_finance_summary;
DROP VIEW IF EXISTS public.vw_cashflow_daily;
DROP VIEW IF EXISTS public.vw_receipts_by_method;
DROP VIEW IF EXISTS public.vw_expenses_by_category;

-- View: Resumo financeiro por período (SECURITY INVOKER - respeita RLS do usuário)
CREATE VIEW public.vw_finance_summary 
WITH (security_invoker = true) AS
SELECT
  data_movimentacao AS data,
  SUM(CASE WHEN tipo = 'IN' AND status = 'confirmado' THEN valor ELSE 0 END) AS receita_realizada,
  SUM(CASE WHEN tipo = 'OUT' AND status = 'confirmado' AND origem = 'despesa' THEN valor ELSE 0 END) AS despesas_pagas,
  SUM(CASE WHEN tipo = 'OUT' AND status = 'confirmado' AND origem = 'reembolso' THEN valor ELSE 0 END) AS reembolsos,
  SUM(CASE 
    WHEN tipo = 'IN' AND status = 'confirmado' THEN valor 
    WHEN tipo = 'OUT' AND status = 'confirmado' THEN -valor 
    ELSE 0 
  END) AS saldo_dia
FROM public.ledger_entries
GROUP BY data_movimentacao;

-- View: Fluxo de caixa diário com saldo acumulado
CREATE VIEW public.vw_cashflow_daily
WITH (security_invoker = true) AS
WITH daily_summary AS (
  SELECT
    data_movimentacao AS data,
    SUM(CASE WHEN tipo = 'IN' AND status = 'confirmado' THEN valor ELSE 0 END) AS entradas,
    SUM(CASE WHEN tipo = 'OUT' AND status = 'confirmado' THEN valor ELSE 0 END) AS saidas
  FROM public.ledger_entries
  GROUP BY data_movimentacao
)
SELECT
  data,
  entradas,
  saidas,
  (entradas - saidas) AS saldo,
  SUM(entradas - saidas) OVER (ORDER BY data) AS saldo_acumulado
FROM daily_summary
ORDER BY data;

-- View: Receitas por forma de pagamento
CREATE VIEW public.vw_receipts_by_method
WITH (security_invoker = true) AS
SELECT
  COALESCE(forma_pagamento, 'Não informado') AS forma,
  SUM(valor) AS total,
  COUNT(*) AS quantidade
FROM public.ledger_entries
WHERE tipo = 'IN' AND status = 'confirmado'
GROUP BY forma_pagamento;

-- View: Despesas por categoria
CREATE VIEW public.vw_expenses_by_category
WITH (security_invoker = true) AS
SELECT
  categoria,
  SUM(valor) AS total,
  COUNT(*) AS quantidade
FROM public.ledger_entries
WHERE tipo = 'OUT' AND status = 'confirmado' AND origem = 'despesa'
GROUP BY categoria;