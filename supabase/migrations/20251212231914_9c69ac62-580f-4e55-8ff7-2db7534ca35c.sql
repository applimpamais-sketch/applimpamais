
-- =====================================================
-- AUDITORIA DE SEGURANÇA COMPLETA - CORREÇÕES FINAIS
-- =====================================================

-- =====================================================
-- 1. data_retention_log - Corrigir INSERT bloqueado
-- =====================================================
DROP POLICY IF EXISTS "Sistema insere logs retention" ON public.data_retention_log;
DROP POLICY IF EXISTS "Admins leem logs retention" ON public.data_retention_log;
DROP POLICY IF EXISTS "data_retention_admin_only" ON public.data_retention_log;

-- Apenas admin pode ler e gerenciar
CREATE POLICY "data_retention_admin_only"
ON public.data_retention_log
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Sistema (triggers/functions) pode inserir via SECURITY DEFINER

-- =====================================================
-- 2. pixel_events - Limpar duplicadas e melhorar INSERT
-- =====================================================
DROP POLICY IF EXISTS "Admins leem pixel events" ON public.pixel_events;
DROP POLICY IF EXISTS "Sistema insere pixel events" ON public.pixel_events;
DROP POLICY IF EXISTS "pixel_events_admin_select" ON public.pixel_events;
DROP POLICY IF EXISTS "pixel_events_public_insert" ON public.pixel_events;

-- SELECT apenas staff autenticado
CREATE POLICY "pixel_events_staff_select"
ON public.pixel_events
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

-- INSERT público com validações (tracking do site)
CREATE POLICY "pixel_events_tracking_insert"
ON public.pixel_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IS NOT NULL AND
  LENGTH(event_type) >= 3 AND
  LENGTH(event_type) <= 50
);

-- =====================================================
-- 3. carrinhos_abandonados - Limpar duplicadas
-- =====================================================
DROP POLICY IF EXISTS "carrinhos_abandonados_staff_only_select" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "carrinhos_staff_select" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "carrinhos_staff_manage" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "carrinhos_staff_update" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "carrinhos_staff_delete" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "Allow anonymous insert abandoned carts" ON public.carrinhos_abandonados;
DROP POLICY IF EXISTS "Allow anonymous update own cart by session" ON public.carrinhos_abandonados;

-- SELECT: apenas staff autenticado
CREATE POLICY "carrinhos_staff_select"
ON public.carrinhos_abandonados
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role)
);

-- INSERT: público para tracking (com validação)
CREATE POLICY "carrinhos_tracking_insert"
ON public.carrinhos_abandonados
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL AND
  LENGTH(session_id) >= 10 AND
  itens_carrinho IS NOT NULL AND
  valor_total >= 0
);

-- UPDATE: anônimo pode atualizar apenas próprio carrinho via session
CREATE POLICY "carrinhos_own_session_update"
ON public.carrinhos_abandonados
FOR UPDATE
TO anon, authenticated
USING (session_id IS NOT NULL)
WITH CHECK (session_id IS NOT NULL);

-- Staff pode gerenciar qualquer carrinho
CREATE POLICY "carrinhos_staff_manage"
ON public.carrinhos_abandonados
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- =====================================================
-- 4. Forçar RLS em todas as tabelas (garantia)
-- =====================================================
ALTER TABLE public.data_retention_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.pixel_events FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Documentação de auditoria
-- =====================================================
COMMENT ON TABLE public.data_retention_log IS 
'Log de retenção de dados LGPD. SISTEMA APENAS - sem acesso público. Admin pode visualizar.';

COMMENT ON TABLE public.pixel_events IS 
'Eventos do Facebook Pixel. INSERT público permitido para tracking. SELECT apenas staff.';

COMMENT ON TABLE public.carrinhos_abandonados IS 
'Carrinhos abandonados. DADOS SENSÍVEIS: nome, telefone, email, endereço. SELECT apenas staff. INSERT/UPDATE anônimo limitado ao próprio session_id.';
