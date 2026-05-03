-- Função para incrementar cliques em links de parceiros
CREATE OR REPLACE FUNCTION public.increment_link_cliques(link_codigo TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Primeiro tentar atualizar link específico
  UPDATE public.parceiro_links
  SET cliques = cliques + 1
  WHERE codigo = link_codigo AND status = 'ativo';
  
  -- Se não atualizou nenhum, pode ser código do parceiro principal
  -- Criar um link principal se não existir? Por enquanto, apenas ignora
END;
$$;