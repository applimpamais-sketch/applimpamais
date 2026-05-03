-- =====================================================
-- FASE 4: ATUALIZAR RLS - REMOVER ACESSO A NULL
-- =====================================================

-- 1. AGENDAMENTOS - Drop e recriar policy
DROP POLICY IF EXISTS "tenant_isolation_agendamentos" ON public.agendamentos;
CREATE POLICY "tenant_isolation_agendamentos" ON public.agendamentos
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 2. AVALIACOES_CLIENTES
DROP POLICY IF EXISTS "tenant_isolation_avaliacoes" ON public.avaliacoes_clientes;
CREATE POLICY "tenant_isolation_avaliacoes" ON public.avaliacoes_clientes
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 3. SERVICOS
DROP POLICY IF EXISTS "tenant_isolation_servicos" ON public.servicos;
CREATE POLICY "tenant_isolation_servicos" ON public.servicos
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 4. DESPESAS
DROP POLICY IF EXISTS "tenant_isolation_despesas" ON public.despesas;
CREATE POLICY "tenant_isolation_despesas" ON public.despesas
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 5. CUPONS_DESCONTO
DROP POLICY IF EXISTS "tenant_isolation_cupons" ON public.cupons_desconto;
CREATE POLICY "tenant_isolation_cupons" ON public.cupons_desconto
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 6. CALENDARIO_DISPONIBILIDADE
DROP POLICY IF EXISTS "tenant_isolation_calendario" ON public.calendario_disponibilidade;
CREATE POLICY "tenant_isolation_calendario" ON public.calendario_disponibilidade
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 7. FUNCIONARIOS_BOT
DROP POLICY IF EXISTS "tenant_isolation_funcionarios" ON public.funcionarios_bot;
CREATE POLICY "tenant_isolation_funcionarios" ON public.funcionarios_bot
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 8. LEADS_CUPOM
DROP POLICY IF EXISTS "tenant_isolation_leads" ON public.leads_cupom;
CREATE POLICY "tenant_isolation_leads" ON public.leads_cupom
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 9. CANAIS_EMPRESA
DROP POLICY IF EXISTS "tenant_isolation_canais" ON public.canais_empresa;
CREATE POLICY "tenant_isolation_canais" ON public.canais_empresa
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 10. LEDGER_ENTRIES
DROP POLICY IF EXISTS "tenant_isolation_ledger" ON public.ledger_entries;
CREATE POLICY "tenant_isolation_ledger" ON public.ledger_entries
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 11. MARKETING_INVESTIMENTOS
DROP POLICY IF EXISTS "tenant_isolation_marketing" ON public.marketing_investimentos;
CREATE POLICY "tenant_isolation_marketing" ON public.marketing_investimentos
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 12. PROFILES - Policy especial (usuário vê seu próprio perfil)
DROP POLICY IF EXISTS "tenant_isolation_profiles" ON public.profiles;
CREATE POLICY "tenant_isolation_profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- =====================================================
-- NOVAS TABELAS COM RLS
-- =====================================================

-- 13. CARRINHOS_ABANDONADOS
ALTER TABLE public.carrinhos_abandonados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_carrinhos" ON public.carrinhos_abandonados;
CREATE POLICY "tenant_isolation_carrinhos" ON public.carrinhos_abandonados
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);
-- Permitir insert anônimo (carrinho público)
CREATE POLICY "public_insert_carrinhos" ON public.carrinhos_abandonados
FOR INSERT TO anon
WITH CHECK (true);

-- 14. COMUNICACOES
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_comunicacoes" ON public.comunicacoes;
CREATE POLICY "tenant_isolation_comunicacoes" ON public.comunicacoes
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 15. FILA_AVALIACOES
ALTER TABLE public.fila_avaliacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_fila_avaliacoes" ON public.fila_avaliacoes;
CREATE POLICY "tenant_isolation_fila_avaliacoes" ON public.fila_avaliacoes
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 16. FILA_NOTIFICACOES_TECNICO
ALTER TABLE public.fila_notificacoes_tecnico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_fila_notif" ON public.fila_notificacoes_tecnico;
CREATE POLICY "tenant_isolation_fila_notif" ON public.fila_notificacoes_tecnico
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 17. HISTORICO_AGENDAMENTOS
ALTER TABLE public.historico_agendamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_historico_ag" ON public.historico_agendamentos;
CREATE POLICY "tenant_isolation_historico_ag" ON public.historico_agendamentos
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 18. HISTORICO_ATRIBUICOES
ALTER TABLE public.historico_atribuicoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_historico_atr" ON public.historico_atribuicoes;
CREATE POLICY "tenant_isolation_historico_atr" ON public.historico_atribuicoes
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 19. PAGAMENTOS_AGENDAMENTOS
ALTER TABLE public.pagamentos_agendamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_pagamentos" ON public.pagamentos_agendamentos;
CREATE POLICY "tenant_isolation_pagamentos" ON public.pagamentos_agendamentos
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 20. REEMBOLSOS
ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_reembolsos" ON public.reembolsos;
CREATE POLICY "tenant_isolation_reembolsos" ON public.reembolsos
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 21. PARCEIROS
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parceiros" ON public.parceiros;
CREATE POLICY "tenant_isolation_parceiros" ON public.parceiros
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
  OR user_id = auth.uid()
);

-- 22. PARCEIRO_LINKS
ALTER TABLE public.parceiro_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parceiro_links" ON public.parceiro_links;
CREATE POLICY "tenant_isolation_parceiro_links" ON public.parceiro_links
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 23. PARCEIRO_CONVERSOES
ALTER TABLE public.parceiro_conversoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parceiro_conv" ON public.parceiro_conversoes;
CREATE POLICY "tenant_isolation_parceiro_conv" ON public.parceiro_conversoes
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);

-- 24. PARCEIRO_SAQUES
ALTER TABLE public.parceiro_saques ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_parceiro_saques" ON public.parceiro_saques;
CREATE POLICY "tenant_isolation_parceiro_saques" ON public.parceiro_saques
FOR ALL TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR is_super_admin(auth.uid())
);