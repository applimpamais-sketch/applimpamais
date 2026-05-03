-- Corrigir search_path para identificar_genero
CREATE OR REPLACE FUNCTION public.identificar_genero(nome TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  primeiro_nome TEXT;
  nomes_masculinos TEXT[] := ARRAY[
    'joão', 'jose', 'carlos', 'paulo', 'pedro', 'lucas', 'marcos', 'fernando',
    'rafael', 'bruno', 'rodrigo', 'felipe', 'eduardo', 'gabriel', 'mateus',
    'thiago', 'gustavo', 'leonardo', 'diego', 'henrique', 'andre', 'guilherme',
    'marcelo', 'vinicius', 'fabio', 'ricardo', 'cesar', 'alex', 'daniel',
    'antonio', 'francisco', 'manuel', 'miguel', 'sergio', 'roberto', 'mario'
  ];
  nomes_femininos TEXT[] := ARRAY[
    'maria', 'ana', 'joana', 'carla', 'paula', 'lucia', 'juliana', 'fernanda',
    'amanda', 'beatriz', 'camila', 'daniela', 'gabriela', 'helena', 'isabela',
    'jessica', 'karen', 'larissa', 'mariana', 'natalia', 'patricia', 'rafaela',
    'sabrina', 'tatiana', 'vanessa', 'bruna', 'cristina', 'debora', 'eliane',
    'fabiana', 'gisele', 'ingrid', 'julia', 'kelly', 'leticia'
  ];
BEGIN
  primeiro_nome := LOWER(TRIM(SPLIT_PART(nome, ' ', 1)));
  
  IF primeiro_nome = ANY(nomes_masculinos) THEN
    RETURN 'masculino';
  END IF;
  
  IF primeiro_nome = ANY(nomes_femininos) THEN
    RETURN 'feminino';
  END IF;
  
  IF primeiro_nome LIKE '%a' AND primeiro_nome NOT LIKE '%ria' THEN
    RETURN 'feminino';
  END IF;
  
  RETURN 'nao_identificado';
END;
$$;

-- Corrigir search_path para auto_identificar_genero
CREATE OR REPLACE FUNCTION public.auto_identificar_genero()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.genero_cliente IS NULL THEN
    NEW.genero_cliente := identificar_genero(NEW.nome_cliente);
  END IF;
  
  RETURN NEW;
END;
$$;