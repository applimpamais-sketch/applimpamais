-- Migração: Tabelas para Soft Launch Bot WhatsApp
-- Data: 2024-12-24
-- Descrição: Criar tabelas para gerenciar soft launch com 50 clientes

-- Tabela para rastrear clientes do soft launch
CREATE TABLE IF NOT EXISTS soft_launch_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL UNIQUE,
  nome_cliente TEXT NOT NULL,
  data_inclusao TIMESTAMPTZ DEFAULT NOW(),
  motivo_inclusao TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  feedback_coletado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_soft_launch_clientes_telefone ON soft_launch_clientes(telefone);
CREATE INDEX IF NOT EXISTS idx_soft_launch_clientes_ativo ON soft_launch_clientes(ativo);
CREATE INDEX IF NOT EXISTS idx_soft_launch_clientes_data_inclusao ON soft_launch_clientes(data_inclusao);

-- Tabela para registrar feedback dos clientes
CREATE TABLE IF NOT EXISTS soft_launch_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL,
  nome_cliente TEXT,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  conversa_id UUID REFERENCES whatsapp_conversas(id) ON DELETE SET NULL,
  nota_geral INTEGER CHECK (nota_geral >= 1 AND nota_geral <= 5),
  facilidade_uso INTEGER CHECK (facilidade_uso >= 1 AND facilidade_uso <= 5),
  velocidade_resposta INTEGER CHECK (velocidade_resposta >= 1 AND velocidade_resposta <= 5),
  clareza_informacoes INTEGER CHECK (clareza_informacoes >= 1 AND clareza_informacoes <= 5),
  comentario_positivo TEXT,
  comentario_negativo TEXT,
  sugestao_melhoria TEXT,
  prefere_humano BOOLEAN,
  voltaria_usar BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para feedback
CREATE INDEX IF NOT EXISTS idx_soft_launch_feedback_telefone ON soft_launch_feedback(telefone);
CREATE INDEX IF NOT EXISTS idx_soft_launch_feedback_created ON soft_launch_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soft_launch_feedback_agendamento ON soft_launch_feedback(agendamento_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_soft_launch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_soft_launch_clientes_updated_at ON soft_launch_clientes;
CREATE TRIGGER update_soft_launch_clientes_updated_at
  BEFORE UPDATE ON soft_launch_clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_soft_launch_updated_at();

DROP TRIGGER IF EXISTS update_soft_launch_feedback_updated_at ON soft_launch_feedback;
CREATE TRIGGER update_soft_launch_feedback_updated_at
  BEFORE UPDATE ON soft_launch_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_soft_launch_updated_at();

-- RLS Policies
ALTER TABLE soft_launch_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE soft_launch_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Admin e operadores podem ver e gerenciar soft launch
CREATE POLICY "Admins e operadores gerenciam soft launch clientes"
  ON soft_launch_clientes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'operador')
    )
  );

CREATE POLICY "Admins e operadores gerenciam soft launch feedback"
  ON soft_launch_feedback
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'operador')
    )
  );

-- Comentários nas tabelas
COMMENT ON TABLE soft_launch_clientes IS 'Whitelist de clientes autorizados a usar o bot durante soft launch';
COMMENT ON TABLE soft_launch_feedback IS 'Feedback coletado dos clientes durante soft launch';

COMMENT ON COLUMN soft_launch_clientes.telefone IS 'Telefone do cliente no formato normalizado (ex: 5531999999999)';
COMMENT ON COLUMN soft_launch_clientes.ativo IS 'Se false, cliente não terá acesso ao bot mesmo estando na whitelist';
COMMENT ON COLUMN soft_launch_feedback.nota_geral IS 'Avaliação geral da experiência (1-5 estrelas)';
COMMENT ON COLUMN soft_launch_feedback.prefere_humano IS 'Se true, cliente prefere atendimento humano ao invés do bot';