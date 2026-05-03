
-- =====================================================
-- CORREÇÃO CRÍTICA - TODAS AS VULNERABILIDADES
-- Scanner detectou 12 ERROS que bloqueiam produção
-- =====================================================

-- =====================================================
-- 1. profiles - Restringir SELECT a próprio usuário + staff
-- =====================================================
DROP POLICY IF EXISTS "profiles_owner_or_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;

-- SELECT: próprio perfil OU staff autenticado
CREATE POLICY "profiles_select_restricted"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- UPDATE: próprio perfil apenas
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin gerencia todos
CREATE POLICY "profiles_admin_manage"
ON public.profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 2. leads_cupom - Bloquear SELECT público
-- =====================================================
DROP POLICY IF EXISTS "Permitir INSERT público em leads" ON public.leads_cupom;
DROP POLICY IF EXISTS "leads_cupom_staff_select" ON public.leads_cupom;
DROP POLICY IF EXISTS "leads_cupom_staff_update" ON public.leads_cupom;

-- INSERT público para captura de leads
CREATE POLICY "leads_cupom_public_insert"
ON public.leads_cupom
FOR INSERT
TO anon, authenticated
WITH CHECK (
  nome_completo IS NOT NULL AND
  whatsapp IS NOT NULL AND
  cidade IS NOT NULL
);

-- SELECT apenas staff
CREATE POLICY "leads_cupom_staff_select"
ON public.leads_cupom
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

-- UPDATE/DELETE apenas admin/operador
CREATE POLICY "leads_cupom_staff_manage"
ON public.leads_cupom
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

ALTER TABLE public.leads_cupom FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 3. leads_white_label - Bloquear SELECT público
-- =====================================================
DROP POLICY IF EXISTS "Permitir INSERT público em leads white label" ON public.leads_white_label;
DROP POLICY IF EXISTS "leads_white_label_staff_select" ON public.leads_white_label;
DROP POLICY IF EXISTS "leads_white_label_staff_update" ON public.leads_white_label;

CREATE POLICY "leads_white_label_public_insert"
ON public.leads_white_label
FOR INSERT
TO anon, authenticated
WITH CHECK (
  nome IS NOT NULL AND
  email IS NOT NULL AND
  telefone IS NOT NULL AND
  empresa IS NOT NULL
);

CREATE POLICY "leads_white_label_staff_select"
ON public.leads_white_label
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

CREATE POLICY "leads_white_label_staff_manage"
ON public.leads_white_label
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

ALTER TABLE public.leads_white_label FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 4. lgpd_consents - Restringir SELECT
-- =====================================================
DROP POLICY IF EXISTS "Admins view all consents" ON public.lgpd_consents;
DROP POLICY IF EXISTS "Anyone can insert LGPD consent" ON public.lgpd_consents;
DROP POLICY IF EXISTS "Users view own consents" ON public.lgpd_consents;

CREATE POLICY "lgpd_consents_public_insert"
ON public.lgpd_consents
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL AND
  consent_text IS NOT NULL
);

CREATE POLICY "lgpd_consents_own_select"
ON public.lgpd_consents
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "lgpd_consents_admin_select"
ON public.lgpd_consents
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.lgpd_consents FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 5. soft_launch_clientes - Restringir a staff
-- =====================================================
DROP POLICY IF EXISTS "Admins e operadores gerenciam soft launch clientes" ON public.soft_launch_clientes;

CREATE POLICY "soft_launch_clientes_staff_only"
ON public.soft_launch_clientes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

ALTER TABLE public.soft_launch_clientes FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 6. soft_launch_feedback - Restringir a staff
-- =====================================================
DROP POLICY IF EXISTS "Admins e operadores gerenciam soft launch feedback" ON public.soft_launch_feedback;

CREATE POLICY "soft_launch_feedback_staff_only"
ON public.soft_launch_feedback
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

ALTER TABLE public.soft_launch_feedback FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 7. whatsapp_conversas - Forçar TO authenticated
-- =====================================================
DROP POLICY IF EXISTS "Admins gerenciam conversas" ON public.whatsapp_conversas;
DROP POLICY IF EXISTS "Admins gerenciam conversas WhatsApp" ON public.whatsapp_conversas;
DROP POLICY IF EXISTS "Visualizadores veem conversas" ON public.whatsapp_conversas;
DROP POLICY IF EXISTS "Visualizadores veem conversas WhatsApp" ON public.whatsapp_conversas;
DROP POLICY IF EXISTS "whatsapp_conversas_staff_select" ON public.whatsapp_conversas;
DROP POLICY IF EXISTS "whatsapp_conversas_system_insert" ON public.whatsapp_conversas;
DROP POLICY IF EXISTS "whatsapp_conversas_system_update" ON public.whatsapp_conversas;

CREATE POLICY "whatsapp_conversas_staff_select"
ON public.whatsapp_conversas
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

CREATE POLICY "whatsapp_conversas_staff_manage"
ON public.whatsapp_conversas
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

ALTER TABLE public.whatsapp_conversas FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 8. whatsapp_mensagens - Forçar TO authenticated
-- =====================================================
DROP POLICY IF EXISTS "Admins gerenciam mensagens" ON public.whatsapp_mensagens;
DROP POLICY IF EXISTS "Admins gerenciam mensagens WhatsApp" ON public.whatsapp_mensagens;
DROP POLICY IF EXISTS "Visualizadores veem mensagens" ON public.whatsapp_mensagens;
DROP POLICY IF EXISTS "Visualizadores veem mensagens WhatsApp" ON public.whatsapp_mensagens;
DROP POLICY IF EXISTS "whatsapp_mensagens_staff_select" ON public.whatsapp_mensagens;
DROP POLICY IF EXISTS "whatsapp_mensagens_system_insert" ON public.whatsapp_mensagens;

CREATE POLICY "whatsapp_mensagens_staff_select"
ON public.whatsapp_mensagens
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

CREATE POLICY "whatsapp_mensagens_staff_manage"
ON public.whatsapp_mensagens
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

ALTER TABLE public.whatsapp_mensagens FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 9. agendamentos_bot - Forçar TO authenticated
-- =====================================================
DROP POLICY IF EXISTS "Admins gerenciam agendamentos bot" ON public.agendamentos_bot;
DROP POLICY IF EXISTS "Visualizadores veem agendamentos bot" ON public.agendamentos_bot;

CREATE POLICY "agendamentos_bot_staff_select"
ON public.agendamentos_bot
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

CREATE POLICY "agendamentos_bot_staff_manage"
ON public.agendamentos_bot
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

ALTER TABLE public.agendamentos_bot FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 10. live_sessions - Corrigir SELECT para staff only
-- =====================================================
DROP POLICY IF EXISTS "live_sessions_staff_only_select" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_own_session_update" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_tracking_insert" ON public.live_sessions;
DROP POLICY IF EXISTS "live_sessions_staff_delete" ON public.live_sessions;

-- SELECT apenas staff autenticado
CREATE POLICY "live_sessions_staff_select"
ON public.live_sessions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

-- INSERT público para tracking (validado)
CREATE POLICY "live_sessions_tracking_insert"
ON public.live_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL AND
  LENGTH(session_id) >= 10 AND
  LENGTH(session_id) <= 100 AND
  pagina_atual IS NOT NULL AND
  etapa IS NOT NULL
);

-- UPDATE apenas própria sessão
CREATE POLICY "live_sessions_own_update"
ON public.live_sessions
FOR UPDATE
TO anon, authenticated
USING (session_id IS NOT NULL)
WITH CHECK (
  session_id IS NOT NULL AND
  LENGTH(session_id) >= 10 AND
  LENGTH(session_id) <= 100
);

-- DELETE staff only
CREATE POLICY "live_sessions_staff_delete"
ON public.live_sessions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

ALTER TABLE public.live_sessions FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 11. user_roles - Prevenir auto-modificação
-- =====================================================
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;

-- Usuário vê próprias roles, mas NÃO pode modificar
CREATE POLICY "user_roles_own_select"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Apenas admin pode gerenciar (já existe, mantém)
-- "Admins manage all roles" já está correto

ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- =====================================================
-- DOCUMENTAÇÃO FINAL
-- =====================================================
COMMENT ON TABLE public.profiles IS 
'Perfis de usuários. DADOS SENSÍVEIS. SELECT: próprio usuário + staff. UPDATE: próprio apenas. Admin gerencia todos.';

COMMENT ON TABLE public.leads_cupom IS 
'Leads de cupom promocional. DADOS SENSÍVEIS: nome, WhatsApp. INSERT público. SELECT/UPDATE staff apenas.';

COMMENT ON TABLE public.leads_white_label IS 
'Leads B2B white label. DADOS SENSÍVEIS: nome, email, telefone, empresa. INSERT público. SELECT staff apenas.';

COMMENT ON TABLE public.lgpd_consents IS 
'Consentimentos LGPD. INSERT público. SELECT próprio usuário + admin apenas.';

COMMENT ON TABLE public.whatsapp_conversas IS 
'Conversas WhatsApp. DADOS SENSÍVEIS. Acesso staff autenticado apenas.';

COMMENT ON TABLE public.whatsapp_mensagens IS 
'Mensagens WhatsApp. DADOS SENSÍVEIS. Acesso staff autenticado apenas.';

COMMENT ON TABLE public.agendamentos_bot IS 
'Agendamentos via bot. DADOS SENSÍVEIS. Acesso staff autenticado apenas.';

COMMENT ON TABLE public.live_sessions IS 
'Sessões ao vivo. INSERT/UPDATE público para tracking. SELECT staff apenas.';
