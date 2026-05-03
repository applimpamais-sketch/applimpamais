-- Criar tabela para leads do white label
CREATE TABLE IF NOT EXISTS leads_white_label (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  empresa VARCHAR(255) NOT NULL,
  mensagem TEXT,
  origem VARCHAR(50) DEFAULT 'landing_page',
  status VARCHAR(20) DEFAULT 'novo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads_white_label ENABLE ROW LEVEL SECURITY;

-- Policy para permitir insert público (landing page)
CREATE POLICY "Permitir INSERT público em leads white label"
  ON leads_white_label
  FOR INSERT
  WITH CHECK (true);

-- Policy para admins e operadores visualizarem
CREATE POLICY "leads_white_label_staff_select"
  ON leads_white_label
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operador'::app_role) OR 
    has_role(auth.uid(), 'visualizador'::app_role)
  );

-- Policy para admins e operadores atualizarem
CREATE POLICY "leads_white_label_staff_update"
  ON leads_white_label
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operador'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'operador'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_leads_white_label_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_white_label_updated_at_trigger
  BEFORE UPDATE ON leads_white_label
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_white_label_updated_at();

-- Índices para performance
CREATE INDEX idx_leads_white_label_status ON leads_white_label(status);
CREATE INDEX idx_leads_white_label_created_at ON leads_white_label(created_at DESC);