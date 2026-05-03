-- Correcao #1: Criar policy DELETE para parceiro_links
-- Permite que parceiros deletem seus proprios links

CREATE POLICY "parceiro_links_own_delete" 
ON public.parceiro_links
FOR DELETE 
TO authenticated
USING (
  parceiro_id = get_parceiro_id(auth.uid()) 
  AND is_parceiro_ativo(auth.uid())
);