-- Atualizar política de INSERT para permitir status 'ativo' no cadastro
DROP POLICY IF EXISTS "parceiros_public_insert" ON public.parceiros;
CREATE POLICY "parceiros_public_insert"
ON public.parceiros
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND nome IS NOT NULL
  AND email IS NOT NULL
  AND telefone IS NOT NULL
  AND codigo_referencia IS NOT NULL
  AND status IN ('ativo', 'pendente')
);