
-- Allow anon (public tracking page) to read ONLY the agendamento linked to an existing tracking session.
-- Without this policy, the customer's tracking link fails with "Erro ao carregar informações de rastreamento".
CREATE POLICY "Acesso publico agendamento via tracking"
ON public.agendamentos
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.tracking_sessions ts
    WHERE ts.agendamento_id = agendamentos.id
  )
);
