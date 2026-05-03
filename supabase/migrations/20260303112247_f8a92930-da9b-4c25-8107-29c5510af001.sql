-- Atualizar policy anon para usar o tenant operacional correto
DROP POLICY IF EXISTS "Anon can read active upsells" ON public.upsells;
CREATE POLICY "Anon can read active upsells"
ON public.upsells
FOR SELECT
TO anon
USING (ativo = true AND tenant_id = '2046cf1c-af8c-4e5e-b992-092ec922c35c');