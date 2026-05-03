-- Correção de Segurança: Function Search Path Mutable
-- Usar CREATE OR REPLACE para atualizar função com search_path

CREATE OR REPLACE FUNCTION update_soft_launch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;