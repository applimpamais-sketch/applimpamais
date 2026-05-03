-- Criar bucket para comprovantes de saques de parceiros
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprovantes-saques', 'comprovantes-saques', false)
ON CONFLICT (id) DO NOTHING;

-- Policy para admins fazerem upload
CREATE POLICY "Admins podem fazer upload de comprovantes de saques"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'comprovantes-saques' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy para admins visualizarem comprovantes
CREATE POLICY "Admins podem visualizar comprovantes de saques"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'comprovantes-saques'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy para parceiros visualizarem seus próprios comprovantes
CREATE POLICY "Parceiros podem ver seus comprovantes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'comprovantes-saques'
  AND EXISTS (
    SELECT 1 FROM public.parceiro_saques ps
    JOIN public.parceiros p ON ps.parceiro_id = p.id
    WHERE p.user_id = auth.uid()
    AND storage.filename(name) LIKE ps.id || '%'
  )
);