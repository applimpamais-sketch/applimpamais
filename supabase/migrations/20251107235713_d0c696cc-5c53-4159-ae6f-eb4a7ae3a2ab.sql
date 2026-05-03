-- Remover política existente que está causando problema
DROP POLICY IF EXISTS "Qualquer pessoa pode criar agendamento" ON agendamentos;

-- Recriar como PERMISSIVE explicitamente para INSERT
CREATE POLICY "Permitir INSERT anônimo em agendamentos"
  ON agendamentos
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Adicionar política de SELECT para visualização futura
CREATE POLICY "Permitir SELECT anônimo em agendamentos"
  ON agendamentos
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (true);