-- Remover constraint antiga e adicionar nova com tipos adicionais
ALTER TABLE canais_empresa DROP CONSTRAINT IF EXISTS canais_empresa_tipo_check;

ALTER TABLE canais_empresa ADD CONSTRAINT canais_empresa_tipo_check 
CHECK (tipo IN ('instagram', 'google', 'blog', 'marketplace', 'email', 'outro', 'tiktok', 'youtube'));

-- Inserir novos canais
INSERT INTO canais_empresa (codigo, nome, tipo, status, total_cliques) VALUES 
('tiktok', 'Bio TikTok', 'tiktok', 'ativo', 0),
('youtube', 'Canal YouTube', 'youtube', 'ativo', 0);