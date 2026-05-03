-- Atualizar is_parceiro para incluir pendentes (podem acessar dashboard)
CREATE OR REPLACE FUNCTION public.is_parceiro(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parceiros 
    WHERE user_id = _user_id 
    AND status IN ('ativo', 'pendente')
  )
$$;

-- Nova funcao para verificar parceiro ATIVO (para operacoes restritas)
CREATE OR REPLACE FUNCTION public.is_parceiro_ativo(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parceiros 
    WHERE user_id = _user_id AND status = 'ativo'
  )
$$;

-- Atualizar politica de INSERT em parceiro_links para usar is_parceiro_ativo
DROP POLICY IF EXISTS "parceiro_links_own_insert" ON public.parceiro_links;
CREATE POLICY "parceiro_links_own_insert"
ON public.parceiro_links
FOR INSERT
TO authenticated
WITH CHECK (
  parceiro_id = get_parceiro_id(auth.uid()) 
  AND is_parceiro_ativo(auth.uid())
);

-- Atualizar politica de INSERT em parceiro_saques para usar is_parceiro_ativo
DROP POLICY IF EXISTS "parceiro_saques_own_insert" ON public.parceiro_saques;
CREATE POLICY "parceiro_saques_own_insert"
ON public.parceiro_saques
FOR INSERT
TO authenticated
WITH CHECK (
  parceiro_id = get_parceiro_id(auth.uid()) 
  AND is_parceiro_ativo(auth.uid())
);