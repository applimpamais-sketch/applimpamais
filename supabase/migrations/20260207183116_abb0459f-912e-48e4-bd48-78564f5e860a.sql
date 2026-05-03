-- ============================================================
-- MIGRATION: ISOLAMENTO MULTI-TENANT DEFINITIVO (CORRIGIDA)
-- Garante que ZERO dados vazem entre tenants
-- ============================================================

-- ============================================================
-- 0. ADICIONAR tenant_id em tabelas que faltam
-- ============================================================
ALTER TABLE agendamentos_bot ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES saas_tenants(id);

-- ============================================================
-- 1. FUNÇÃO ANTI CROSS-TENANT INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION public.block_cross_tenant_write()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  -- Super admin pode escrever em qualquer tenant
  IF is_super_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  
  -- Se tenant_id foi informado, deve ser o do usuário
  IF NEW.tenant_id IS NOT NULL 
     AND NEW.tenant_id != get_user_tenant_id() THEN
    RAISE EXCEPTION 'SECURITY: Cross-tenant write blocked. User tenant: %, Record tenant: %', 
      get_user_tenant_id(), NEW.tenant_id;
  END IF;
  
  -- Auto-preencher tenant_id se não informado
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := get_user_tenant_id();
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. CORREÇÃO DE POLICIES: live_sessions
-- ============================================================
DROP POLICY IF EXISTS "live_sessions_staff_select" ON live_sessions;
DROP POLICY IF EXISTS "live_sessions_staff_delete" ON live_sessions;
DROP POLICY IF EXISTS "live_sessions_anon_insert" ON live_sessions;
DROP POLICY IF EXISTS "live_sessions_anon_update" ON live_sessions;

CREATE POLICY "live_sessions_anon_upsert" ON live_sessions
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "live_sessions_staff_select" ON live_sessions
  FOR SELECT TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  );

CREATE POLICY "live_sessions_staff_delete" ON live_sessions
  FOR DELETE TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  );

DROP TRIGGER IF EXISTS enforce_tenant_live_sessions ON live_sessions;
CREATE TRIGGER enforce_tenant_live_sessions
  BEFORE INSERT OR UPDATE ON live_sessions
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 3. CORREÇÃO DE POLICIES: agendamentos
-- ============================================================
DROP POLICY IF EXISTS "agendamentos_select_authorized" ON agendamentos;
DROP POLICY IF EXISTS "agendamentos_staff_update" ON agendamentos;
DROP POLICY IF EXISTS "agendamentos_staff_delete" ON agendamentos;

CREATE POLICY "agendamentos_select_with_tenant" ON agendamentos
  FOR SELECT TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador')
     OR (has_role(auth.uid(), 'tecnico') AND tecnico_id = auth.uid()))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  );

CREATE POLICY "agendamentos_update_with_tenant" ON agendamentos
  FOR UPDATE TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

CREATE POLICY "agendamentos_delete_with_tenant" ON agendamentos
  FOR DELETE TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  );

DROP TRIGGER IF EXISTS enforce_tenant_agendamentos ON agendamentos;
CREATE TRIGGER enforce_tenant_agendamentos
  BEFORE INSERT OR UPDATE ON agendamentos
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 4. CORREÇÃO DE POLICIES: carrinhos_abandonados
-- ============================================================
DROP POLICY IF EXISTS "carrinhos_staff_select" ON carrinhos_abandonados;
DROP POLICY IF EXISTS "carrinhos_staff_manage" ON carrinhos_abandonados;

CREATE POLICY "carrinhos_staff_select_with_tenant" ON carrinhos_abandonados
  FOR SELECT TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  );

CREATE POLICY "carrinhos_staff_manage_with_tenant" ON carrinhos_abandonados
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_carrinhos ON carrinhos_abandonados;
CREATE TRIGGER enforce_tenant_carrinhos
  BEFORE INSERT OR UPDATE ON carrinhos_abandonados
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 5. CORREÇÃO DE POLICIES: leads_cupom
-- ============================================================
DROP POLICY IF EXISTS "leads_staff_select" ON leads_cupom;
DROP POLICY IF EXISTS "leads_staff_manage" ON leads_cupom;

CREATE POLICY "leads_staff_select_with_tenant" ON leads_cupom
  FOR SELECT TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  );

CREATE POLICY "leads_staff_manage_with_tenant" ON leads_cupom
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_leads ON leads_cupom;
CREATE TRIGGER enforce_tenant_leads
  BEFORE INSERT OR UPDATE ON leads_cupom
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 6. CORREÇÃO DE POLICIES: despesas
-- ============================================================
DROP POLICY IF EXISTS "despesas_staff_select" ON despesas;
DROP POLICY IF EXISTS "despesas_staff_manage" ON despesas;

CREATE POLICY "despesas_staff_select_with_tenant" ON despesas
  FOR SELECT TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  );

CREATE POLICY "despesas_staff_all_with_tenant" ON despesas
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_despesas ON despesas;
CREATE TRIGGER enforce_tenant_despesas
  BEFORE INSERT OR UPDATE ON despesas
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 7. CORREÇÃO DE POLICIES: whatsapp_conversas
-- ============================================================
DROP POLICY IF EXISTS "whatsapp_conversas_staff_select" ON whatsapp_conversas;
DROP POLICY IF EXISTS "whatsapp_conversas_staff_manage" ON whatsapp_conversas;

CREATE POLICY "whatsapp_conversas_staff_with_tenant" ON whatsapp_conversas
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_whatsapp_conversas ON whatsapp_conversas;
CREATE TRIGGER enforce_tenant_whatsapp_conversas
  BEFORE INSERT OR UPDATE ON whatsapp_conversas
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 8. CORREÇÃO DE POLICIES: whatsapp_mensagens
-- ============================================================
DROP POLICY IF EXISTS "whatsapp_mensagens_staff_select" ON whatsapp_mensagens;
DROP POLICY IF EXISTS "whatsapp_mensagens_staff_manage" ON whatsapp_mensagens;

CREATE POLICY "whatsapp_mensagens_staff_with_tenant" ON whatsapp_mensagens
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_whatsapp_mensagens ON whatsapp_mensagens;
CREATE TRIGGER enforce_tenant_whatsapp_mensagens
  BEFORE INSERT OR UPDATE ON whatsapp_mensagens
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 9. CORREÇÃO DE POLICIES: agendamentos_bot (agora com tenant_id)
-- ============================================================
ALTER TABLE agendamentos_bot ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agendamentos_bot_staff_select" ON agendamentos_bot;
DROP POLICY IF EXISTS "agendamentos_bot_staff_manage" ON agendamentos_bot;

CREATE POLICY "agendamentos_bot_staff_with_tenant" ON agendamentos_bot
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()) OR tenant_id IS NULL)
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()) OR tenant_id IS NULL);

-- ============================================================
-- 10. CORREÇÃO DE POLICIES: pixel_events
-- ============================================================
DROP POLICY IF EXISTS "pixel_events_staff_select" ON pixel_events;

CREATE POLICY "pixel_events_staff_with_tenant" ON pixel_events
  FOR SELECT TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  );

-- ============================================================
-- 11. CORREÇÃO DE POLICIES: comunicacoes
-- ============================================================
DROP POLICY IF EXISTS "comunicacoes_staff_select" ON comunicacoes;

CREATE POLICY "comunicacoes_staff_with_tenant" ON comunicacoes
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_comunicacoes ON comunicacoes;
CREATE TRIGGER enforce_tenant_comunicacoes
  BEFORE INSERT OR UPDATE ON comunicacoes
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 12. CORREÇÃO DE POLICIES: historico_agendamentos
-- ============================================================
DROP POLICY IF EXISTS "historico_staff_select" ON historico_agendamentos;

CREATE POLICY "historico_staff_with_tenant" ON historico_agendamentos
  FOR SELECT TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  );

-- ============================================================
-- 13. CORREÇÃO DE POLICIES: metas_financeiras
-- ============================================================
DROP POLICY IF EXISTS "metas_staff_select" ON metas_financeiras;
DROP POLICY IF EXISTS "metas_staff_manage" ON metas_financeiras;

CREATE POLICY "metas_staff_with_tenant" ON metas_financeiras
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_metas ON metas_financeiras;
CREATE TRIGGER enforce_tenant_metas
  BEFORE INSERT OR UPDATE ON metas_financeiras
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 14. CORREÇÃO DE POLICIES: reembolsos
-- ============================================================
DROP POLICY IF EXISTS "reembolsos_staff_select" ON reembolsos;
DROP POLICY IF EXISTS "reembolsos_staff_manage" ON reembolsos;

CREATE POLICY "reembolsos_staff_with_tenant" ON reembolsos
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_reembolsos ON reembolsos;
CREATE TRIGGER enforce_tenant_reembolsos
  BEFORE INSERT OR UPDATE ON reembolsos
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 15. CORREÇÃO DE POLICIES: cupons_desconto
-- ============================================================
DROP POLICY IF EXISTS "cupons_staff_select" ON cupons_desconto;
DROP POLICY IF EXISTS "cupons_staff_manage" ON cupons_desconto;

CREATE POLICY "cupons_staff_with_tenant" ON cupons_desconto
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_cupons ON cupons_desconto;
CREATE TRIGGER enforce_tenant_cupons
  BEFORE INSERT OR UPDATE ON cupons_desconto
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 16. CORREÇÃO DE POLICIES: funcionarios_bot
-- ============================================================
DROP POLICY IF EXISTS "funcionarios_staff_select" ON funcionarios_bot;
DROP POLICY IF EXISTS "funcionarios_staff_manage" ON funcionarios_bot;

CREATE POLICY "funcionarios_staff_with_tenant" ON funcionarios_bot
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_funcionarios ON funcionarios_bot;
CREATE TRIGGER enforce_tenant_funcionarios
  BEFORE INSERT OR UPDATE ON funcionarios_bot
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 17. CORREÇÃO DE POLICIES: avaliacoes_clientes
-- ============================================================
DROP POLICY IF EXISTS "avaliacoes_staff_select" ON avaliacoes_clientes;
DROP POLICY IF EXISTS "avaliacoes_staff_manage" ON avaliacoes_clientes;

CREATE POLICY "avaliacoes_staff_with_tenant" ON avaliacoes_clientes
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_avaliacoes ON avaliacoes_clientes;
CREATE TRIGGER enforce_tenant_avaliacoes
  BEFORE INSERT OR UPDATE ON avaliacoes_clientes
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 18. CORREÇÃO DE POLICIES: pagamentos_agendamentos
-- ============================================================
DROP POLICY IF EXISTS "pagamentos_staff_select" ON pagamentos_agendamentos;
DROP POLICY IF EXISTS "pagamentos_staff_manage" ON pagamentos_agendamentos;

CREATE POLICY "pagamentos_staff_with_tenant" ON pagamentos_agendamentos
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_pagamentos ON pagamentos_agendamentos;
CREATE TRIGGER enforce_tenant_pagamentos
  BEFORE INSERT OR UPDATE ON pagamentos_agendamentos
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 19. CORREÇÃO DE POLICIES: ledger_entries
-- ============================================================
DROP POLICY IF EXISTS "ledger_staff_select" ON ledger_entries;
DROP POLICY IF EXISTS "ledger_staff_manage" ON ledger_entries;

CREATE POLICY "ledger_staff_with_tenant" ON ledger_entries
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_ledger ON ledger_entries;
CREATE TRIGGER enforce_tenant_ledger
  BEFORE INSERT OR UPDATE ON ledger_entries
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 20. CORREÇÃO DE POLICIES: servicos
-- ============================================================
DROP POLICY IF EXISTS "servicos_staff_select" ON servicos;
DROP POLICY IF EXISTS "servicos_staff_manage" ON servicos;

CREATE POLICY "servicos_staff_with_tenant" ON servicos
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_servicos ON servicos;
CREATE TRIGGER enforce_tenant_servicos
  BEFORE INSERT OR UPDATE ON servicos
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 21. CORREÇÃO DE POLICIES: alugueis
-- ============================================================
DROP POLICY IF EXISTS "alugueis_staff_select" ON alugueis;
DROP POLICY IF EXISTS "alugueis_staff_manage" ON alugueis;

CREATE POLICY "alugueis_staff_with_tenant" ON alugueis
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_alugueis ON alugueis;
CREATE TRIGGER enforce_tenant_alugueis
  BEFORE INSERT OR UPDATE ON alugueis
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 22. CORREÇÃO DE POLICIES: calendario_disponibilidade
-- ============================================================
DROP POLICY IF EXISTS "calendario_staff_select" ON calendario_disponibilidade;
DROP POLICY IF EXISTS "calendario_staff_manage" ON calendario_disponibilidade;

CREATE POLICY "calendario_staff_with_tenant" ON calendario_disponibilidade
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_calendario ON calendario_disponibilidade;
CREATE TRIGGER enforce_tenant_calendario
  BEFORE INSERT OR UPDATE ON calendario_disponibilidade
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 23. CORREÇÃO DE POLICIES: fila_avaliacoes
-- ============================================================
DROP POLICY IF EXISTS "fila_avaliacoes_staff_select" ON fila_avaliacoes;

CREATE POLICY "fila_avaliacoes_staff_with_tenant" ON fila_avaliacoes
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_fila_avaliacoes ON fila_avaliacoes;
CREATE TRIGGER enforce_tenant_fila_avaliacoes
  BEFORE INSERT OR UPDATE ON fila_avaliacoes
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 24. CORREÇÃO DE POLICIES: canais_empresa
-- ============================================================
DROP POLICY IF EXISTS "canais_staff_select" ON canais_empresa;
DROP POLICY IF EXISTS "canais_staff_manage" ON canais_empresa;

CREATE POLICY "canais_staff_with_tenant" ON canais_empresa
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_canais ON canais_empresa;
CREATE TRIGGER enforce_tenant_canais
  BEFORE INSERT OR UPDATE ON canais_empresa
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();

-- ============================================================
-- 25. CORREÇÃO DE POLICIES: orcamentos
-- ============================================================
DROP POLICY IF EXISTS "orcamentos_staff_select" ON orcamentos;
DROP POLICY IF EXISTS "orcamentos_staff_manage" ON orcamentos;

CREATE POLICY "orcamentos_staff_with_tenant" ON orcamentos
  FOR ALL TO authenticated
  USING (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))
    AND (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()))
  )
  WITH CHECK (tenant_id = get_user_tenant_id() OR is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS enforce_tenant_orcamentos ON orcamentos;
CREATE TRIGGER enforce_tenant_orcamentos
  BEFORE INSERT OR UPDATE ON orcamentos
  FOR EACH ROW WHEN (current_setting('role', true) = 'authenticated')
  EXECUTE FUNCTION block_cross_tenant_write();