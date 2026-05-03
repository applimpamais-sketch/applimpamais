-- Adicionar policies para técnicos gerenciarem pagamentos
CREATE POLICY "Tecnicos registram pagamentos"
ON pagamentos_agendamentos FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'tecnico'::app_role) 
  AND EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE id = agendamento_id 
    AND tecnico_id = auth.uid()
  )
);

CREATE POLICY "Tecnicos veem seus pagamentos"
ON pagamentos_agendamentos FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'tecnico'::app_role) 
  AND EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE id = agendamento_id 
    AND tecnico_id = auth.uid()
  )
);