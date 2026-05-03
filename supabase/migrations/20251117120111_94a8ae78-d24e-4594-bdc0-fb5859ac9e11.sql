-- Adicionar campos de tracking de permissões
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS permission_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS permission_requested_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS permission_denied_count INT DEFAULT 0;