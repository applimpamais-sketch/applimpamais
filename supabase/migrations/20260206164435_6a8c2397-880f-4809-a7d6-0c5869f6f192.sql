-- Adicionar colunas de origem do técnico na tabela tracking_sessions
ALTER TABLE tracking_sessions 
ADD COLUMN IF NOT EXISTS origem_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS origem_longitude DOUBLE PRECISION;

-- Comentários para documentação
COMMENT ON COLUMN tracking_sessions.origem_latitude IS 'Latitude do técnico no momento que iniciou o trajeto';
COMMENT ON COLUMN tracking_sessions.origem_longitude IS 'Longitude do técnico no momento que iniciou o trajeto';