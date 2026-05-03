-- Criar função para identificar gênero pelo nome
CREATE OR REPLACE FUNCTION public.identificar_genero(nome TEXT)
RETURNS TEXT
LANGUAGE plpgsql
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
  -- Extrair primeiro nome e converter para lowercase
  primeiro_nome := LOWER(TRIM(SPLIT_PART(nome, ' ', 1)));
  
  -- Verificar se é masculino
  IF primeiro_nome = ANY(nomes_masculinos) THEN
    RETURN 'masculino';
  END IF;
  
  -- Verificar se é feminino
  IF primeiro_nome = ANY(nomes_femininos) THEN
    RETURN 'feminino';
  END IF;
  
  -- Heurística: nomes terminados em 'a' geralmente são femininos
  IF primeiro_nome LIKE '%a' AND primeiro_nome NOT LIKE '%ria' THEN
    RETURN 'feminino';
  END IF;
  
  -- Caso não consiga identificar (usar valor aceito pelo constraint)
  RETURN 'nao_identificado';
END;
$$;

-- Criar trigger para preencher genero_cliente automaticamente
CREATE OR REPLACE FUNCTION public.auto_identificar_genero()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Preencher genero_cliente se estiver vazio
  IF NEW.genero_cliente IS NULL THEN
    NEW.genero_cliente := identificar_genero(NEW.nome_cliente);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_identificar_genero ON public.agendamentos;

CREATE TRIGGER trigger_auto_identificar_genero
  BEFORE INSERT OR UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION auto_identificar_genero();

-- Atualizar agendamentos existentes com gênero
UPDATE public.agendamentos
SET genero_cliente = identificar_genero(nome_cliente)
WHERE genero_cliente IS NULL;

-- Habilitar replicação completa para Realtime
ALTER TABLE public.agendamentos REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação realtime (se ainda não estiver)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'agendamentos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos;
  END IF;
END $$;