-- =====================================================
-- FASE 3: MIGRAR DADOS LEGADOS PARA TENANT MASTER
-- =====================================================

-- ID do tenant master RC Limpa Mais
-- '00000000-0000-0000-0000-000000000001'

-- 1. Migrar agendamentos
UPDATE public.agendamentos 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 2. Migrar servicos
UPDATE public.servicos 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 3. Migrar despesas
UPDATE public.despesas 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 4. Migrar cupons_desconto
UPDATE public.cupons_desconto 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 5. Migrar calendario_disponibilidade
UPDATE public.calendario_disponibilidade 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 6. Migrar funcionarios_bot
UPDATE public.funcionarios_bot 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 7. Migrar avaliacoes_clientes
UPDATE public.avaliacoes_clientes 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 8. Migrar leads_cupom
UPDATE public.leads_cupom 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 9. Migrar canais_empresa
UPDATE public.canais_empresa 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 10. Migrar profiles (usuários master)
UPDATE public.profiles 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL
AND id IN (
  SELECT user_id FROM public.user_roles 
  WHERE role IN ('admin', 'operador', 'tecnico')
);

-- 11. Migrar ledger_entries
UPDATE public.ledger_entries 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 12. Migrar marketing_investimentos
UPDATE public.marketing_investimentos 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 13. Migrar metas_financeiras (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metas_financeiras' AND table_schema = 'public') THEN
    EXECUTE 'UPDATE public.metas_financeiras SET tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid WHERE tenant_id IS NULL';
  END IF;
END $$;

-- 14. Migrar carrinhos_abandonados
UPDATE public.carrinhos_abandonados 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 15. Migrar comunicacoes
UPDATE public.comunicacoes 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 16. Migrar fila_avaliacoes
UPDATE public.fila_avaliacoes 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 17. Migrar fila_notificacoes_tecnico
UPDATE public.fila_notificacoes_tecnico 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 18. Migrar historico_agendamentos
UPDATE public.historico_agendamentos 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 19. Migrar historico_atribuicoes
UPDATE public.historico_atribuicoes 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 20. Migrar pagamentos_agendamentos
UPDATE public.pagamentos_agendamentos 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 21. Migrar reembolsos
UPDATE public.reembolsos 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 22. Migrar user_roles para master (roles globais ficam sem tenant)
UPDATE public.user_roles 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL
AND role NOT IN ('super_admin'); -- super_admin é global

-- 23. Migrar parceiros
UPDATE public.parceiros 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 24. Migrar parceiro_links
UPDATE public.parceiro_links 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 25. Migrar parceiro_conversoes
UPDATE public.parceiro_conversoes 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 26. Migrar parceiro_saques
UPDATE public.parceiro_saques 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 27. Migrar audit_logs
UPDATE public.audit_logs 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- 28. Migrar live_sessions
UPDATE public.live_sessions 
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

-- Log da migração
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.agendamentos WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid;
  RAISE NOTICE 'Migração concluída. Agendamentos no tenant master: %', v_count;
END $$;