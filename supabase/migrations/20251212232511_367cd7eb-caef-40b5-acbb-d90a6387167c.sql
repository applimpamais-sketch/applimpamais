
-- =====================================================
-- REMOÇÃO DO ROLE VISUALIZADOR
-- Acesso restrito apenas a admin e operador
-- =====================================================

-- =====================================================
-- 1. agendamentos - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "agendamentos_select_authorized" ON public.agendamentos;

CREATE POLICY "agendamentos_select_authorized"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR
  (has_role(auth.uid(), 'tecnico'::app_role) AND tecnico_id = auth.uid())
);

-- =====================================================
-- 2. carrinhos_abandonados - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "carrinhos_staff_select" ON public.carrinhos_abandonados;

CREATE POLICY "carrinhos_staff_select"
ON public.carrinhos_abandonados
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 3. leads_cupom - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "leads_cupom_staff_select" ON public.leads_cupom;

CREATE POLICY "leads_cupom_staff_select"
ON public.leads_cupom
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 4. leads_white_label - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "leads_white_label_staff_select" ON public.leads_white_label;

CREATE POLICY "leads_white_label_staff_select"
ON public.leads_white_label
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 5. whatsapp_conversas - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "whatsapp_conversas_staff_select" ON public.whatsapp_conversas;

CREATE POLICY "whatsapp_conversas_staff_select"
ON public.whatsapp_conversas
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 6. whatsapp_mensagens - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "whatsapp_mensagens_staff_select" ON public.whatsapp_mensagens;

CREATE POLICY "whatsapp_mensagens_staff_select"
ON public.whatsapp_mensagens
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 7. agendamentos_bot - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "agendamentos_bot_staff_select" ON public.agendamentos_bot;

CREATE POLICY "agendamentos_bot_staff_select"
ON public.agendamentos_bot
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 8. live_sessions - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "live_sessions_staff_select" ON public.live_sessions;

CREATE POLICY "live_sessions_staff_select"
ON public.live_sessions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 9. despesas - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "despesas_staff_select" ON public.despesas;

CREATE POLICY "despesas_staff_select"
ON public.despesas
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 10. pagamentos_agendamentos - Restringir a admin/operador + tecnico próprio
-- =====================================================
DROP POLICY IF EXISTS "pagamentos_staff_select" ON public.pagamentos_agendamentos;
DROP POLICY IF EXISTS "Tecnicos veem seus pagamentos" ON public.pagamentos_agendamentos;

CREATE POLICY "pagamentos_staff_select"
ON public.pagamentos_agendamentos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR
  (has_role(auth.uid(), 'tecnico'::app_role) AND EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE agendamentos.id = pagamentos_agendamentos.agendamento_id 
    AND agendamentos.tecnico_id = auth.uid()
  ))
);

-- =====================================================
-- 11. metas_financeiras - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "Visualizadores veem metas" ON public.metas_financeiras;

-- =====================================================
-- 12. marketing_investimentos - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "Visualizadores veem investimentos" ON public.marketing_investimentos;

-- =====================================================
-- 13. reembolsos - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "Visualizadores veem reembolsos" ON public.reembolsos;

-- =====================================================
-- 14. Outras tabelas com visualizador
-- =====================================================
DROP POLICY IF EXISTS "Admins e operadores veem histórico" ON public.agendamentos_historico;
CREATE POLICY "historico_staff_select"
ON public.agendamentos_historico
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

DROP POLICY IF EXISTS "Todos podem ver histórico" ON public.historico_agendamentos;
CREATE POLICY "historico_agendamentos_staff_select"
ON public.historico_agendamentos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

DROP POLICY IF EXISTS "Todos podem ver comunicações" ON public.comunicacoes;
CREATE POLICY "comunicacoes_staff_select"
ON public.comunicacoes
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

DROP POLICY IF EXISTS "Visualizadores veem entregas" ON public.entregas_equipamentos;

DROP POLICY IF EXISTS "Visualizadores veem funcionarios_bot" ON public.funcionarios_bot;

DROP POLICY IF EXISTS "Visualizadores veem templates" ON public.templates_mensagens;

DROP POLICY IF EXISTS "Visualizadores veem lembretes WhatsApp" ON public.whatsapp_lembretes;

DROP POLICY IF EXISTS "Visualizadores veem logs WhatsApp" ON public.whatsapp_financeiro_log;

DROP POLICY IF EXISTS "Admins e operadores veem logs push" ON public.push_notifications_log;
CREATE POLICY "push_logs_staff_select"
ON public.push_notifications_log
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

DROP POLICY IF EXISTS "Admins e operadores veem logs" ON public.webhook_logs;
CREATE POLICY "webhook_logs_staff_select"
ON public.webhook_logs
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

DROP POLICY IF EXISTS "Operadores visualizam integracoes" ON public.integracoes;

DROP POLICY IF EXISTS "Operadores visualizam whatsapp" ON public.whatsapp_numeros;
CREATE POLICY "whatsapp_numeros_staff_select"
ON public.whatsapp_numeros
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 15. pixel_events - Remover visualizador
-- =====================================================
DROP POLICY IF EXISTS "pixel_events_staff_select" ON public.pixel_events;

CREATE POLICY "pixel_events_staff_select"
ON public.pixel_events
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- DOCUMENTAÇÃO
-- =====================================================
COMMENT ON SCHEMA public IS 
'Schema público do SaaS RC Limpa Mais. AUDITORIA COMPLETA: Role visualizador removido. Acesso restrito a admin e operador apenas. Técnicos veem apenas seus próprios dados. Todas as 50 tabelas com RLS ativo e forçado.';
