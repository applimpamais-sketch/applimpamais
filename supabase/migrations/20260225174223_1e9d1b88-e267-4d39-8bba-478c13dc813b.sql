
-- =============================================================
-- SECURITY HARDENING MIGRATION
-- =============================================================

-- 1a. fila_avaliacoes: DROP the dangerous "Service role full access" policy
DROP POLICY IF EXISTS "Service role full access fila_avaliacoes" ON public.fila_avaliacoes;

-- 1b. fila_notificacoes_tecnico: DROP the dangerous "Service role full access" policy
DROP POLICY IF EXISTS "Service role full access fila_notificacoes_tecnico" ON public.fila_notificacoes_tecnico;

-- 1c. audit_logs: Replace public INSERT true (triggers use SECURITY DEFINER, bypass RLS)
DROP POLICY IF EXISTS "audit_logs_system_insert" ON public.audit_logs;

-- 1d. role_access_log: Replace public INSERT true
DROP POLICY IF EXISTS "System inserts role access logs" ON public.role_access_log;

-- 1e. security_alerts: Replace public INSERT true
DROP POLICY IF EXISTS "System creates security alerts" ON public.security_alerts;

-- 1f. parceiro_conversoes: Fix from public to authenticated
DROP POLICY IF EXISTS "parceiro_conversoes_system_insert" ON public.parceiro_conversoes;
DROP POLICY IF EXISTS "parceiro_conversoes_admin_all" ON public.parceiro_conversoes;
CREATE POLICY "parceiro_conversoes_admin_all" ON public.parceiro_conversoes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

DROP POLICY IF EXISTS "parceiro_conversoes_own_select" ON public.parceiro_conversoes;
CREATE POLICY "parceiro_conversoes_own_select" ON public.parceiro_conversoes
  FOR SELECT TO authenticated
  USING (parceiro_id = get_parceiro_id(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

-- 1g. whatsapp_envios_log: Fix from public to authenticated
DROP POLICY IF EXISTS "Sistema insere logs de envio" ON public.whatsapp_envios_log;
DROP POLICY IF EXISTS "Admins visualizam logs de envio" ON public.whatsapp_envios_log;
CREATE POLICY "whatsapp_envios_staff_select" ON public.whatsapp_envios_log
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

-- 1h. whatsapp_lembretes: Fix from public to authenticated
DROP POLICY IF EXISTS "Admins gerenciam lembretes" ON public.whatsapp_lembretes;
DROP POLICY IF EXISTS "Admins gerenciam lembretes WhatsApp" ON public.whatsapp_lembretes;
DROP POLICY IF EXISTS "Sistema cria lembretes WhatsApp" ON public.whatsapp_lembretes;
CREATE POLICY "whatsapp_lembretes_staff_all" ON public.whatsapp_lembretes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

-- 1i. fila_notificacoes_tecnico: Fix tecnico SELECT from public to authenticated
DROP POLICY IF EXISTS "Técnicos podem ver próprias notificações" ON public.fila_notificacoes_tecnico;
CREATE POLICY "fila_notif_tecnico_own_select" ON public.fila_notificacoes_tecnico
  FOR SELECT TO authenticated
  USING (auth.uid() = tecnico_id);

-- 1j. push_notifications_log: INSERT true but already authenticated, remove it
DROP POLICY IF EXISTS "Sistema cria logs push" ON public.push_notifications_log;

-- =============================================
-- 2. FIX SECURITY DEFINER search_path (HIGH)
-- =============================================
ALTER FUNCTION public.aprovar_comissao_parceiro() SET search_path = public;
ALTER FUNCTION public.criar_conversao_parceiro() SET search_path = public;

-- =============================================
-- 3. PROFILES PII PROTECTION
-- =============================================
CREATE OR REPLACE VIEW public.profiles_safe WITH (security_invoker = true) AS
SELECT id, nome_completo, email, avatar_url, cargo, bio, cidade, estado, tenant_id, created_at, updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_safe TO authenticated;

-- =============================================
-- 4. AGENDAMENTOS PUBLIC INSERT HARDENING
-- =============================================
DROP POLICY IF EXISTS "agendamentos_public_insert" ON public.agendamentos;
CREATE POLICY "agendamentos_public_insert" ON public.agendamentos
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    nome_cliente IS NOT NULL
    AND length(nome_cliente) >= 2
    AND length(nome_cliente) <= 200
    AND telefone IS NOT NULL
    AND length(telefone) >= 10
    AND length(telefone) <= 15
    AND endereco IS NOT NULL
    AND length(endereco) <= 500
    AND data_agendamento IS NOT NULL
    AND itens_carrinho IS NOT NULL
    AND valor_total IS NOT NULL
    AND valor_total >= 0
    AND valor_total <= 100000
    AND (bairro IS NULL OR length(bairro) <= 100)
    AND (cidade IS NULL OR length(cidade) <= 100)
    AND (cep IS NULL OR length(cep) <= 10)
    AND (nome_cliente !~ '[<>{}]')
    AND (endereco !~ '[<>{}]')
  );
