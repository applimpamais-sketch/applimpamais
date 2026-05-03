-- Permitir leitura pública dos upsells ativos do tenant padrão
CREATE POLICY "Anon can read active upsells"
ON public.upsells
FOR SELECT
TO anon
USING (ativo = true AND tenant_id = '00000000-0000-0000-0000-000000000001');