-- Corrigir a view para não usar SECURITY DEFINER
DROP VIEW IF EXISTS public.vw_saas_dashboard;

CREATE VIEW public.vw_saas_dashboard 
WITH (security_invoker = true)
AS
SELECT
  COALESCE(SUM(CASE WHEN status = 'ativo' THEN valor_mensal ELSE 0 END), 0) as mrr,
  COUNT(*) FILTER (WHERE status = 'ativo') as clientes_ativos,
  COUNT(*) FILTER (WHERE status = 'trial') as clientes_trial,
  COUNT(*) FILTER (WHERE status = 'inadimplente') as clientes_inadimplentes,
  COUNT(*) FILTER (WHERE status = 'cancelado' AND cancelado_em >= date_trunc('month', CURRENT_DATE)) as churn_mes,
  COUNT(*) FILTER (WHERE status = 'trial' AND trial_termina_em <= CURRENT_DATE + INTERVAL '7 days') as trials_expirando,
  COALESCE(SUM(CASE WHEN status = 'ativo' AND plano = 'starter' THEN valor_mensal ELSE 0 END), 0) as mrr_starter,
  COALESCE(SUM(CASE WHEN status = 'ativo' AND plano = 'professional' THEN valor_mensal ELSE 0 END), 0) as mrr_professional,
  COALESCE(SUM(CASE WHEN status = 'ativo' AND plano = 'enterprise' THEN valor_mensal ELSE 0 END), 0) as mrr_enterprise,
  COUNT(*) as total_tenants
FROM public.saas_tenants;