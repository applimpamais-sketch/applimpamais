
-- Remover policy duplicada e recriar
DROP POLICY IF EXISTS "carrinhos_staff_delete" ON public.carrinhos_abandonados;

-- Recriar DELETE policy
CREATE POLICY "carrinhos_staff_delete"
ON public.carrinhos_abandonados
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- Remover e recriar ALL policy para evitar conflito
DROP POLICY IF EXISTS "carrinhos_staff_manage" ON public.carrinhos_abandonados;

CREATE POLICY "carrinhos_staff_manage"
ON public.carrinhos_abandonados
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);
