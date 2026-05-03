-- Adicionar políticas RLS para o bucket de comprovantes de despesas

-- Permitir que admins e operadores visualizem todos os comprovantes
CREATE POLICY "Admins e operadores podem visualizar comprovantes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'comprovantes-despesas' AND
  (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'operador'::app_role)
  )
);

-- Permitir que admins e operadores façam upload de comprovantes
CREATE POLICY "Admins e operadores podem fazer upload de comprovantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprovantes-despesas' AND
  (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'operador'::app_role)
  )
);

-- Permitir que admins e operadores excluam comprovantes
CREATE POLICY "Admins e operadores podem excluir comprovantes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comprovantes-despesas' AND
  (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'operador'::app_role)
  )
);