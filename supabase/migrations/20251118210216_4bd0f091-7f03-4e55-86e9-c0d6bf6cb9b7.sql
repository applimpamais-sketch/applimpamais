-- Fase 1: Corrigir policy de INSERT em agendamentos
DROP POLICY IF EXISTS "Allow public booking creation" ON agendamentos;

CREATE POLICY "Allow public booking creation"
  ON agendamentos
  FOR INSERT
  TO public
  WITH CHECK (
    nome_cliente IS NOT NULL 
    AND telefone IS NOT NULL 
    AND endereco IS NOT NULL 
    AND data_agendamento IS NOT NULL 
    AND itens_carrinho IS NOT NULL 
    AND valor_total IS NOT NULL
  );

-- Fase 2: Adicionar logging para debug
CREATE OR REPLACE FUNCTION log_agendamento_insert_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RAISE LOG 'Tentativa de INSERT em agendamentos: role=%, user=%, nome=%',
    current_user,
    auth.uid(),
    NEW.nome_cliente;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_agendamento_insert ON agendamentos;
CREATE TRIGGER log_agendamento_insert
  BEFORE INSERT ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION log_agendamento_insert_attempt();

-- Fase 3: Corrigir outras tabelas públicas
-- 3.1 leads_cupom
DROP POLICY IF EXISTS "Permitir INSERT público em leads" ON leads_cupom;

CREATE POLICY "Permitir INSERT público em leads"
  ON leads_cupom
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 3.2 carrinhos_abandonados
DROP POLICY IF EXISTS "Allow anonymous insert abandoned carts" ON carrinhos_abandonados;

CREATE POLICY "Allow anonymous insert abandoned carts"
  ON carrinhos_abandonados
  FOR INSERT
  TO public
  WITH CHECK (
    session_id IS NOT NULL 
    AND itens_carrinho IS NOT NULL
  );

-- 3.3 live_sessions
DROP POLICY IF EXISTS "live_sessions_anon_insert" ON live_sessions;

CREATE POLICY "live_sessions_public_insert"
  ON live_sessions
  FOR INSERT
  TO public
  WITH CHECK (session_id IS NOT NULL);

-- 3.4 pixel_events
DROP POLICY IF EXISTS "pixel_events_anon_insert" ON pixel_events;

CREATE POLICY "pixel_events_public_insert"
  ON pixel_events
  FOR INSERT
  TO public
  WITH CHECK (true);