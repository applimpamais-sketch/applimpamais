-- ============================================================================
-- CORREÇÃO FINAL: RLS nas tabelas de backup expostas
-- ============================================================================

-- Habilitar RLS nas 3 tabelas de backup
ALTER TABLE agendamentos_bot_backup_20251124 ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversas_backup_20251124 ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_mensagens_backup_20251124 ENABLE ROW LEVEL SECURITY;

-- Policies: Apenas admins podem ler backups
CREATE POLICY "Admins leem backup agendamentos_bot" 
ON agendamentos_bot_backup_20251124
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins leem backup conversas" 
ON whatsapp_conversas_backup_20251124
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins leem backup mensagens" 
ON whatsapp_mensagens_backup_20251124
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ninguém pode inserir/atualizar/deletar em backups (read-only)
CREATE POLICY "Backup agendamentos_bot read-only" 
ON agendamentos_bot_backup_20251124
FOR ALL
USING (false)
WITH CHECK (false);

CREATE POLICY "Backup conversas read-only" 
ON whatsapp_conversas_backup_20251124
FOR ALL
USING (false)
WITH CHECK (false);

CREATE POLICY "Backup mensagens read-only" 
ON whatsapp_mensagens_backup_20251124
FOR ALL
USING (false)
WITH CHECK (false);