-- Criar tabela de logs de envios WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_envios_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID REFERENCES whatsapp_conversas(id) ON DELETE CASCADE,
  telefone TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status_code INTEGER,
  sucesso BOOLEAN DEFAULT false,
  erro_detalhes JSONB,
  tentativas INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_envios_log_conversa ON whatsapp_envios_log(conversa_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_envios_log_sucesso ON whatsapp_envios_log(sucesso);
CREATE INDEX IF NOT EXISTS idx_whatsapp_envios_log_created ON whatsapp_envios_log(created_at DESC);

-- RLS policies para admins
ALTER TABLE whatsapp_envios_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins visualizam logs de envio"
  ON whatsapp_envios_log
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operador'::app_role)
  );

CREATE POLICY "Sistema insere logs de envio"
  ON whatsapp_envios_log
  FOR INSERT
  WITH CHECK (true);