-- 1. Adicionar coluna total_cliques na tabela parceiros
ALTER TABLE public.parceiros ADD COLUMN IF NOT EXISTS total_cliques INTEGER DEFAULT 0;

-- 2. Atualizar função increment_link_cliques para rastrear corretamente
CREATE OR REPLACE FUNCTION public.increment_link_cliques(link_codigo TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_link_id uuid;
  v_parceiro_id uuid;
  v_parceiro_code TEXT;
BEGIN
  -- Tentar encontrar link específico (ex: MARIA10-SOFA)
  SELECT id, parceiro_id INTO v_link_id, v_parceiro_id
  FROM parceiro_links
  WHERE codigo = link_codigo AND status = 'ativo';
  
  IF v_link_id IS NOT NULL THEN
    -- É um link específico: incrementar no link E no parceiro
    UPDATE parceiro_links SET cliques = cliques + 1 WHERE id = v_link_id;
    UPDATE parceiros SET total_cliques = COALESCE(total_cliques, 0) + 1 WHERE id = v_parceiro_id;
    RAISE LOG '[increment_link_cliques] Link específico %, parceiro %, cliques incrementados', link_codigo, v_parceiro_id;
  ELSE
    -- Não é link específico, tentar código principal do parceiro (ex: MARIA10)
    SELECT id INTO v_parceiro_id FROM parceiros 
    WHERE codigo_referencia = link_codigo AND status = 'ativo';
    
    IF v_parceiro_id IS NOT NULL THEN
      UPDATE parceiros SET total_cliques = COALESCE(total_cliques, 0) + 1 WHERE id = v_parceiro_id;
      RAISE LOG '[increment_link_cliques] Código principal %, parceiro %, cliques incrementados', link_codigo, v_parceiro_id;
    ELSE
      -- Tentar extrair código do parceiro (MARIA10-SOFA -> MARIA10)
      v_parceiro_code := SPLIT_PART(link_codigo, '-', 1);
      SELECT id INTO v_parceiro_id FROM parceiros 
      WHERE codigo_referencia = v_parceiro_code AND status = 'ativo';
      
      IF v_parceiro_id IS NOT NULL THEN
        UPDATE parceiros SET total_cliques = COALESCE(total_cliques, 0) + 1 WHERE id = v_parceiro_id;
        RAISE LOG '[increment_link_cliques] Código extraído % de %, parceiro %, cliques incrementados', v_parceiro_code, link_codigo, v_parceiro_id;
      ELSE
        RAISE WARNING '[increment_link_cliques] Nenhum parceiro encontrado para código: %', link_codigo;
      END IF;
    END IF;
  END IF;
END;
$$;

-- 3. Criar função para atualizar métricas do link quando conversão é criada
CREATE OR REPLACE FUNCTION public.atualizar_metricas_link()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ao inserir nova conversão, incrementar contador no link (se existir link_id)
  IF TG_OP = 'INSERT' AND NEW.link_id IS NOT NULL THEN
    UPDATE parceiro_links 
    SET 
      conversoes = COALESCE(conversoes, 0) + 1,
      receita_gerada = COALESCE(receita_gerada, 0) + COALESCE(NEW.valor_agendamento, 0)
    WHERE id = NEW.link_id;
    
    RAISE LOG '[atualizar_metricas_link] Link % atualizado: +1 conversão, +R$ %', NEW.link_id, NEW.valor_agendamento;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Criar trigger para atualizar métricas automaticamente
DROP TRIGGER IF EXISTS trigger_atualizar_metricas_link ON parceiro_conversoes;
CREATE TRIGGER trigger_atualizar_metricas_link
AFTER INSERT ON parceiro_conversoes
FOR EACH ROW EXECUTE FUNCTION atualizar_metricas_link();