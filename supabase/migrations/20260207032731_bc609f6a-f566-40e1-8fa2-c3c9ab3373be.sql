-- =====================================================
-- FASE 5: TRIGGERS AUTO_SET_TENANT_ID
-- =====================================================

-- Atualizar a função auto_set_tenant_id para ser mais robusta
CREATE OR REPLACE FUNCTION public.auto_set_tenant_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Se já tem tenant_id, não altera
  IF NEW.tenant_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Buscar tenant_id do usuário que está inserindo
  v_tenant_id := get_user_tenant_id();
  
  -- Se não encontrou tenant e não é super_admin, usar tenant master
  IF v_tenant_id IS NULL AND NOT is_super_admin(auth.uid()) THEN
    -- Para inserções anônimas (como carrinho), usar tenant master
    v_tenant_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
  
  -- Definir tenant_id
  IF v_tenant_id IS NOT NULL THEN
    NEW.tenant_id := v_tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- CRIAR TRIGGERS EM TODAS AS TABELAS COM TENANT_ID
-- =====================================================

-- 1. agendamentos
DROP TRIGGER IF EXISTS auto_set_tenant_agendamentos ON public.agendamentos;
CREATE TRIGGER auto_set_tenant_agendamentos
BEFORE INSERT ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 2. servicos
DROP TRIGGER IF EXISTS auto_set_tenant_servicos ON public.servicos;
CREATE TRIGGER auto_set_tenant_servicos
BEFORE INSERT ON public.servicos
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 3. despesas
DROP TRIGGER IF EXISTS auto_set_tenant_despesas ON public.despesas;
CREATE TRIGGER auto_set_tenant_despesas
BEFORE INSERT ON public.despesas
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 4. cupons_desconto
DROP TRIGGER IF EXISTS auto_set_tenant_cupons ON public.cupons_desconto;
CREATE TRIGGER auto_set_tenant_cupons
BEFORE INSERT ON public.cupons_desconto
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 5. calendario_disponibilidade
DROP TRIGGER IF EXISTS auto_set_tenant_calendario ON public.calendario_disponibilidade;
CREATE TRIGGER auto_set_tenant_calendario
BEFORE INSERT ON public.calendario_disponibilidade
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 6. funcionarios_bot
DROP TRIGGER IF EXISTS auto_set_tenant_funcionarios ON public.funcionarios_bot;
CREATE TRIGGER auto_set_tenant_funcionarios
BEFORE INSERT ON public.funcionarios_bot
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 7. avaliacoes_clientes
DROP TRIGGER IF EXISTS auto_set_tenant_avaliacoes ON public.avaliacoes_clientes;
CREATE TRIGGER auto_set_tenant_avaliacoes
BEFORE INSERT ON public.avaliacoes_clientes
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 8. leads_cupom
DROP TRIGGER IF EXISTS auto_set_tenant_leads ON public.leads_cupom;
CREATE TRIGGER auto_set_tenant_leads
BEFORE INSERT ON public.leads_cupom
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 9. canais_empresa
DROP TRIGGER IF EXISTS auto_set_tenant_canais ON public.canais_empresa;
CREATE TRIGGER auto_set_tenant_canais
BEFORE INSERT ON public.canais_empresa
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 10. ledger_entries
DROP TRIGGER IF EXISTS auto_set_tenant_ledger ON public.ledger_entries;
CREATE TRIGGER auto_set_tenant_ledger
BEFORE INSERT ON public.ledger_entries
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 11. marketing_investimentos
DROP TRIGGER IF EXISTS auto_set_tenant_marketing ON public.marketing_investimentos;
CREATE TRIGGER auto_set_tenant_marketing
BEFORE INSERT ON public.marketing_investimentos
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 12. carrinhos_abandonados
DROP TRIGGER IF EXISTS auto_set_tenant_carrinhos ON public.carrinhos_abandonados;
CREATE TRIGGER auto_set_tenant_carrinhos
BEFORE INSERT ON public.carrinhos_abandonados
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 13. comunicacoes
DROP TRIGGER IF EXISTS auto_set_tenant_comunicacoes ON public.comunicacoes;
CREATE TRIGGER auto_set_tenant_comunicacoes
BEFORE INSERT ON public.comunicacoes
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 14. fila_avaliacoes
DROP TRIGGER IF EXISTS auto_set_tenant_fila_aval ON public.fila_avaliacoes;
CREATE TRIGGER auto_set_tenant_fila_aval
BEFORE INSERT ON public.fila_avaliacoes
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 15. fila_notificacoes_tecnico
DROP TRIGGER IF EXISTS auto_set_tenant_fila_notif ON public.fila_notificacoes_tecnico;
CREATE TRIGGER auto_set_tenant_fila_notif
BEFORE INSERT ON public.fila_notificacoes_tecnico
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 16. historico_agendamentos
DROP TRIGGER IF EXISTS auto_set_tenant_hist_ag ON public.historico_agendamentos;
CREATE TRIGGER auto_set_tenant_hist_ag
BEFORE INSERT ON public.historico_agendamentos
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 17. historico_atribuicoes
DROP TRIGGER IF EXISTS auto_set_tenant_hist_atr ON public.historico_atribuicoes;
CREATE TRIGGER auto_set_tenant_hist_atr
BEFORE INSERT ON public.historico_atribuicoes
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 18. pagamentos_agendamentos
DROP TRIGGER IF EXISTS auto_set_tenant_pagamentos ON public.pagamentos_agendamentos;
CREATE TRIGGER auto_set_tenant_pagamentos
BEFORE INSERT ON public.pagamentos_agendamentos
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 19. reembolsos
DROP TRIGGER IF EXISTS auto_set_tenant_reembolsos ON public.reembolsos;
CREATE TRIGGER auto_set_tenant_reembolsos
BEFORE INSERT ON public.reembolsos
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 20. parceiros
DROP TRIGGER IF EXISTS auto_set_tenant_parceiros ON public.parceiros;
CREATE TRIGGER auto_set_tenant_parceiros
BEFORE INSERT ON public.parceiros
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 21. parceiro_links
DROP TRIGGER IF EXISTS auto_set_tenant_parc_links ON public.parceiro_links;
CREATE TRIGGER auto_set_tenant_parc_links
BEFORE INSERT ON public.parceiro_links
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 22. parceiro_conversoes
DROP TRIGGER IF EXISTS auto_set_tenant_parc_conv ON public.parceiro_conversoes;
CREATE TRIGGER auto_set_tenant_parc_conv
BEFORE INSERT ON public.parceiro_conversoes
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 23. parceiro_saques
DROP TRIGGER IF EXISTS auto_set_tenant_parc_saques ON public.parceiro_saques;
CREATE TRIGGER auto_set_tenant_parc_saques
BEFORE INSERT ON public.parceiro_saques
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 24. user_roles (apenas para roles de tenant, super_admin fica NULL)
DROP TRIGGER IF EXISTS auto_set_tenant_roles ON public.user_roles;
CREATE TRIGGER auto_set_tenant_roles
BEFORE INSERT ON public.user_roles
FOR EACH ROW 
WHEN (NEW.role != 'super_admin')
EXECUTE FUNCTION auto_set_tenant_id();

-- 25. audit_logs
DROP TRIGGER IF EXISTS auto_set_tenant_audit ON public.audit_logs;
CREATE TRIGGER auto_set_tenant_audit
BEFORE INSERT ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- 26. live_sessions
DROP TRIGGER IF EXISTS auto_set_tenant_sessions ON public.live_sessions;
CREATE TRIGGER auto_set_tenant_sessions
BEFORE INSERT ON public.live_sessions
FOR EACH ROW EXECUTE FUNCTION auto_set_tenant_id();

-- =====================================================
-- ÍNDICES COMPOSTOS PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_agendamentos_tenant_created ON public.agendamentos(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agendamentos_tenant_data ON public.agendamentos(tenant_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_despesas_tenant_data ON public.despesas(tenant_id, data_despesa);
CREATE INDEX IF NOT EXISTS idx_ledger_tenant_data ON public.ledger_entries(tenant_id, data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_pagamentos_tenant_data ON public.pagamentos_agendamentos(tenant_id, data_pagamento);