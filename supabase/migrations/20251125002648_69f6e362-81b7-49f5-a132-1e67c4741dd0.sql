-- ============================================================================
-- HOTFIX CRÍTICO #2: RLS Policies para Tabelas Expostas
-- ============================================================================
-- Ativa RLS em tabelas que estavam públicas e cria policies restritivas

-- 1. Ativar RLS em whatsapp_mensagens_processadas
ALTER TABLE whatsapp_mensagens_processadas ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas sistema pode inserir (edge functions com service_role)
CREATE POLICY "Sistema apenas - insert mensagens processadas" 
ON whatsapp_mensagens_processadas
FOR INSERT 
WITH CHECK (false);

-- Policy: Admins podem ler para debugging
CREATE POLICY "Admins leem mensagens processadas" 
ON whatsapp_mensagens_processadas
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Ativar RLS em data_retention_log
ALTER TABLE data_retention_log ENABLE ROW LEVEL SECURITY;

-- Policy: Sistema insere automaticamente via scheduled jobs
CREATE POLICY "Sistema insere logs retention" 
ON data_retention_log
FOR INSERT 
WITH CHECK (false);

-- Policy: Admins leem logs de retenção
CREATE POLICY "Admins leem logs retention" 
ON data_retention_log
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Ativar RLS em lgpd_consents (já existente mas verificando)
-- Nota: Já tem policies mas garantindo que estão corretas
ALTER TABLE lgpd_consents ENABLE ROW LEVEL SECURITY;

-- 4. Ativar RLS em live_sessions
-- IMPORTANTE: Precisa permitir INSERT anônimo para tracking funcionar
-- Mas SELECT deve ser restrito a admins
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir INSERT/UPDATE anônimo para tracking
CREATE POLICY "Tracking anônimo - insert/update sessions" 
ON live_sessions
FOR ALL
USING (true)
WITH CHECK (session_id IS NOT NULL);

-- Policy: Admins leem todas as sessions
CREATE POLICY "Admins leem live sessions" 
ON live_sessions
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

-- 5. Garantir que pixel_events tem RLS correto
-- Permitir INSERT público (já corrigido com SERVICE_ROLE_KEY mas adicionar policy)
ALTER TABLE pixel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sistema insere pixel events" 
ON pixel_events
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins leem pixel events" 
ON pixel_events
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role));