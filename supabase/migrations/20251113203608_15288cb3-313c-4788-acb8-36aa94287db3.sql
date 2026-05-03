-- Tabela principal de integrações
CREATE TABLE integracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('facebook', 'webhook', 'whatsapp')),
  nome TEXT NOT NULL,
  configuracao JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'erro')),
  ultimo_uso TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_integracoes_updated_at
BEFORE UPDATE ON integracoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Logs de webhooks
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES integracoes(id) ON DELETE CASCADE,
  evento TEXT NOT NULL,
  payload JSONB NOT NULL,
  resposta_status INTEGER,
  resposta_body TEXT,
  sucesso BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Números WhatsApp
CREATE TABLE whatsapp_numeros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  nome_negocio TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'conectado', 'desconectado', 'erro')),
  qr_code TEXT,
  session_data JSONB,
  ultimo_uso TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies para integracoes
ALTER TABLE integracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam integracoes"
  ON integracoes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Operadores visualizam integracoes"
  ON integracoes FOR SELECT
  USING (has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role));

-- RLS Policies para webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e operadores veem logs"
  ON webhook_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role));

-- RLS Policies para whatsapp_numeros
ALTER TABLE whatsapp_numeros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam whatsapp"
  ON whatsapp_numeros FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Operadores visualizam whatsapp"
  ON whatsapp_numeros FOR SELECT
  USING (has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role));