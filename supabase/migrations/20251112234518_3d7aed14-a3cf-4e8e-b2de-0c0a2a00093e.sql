-- Criar tabela de carrinhos abandonados
CREATE TABLE carrinhos_abandonados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados do Cliente
  nome_cliente TEXT,
  telefone TEXT,
  email TEXT,
  
  -- Endereço (se preenchido)
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  cep TEXT,
  
  -- Dados do Carrinho
  itens_carrinho JSONB NOT NULL,
  valor_total NUMERIC NOT NULL,
  
  -- Cupom (se aplicado)
  cupom_codigo TEXT,
  cupom_desconto_percentual NUMERIC,
  valor_desconto NUMERIC DEFAULT 0,
  
  -- Data selecionada (se escolhida)
  data_agendamento DATE,
  
  -- Tracking
  etapa_abandonada TEXT NOT NULL CHECK (etapa_abandonada IN ('carrinho', 'agendamento')),
  percentual_preenchimento INTEGER DEFAULT 0 CHECK (percentual_preenchimento >= 0 AND percentual_preenchimento <= 100),
  
  -- Sessão
  session_id TEXT NOT NULL,
  user_agent TEXT,
  
  -- Status de recuperação
  status TEXT DEFAULT 'abandonado' NOT NULL CHECK (status IN ('abandonado', 'contatado', 'recuperado', 'perdido')),
  tentativas_contato INTEGER DEFAULT 0,
  ultima_tentativa_contato TIMESTAMP WITH TIME ZONE,
  notas_internas TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_carrinhos_abandonados_status ON carrinhos_abandonados(status);
CREATE INDEX idx_carrinhos_abandonados_etapa ON carrinhos_abandonados(etapa_abandonada);
CREATE INDEX idx_carrinhos_abandonados_telefone ON carrinhos_abandonados(telefone);
CREATE INDEX idx_carrinhos_abandonados_session ON carrinhos_abandonados(session_id);
CREATE INDEX idx_carrinhos_abandonados_created ON carrinhos_abandonados(created_at DESC);
CREATE INDEX idx_carrinhos_abandonados_last_activity ON carrinhos_abandonados(last_activity DESC);

-- RLS Policies
ALTER TABLE carrinhos_abandonados ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT anônimo (tracking automático)
CREATE POLICY "Permitir INSERT anônimo em carrinhos_abandonados"
ON carrinhos_abandonados FOR INSERT
WITH CHECK (true);

-- Permitir UPDATE anônimo (tracking automático)
CREATE POLICY "Permitir UPDATE anônimo em carrinhos_abandonados"
ON carrinhos_abandonados FOR UPDATE
USING (true);

-- Admins e operadores gerenciam tudo
CREATE POLICY "Admins gerenciam carrinhos_abandonados"
ON carrinhos_abandonados FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_carrinhos_abandonados_updated_at
BEFORE UPDATE ON carrinhos_abandonados
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();