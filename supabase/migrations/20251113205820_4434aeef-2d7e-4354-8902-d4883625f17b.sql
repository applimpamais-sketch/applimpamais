-- Criar tabela live_sessions para rastreamento em tempo real
CREATE TABLE live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'BR',
  pagina_atual TEXT NOT NULL,
  etapa TEXT NOT NULL CHECK (etapa IN ('navegando', 'carrinho', 'checkout', 'concluido')),
  carrinho_items INTEGER DEFAULT 0,
  carrinho_valor DECIMAL DEFAULT 0,
  ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_live_sessions_session ON live_sessions(session_id);
CREATE INDEX idx_live_sessions_etapa ON live_sessions(etapa);
CREATE INDEX idx_live_sessions_atividade ON live_sessions(ultima_atividade);

-- Habilitar realtime na tabela
ALTER PUBLICATION supabase_realtime ADD TABLE live_sessions;

-- RLS Policies
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir e atualizar sessões (anônimo)
CREATE POLICY "Qualquer um pode inserir sessões"
  ON live_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar sessões"
  ON live_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Apenas admins podem visualizar sessões
CREATE POLICY "Admins visualizam todas as sessões"
  ON live_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role));