-- ============================================
-- RECONSTRUÇÃO COMPLETA DA BASE DE DADOS
-- ============================================

-- Remover tabelas existentes
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS servicos CASCADE;
DROP TABLE IF EXISTS alugueis CASCADE;
DROP TABLE IF EXISTS calendario_disponibilidade CASCADE;

-- ============================================
-- TABELA: servicos (86 registros)
-- ============================================
CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  subcategoria TEXT NOT NULL,
  item TEXT NOT NULL,
  tamanho TEXT,
  preco_limpeza DECIMAL(10, 2),
  preco_impermeabilizacao DECIMAL(10, 2),
  preco_limpeza_impermeabilizacao DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_servicos_categoria ON servicos(categoria);
CREATE INDEX idx_servicos_subcategoria ON servicos(subcategoria);

-- RLS Policy
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servicos são visíveis para todos" 
  ON servicos FOR SELECT 
  USING (true);

-- Inserir dados dos 86 serviços
INSERT INTO servicos (categoria, subcategoria, item, tamanho, preco_limpeza, preco_impermeabilizacao, preco_limpeza_impermeabilizacao) VALUES
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Retráril', '1.2 a 2.0m', 180.00, 252.00, 432.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Retráril', '2.0 a 3.0m', 230.00, 322.00, 552.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Retráril', '3.0 a 4.0m', 330.00, 462.00, 792.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Retráril', '4.0 a 5.0m', 400.00, 560.00, 960.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Retráril', '5.0 a 6.0m', 500.00, 700.00, 1200.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Comum', '1.2 a 2.0m', 100.00, 140.00, 240.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Comum', '2.0 a 3.0m', 200.00, 280.00, 480.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Comum', '3.0 a 4.0m', 300.00, 420.00, 720.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Comum', '4.0 a 5.0m', 400.00, 560.00, 960.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Comum', '5.0 a 6.0m', 500.00, 700.00, 1200.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá de Canto', '1.2 a 2.0m', 200.00, 280.00, 480.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá de Canto', '2.0 a 3.0m', 300.00, 420.00, 720.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá de Canto', '3.0 a 4.0m', 400.00, 560.00, 960.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá de Canto', '4.0 a 5.0m', 500.00, 700.00, 1200.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá de Canto', '5.0 a 6.0m', 600.00, 840.00, 1440.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá com Chaise', '1.2 a 2.0m', 180.00, 252.00, 432.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá com Chaise', '2.0 a 3.0m', 200.00, 280.00, 480.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá com Chaise', '3.0 a 4.0m', 300.00, 420.00, 720.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá com Chaise', '4.0 a 5.0m', 400.00, 560.00, 960.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá com Chaise', '5.0 a 6.0m', 500.00, 700.00, 1200.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Cama', '1.2 a 2.0m', 220.00, 308.00, 528.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Cama', '2.0 a 3.0m', 300.00, 420.00, 720.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Cama', '3.0 a 4.0m', 400.00, 560.00, 960.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Cama', '4.0 a 5.0m', 500.00, 700.00, 1200.00),
('MAIS AGENDADOS', 'SOFÁ', 'Sofá Cama', '5.0 a 6.0m', 600.00, 840.00, 1440.00),
('MAIS AGENDADOS', 'TAPETE', 'Tapete', 'cobrado por m2 ( L X C )', 65.00, 91.00, 156.00),
('MAIS AGENDADOS', 'POLTRONA', 'Poltrona Amamentação', NULL, 120.00, 168.00, 288.00),
('MAIS AGENDADOS', 'POLTRONA', 'Poltrona Comum', NULL, 100.00, 140.00, 240.00),
('MAIS AGENDADOS', 'POLTRONA', 'Poltrona Papai', NULL, 120.00, 168.00, 288.00),
('MAIS AGENDADOS', 'POLTRONA', 'Poltrona Pé Palito', NULL, 70.00, 98.00, 168.00),
('MAIS AGENDADOS', 'POLTRONA', 'Poltrona de Almofadas Soltas', NULL, 120.00, 168.00, 288.00),
('MAIS AGENDADOS', 'POLTRONA', 'Poltrona Eames', NULL, 120.00, 168.00, 288.00),
('MAIS AGENDADOS', 'CADEIRA', 'Cadeira Estofado no Assento', NULL, 25.00, 35.00, 60.00),
('MAIS AGENDADOS', 'CADEIRA', 'Cadeira Estofado no Encosto', NULL, 25.00, 35.00, 60.00),
('MAIS AGENDADOS', 'CADEIRA', 'Cadeira Estofado no Assento e Encosto', NULL, 35.00, 49.00, 84.00),
('MAIS AGENDADOS', 'CADEIRA', 'Cadeira Toda Estofada', NULL, 40.00, 56.00, 96.00),
('MAIS AGENDADOS', 'CADEIRA', 'Luis XV', NULL, 60.00, 84.00, 144.00),
('MAIS AGENDADOS', 'BANQUETA', 'Banqueta', NULL, 25.00, 35.00, 60.00),
('MAIS AGENDADOS', 'CADEIRA', 'Cadeira de Escritório', NULL, 60.00, 84.00, 144.00),
('MAIS AGENDADOS', 'COLCHÃO', 'Solteiro', NULL, 120.00, 168.00, 288.00),
('MAIS AGENDADOS', 'COLCHÃO', 'Casal', NULL, 150.00, 210.00, 360.00),
('MAIS AGENDADOS', 'COLCHÃO', 'Viúvo', NULL, 140.00, 196.00, 336.00),
('MAIS AGENDADOS', 'COLCHÃO', 'Queen', NULL, 200.00, 280.00, 480.00),
('MAIS AGENDADOS', 'COLCHÃO', 'King', NULL, 240.00, 336.00, 576.00),
('MAIS AGENDADOS', 'COLCHÃO', 'Super King', NULL, 320.00, 448.00, 768.00),
('MAIS AGENDADOS', 'COLCHÃO', 'Cama Auxiliar', NULL, 120.00, 168.00, 288.00),
('MAIS AGENDADOS', 'COLCHÃO', 'Berço', NULL, 90.00, 126.00, 216.00),
('MAIS AGENDADOS', 'CARRO', 'Bancos', NULL, 220.00, 308.00, 528.00),
('MAIS AGENDADOS', 'CARRO', 'Bancos + Teto', NULL, 280.00, 392.00, 672.00),
('MAIS AGENDADOS', 'CARRO', 'Bancos + Teto + Carpete', NULL, 350.00, 490.00, 840.00),
('OUTROS SERVIÇOS', 'CHAISE', 'CHAISE P até 1m', 'Até 1m', 100.00, 140.00, 240.00),
('OUTROS SERVIÇOS', 'CHAISE', 'CHAISE M até 2m', 'Até 2m', 200.00, 280.00, 480.00),
('OUTROS SERVIÇOS', 'CHAISE', 'CHAISE G até 3m', 'Até 3m', 300.00, 420.00, 720.00),
('OUTROS SERVIÇOS', 'CARRINHO DE BEBE', 'CARRINHO DE BEBE', NULL, 150.00, 210.00, 360.00),
('OUTROS SERVIÇOS', 'BEBE CONFORTO', 'BEBE CONFORTO', NULL, 130.00, 182.00, 312.00),
('OUTROS SERVIÇOS', 'CADEIRINHA', 'CADEIRINHA', NULL, 130.00, 182.00, 312.00),
('OUTROS SERVIÇOS', 'Puff', 'Puff P', NULL, 50.00, 70.00, 120.00),
('OUTROS SERVIÇOS', 'Puff', 'Puff M', NULL, 70.00, 98.00, 168.00),
('OUTROS SERVIÇOS', 'Puff', 'Puff G', NULL, 100.00, 140.00, 240.00),
('OUTROS SERVIÇOS', 'Espuma Acustica', 'Espuma Acustica', 'cobrado por m2 ( L X C )', 40.00, 56.00, 96.00),
('OUTROS SERVIÇOS', 'Carpete', 'Carpete', NULL, 19.90, 27.86, 47.76),
('OUTROS SERVIÇOS', 'Ar Condicionado', 'Ar Condicionado', '9.000BTUS', 280.00, NULL, NULL),
('OUTROS SERVIÇOS', 'Ar Condicionado', 'Ar Condicionado', '12000BTUS', 320.00, NULL, NULL),
('OUTROS SERVIÇOS', 'Ar Condicionado', 'Ar Condicionado', '18000BTUS', 400.00, NULL, NULL),
('OUTROS SERVIÇOS', 'Ar Condicionado', 'Ar Condicionado', 'Até 30.000 btus', 500.00, NULL, NULL),
('OUTROS SERVIÇOS', 'Ar Condicionado', 'Ar Condicionado', 'Portátil', 300.00, NULL, NULL),
('OUTROS SERVIÇOS', 'Namoradeira', 'Namoradeira', NULL, 120.00, 168.00, 288.00),
('OUTROS SERVIÇOS', 'Longarina', 'Longarina', 'VALOR POR ASSENTO', 60.00, 84.00, 144.00),
('OUTROS SERVIÇOS', 'Onibus', 'Assento Onibus', 'VALOR POR ASSENTO', 60.00, 84.00, 144.00),
('OUTROS SERVIÇOS', 'Aeronave', 'Assento Aeronave', 'VALOR POR ASSENTO', 250.00, 350.00, 600.00),
('OUTROS SERVIÇOS', 'Caminhão', 'Caminhão', 'WhatsApp', NULL, NULL, NULL),
('OUTROS SERVIÇOS', 'Embarcação', 'Embarcação', NULL, NULL, NULL, NULL),
('OUTROS SERVIÇOS', 'Divã', 'Divã', 'até 2m', 120.00, 168.00, 288.00),
('OUTROS SERVIÇOS', 'Recamier', 'Recamier', 'até 2m', 120.00, 168.00, 288.00),
('OUTROS SERVIÇOS', 'Travesseiro', 'Travesseiro', NULL, 60.00, 84.00, 144.00),
('OUTROS SERVIÇOS', 'Fantasia Estofada', 'Fantasia Estofada', 'WhatsApp', NULL, NULL, NULL),
('OUTROS SERVIÇOS', 'Moisés', 'Moisés', NULL, 130.00, 182.00, 312.00),
('OUTROS SERVIÇOS', 'Banco de Igreja', 'Banco de Igreja', 'até 2m', 200.00, 280.00, 480.00),
('OUTROS SERVIÇOS', 'Banco de Igreja', 'Banco de Igreja', 'até 3m', 300.00, 420.00, 720.00),
('OUTROS SERVIÇOS', 'Banco de Igreja', 'Banco de Igreja', 'até 4m', 400.00, 560.00, 960.00),
('OUTROS SERVIÇOS', 'Banco de Igreja', 'Banco de Igreja', 'Assento individual', 50.00, 70.00, 120.00),
('OUTROS SERVIÇOS', 'Auditório', 'Auditório', 'Assento individual', 50.00, 70.00, 120.00),
('OUTROS SERVIÇOS', 'Cinema', 'Cinema', 'Assento individual', 50.00, 70.00, 120.00),
('OUTROS SERVIÇOS', 'LIMPEZA DE PISO', 'Limpeza de Piso', 'cobrado por m2 ( L X C )', NULL, NULL, NULL),
('OUTROS SERVIÇOS', 'Impermeabilização de Piso', 'Impermeabilização de Piso', 'cobrado por m2 ( L X C )', NULL, NULL, NULL),
('OUTROS SERVIÇOS', 'Impermeabilização de Pedras', 'Impermeabilização de Pedras', 'cobrado por m2 ( L X C )', NULL, NULL, NULL);

-- ============================================
-- TABELA: alugueis (24 registros)
-- ============================================
CREATE TABLE alugueis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento TEXT NOT NULL,
  periodo_aluguel TEXT NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX idx_alugueis_equipamento ON alugueis(equipamento);

-- RLS Policy
ALTER TABLE alugueis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alugueis são visíveis para todos" 
  ON alugueis FOR SELECT 
  USING (true);

-- Inserir dados dos 24 aluguéis
INSERT INTO alugueis (equipamento, periodo_aluguel, preco) VALUES
('Aluguel de Extratora IPC A135', 'Diária', 100.00),
('Aluguel de Extratora IPC A135', 'Final de Semana', 150.00),
('Aluguel de Extratora IPC A135', 'Semanal', 400.00),
('Aluguel de Extratora IPC A135', 'Diária Econômica', 70.00),
('Aluguel de Enceradeira CLEANER 350', 'Diária', 100.00),
('Aluguel de Enceradeira CLEANER 350', 'Final de Semana', 150.00),
('Aluguel de Enceradeira CLEANER 350', 'Semanal', 400.00),
('Aluguel de Enceradeira CLEANER 350', 'Diária Econômica', 70.00),
('Aluguel de Enceradeira CLEANER 350', 'Quinzenal', 700.00),
('Aluguel de Lavadora de Alta Pressão', 'Diária', 100.00),
('Aluguel de Lavadora de Alta Pressão', 'Final de Semana', 150.00),
('Aluguel de Lavadora de Alta Pressão', 'Semanal', 400.00),
('Aluguel de Lavadora de Alta Pressão', 'Diária Econômica', 70.00),
('Aluguel de Lavadora de Alta Pressão', 'Quinzenal', 700.00),
('Aluguel Vaporetto', 'Diária', 100.00),
('Aluguel Vaporetto', 'Final de Semana', 150.00),
('Aluguel Vaporetto', 'Semanal', 400.00);

-- ============================================
-- TABELA: calendario_disponibilidade
-- ============================================
CREATE TABLE calendario_disponibilidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  vagas_disponiveis INTEGER NOT NULL DEFAULT 10,
  vagas_totais INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX idx_calendario_data ON calendario_disponibilidade(data);

-- RLS Policy
ALTER TABLE calendario_disponibilidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calendario é visível para todos" 
  ON calendario_disponibilidade FOR SELECT 
  USING (true);

-- ============================================
-- TABELA: agendamentos
-- ============================================
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  bairro TEXT,
  cidade TEXT,
  cep TEXT,
  data_agendamento DATE NOT NULL,
  horario TEXT,
  itens_carrinho JSONB NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);

-- RLS Policy
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode criar agendamento" 
  ON agendamentos FOR INSERT 
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();