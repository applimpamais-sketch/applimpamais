-- Criar função para gerar conversão automaticamente quando agendamento é inserido com parceiro_codigo
CREATE OR REPLACE FUNCTION criar_conversao_parceiro()
RETURNS TRIGGER AS $$
DECLARE
  v_parceiro_id uuid;
  v_parceiro_comissao numeric;
  v_link_id uuid;
BEGIN
  -- Apenas processar se tiver parceiro_codigo
  IF NEW.parceiro_codigo IS NULL OR NEW.parceiro_codigo = '' THEN
    RETURN NEW;
  END IF;

  -- Tentar encontrar parceiro por codigo de link especifico (ex: MARIA10-SOFA)
  SELECT pl.id, pl.parceiro_id INTO v_link_id, v_parceiro_id
  FROM parceiro_links pl
  WHERE pl.codigo = NEW.parceiro_codigo
    AND pl.status = 'ativo'
  LIMIT 1;

  -- Se nao encontrou link especifico, buscar pelo codigo principal do parceiro
  IF v_parceiro_id IS NULL THEN
    SELECT p.id, p.comissao_percentual INTO v_parceiro_id, v_parceiro_comissao
    FROM parceiros p
    WHERE p.codigo_referencia = SPLIT_PART(NEW.parceiro_codigo, '-', 1)
      AND p.status = 'ativo'
    LIMIT 1;
  ELSE
    -- Pegar comissao do parceiro dono do link
    SELECT p.comissao_percentual INTO v_parceiro_comissao
    FROM parceiros p
    WHERE p.id = v_parceiro_id;
  END IF;

  -- Se encontrou parceiro valido, criar conversao (evitar duplicatas)
  IF v_parceiro_id IS NOT NULL THEN
    INSERT INTO parceiro_conversoes (
      parceiro_id,
      link_id,
      agendamento_id,
      valor_agendamento,
      comissao_percentual,
      valor_comissao,
      status
    ) VALUES (
      v_parceiro_id,
      v_link_id,
      NEW.id,
      NEW.valor_total,
      COALESCE(v_parceiro_comissao, 10),
      NEW.valor_total * COALESCE(v_parceiro_comissao, 10) / 100,
      'pendente'
    )
    ON CONFLICT (agendamento_id) DO NOTHING;
    
    RAISE LOG '[criar_conversao_parceiro] Conversao criada para parceiro % agendamento %', v_parceiro_id, NEW.id;
  ELSE
    RAISE WARNING '[criar_conversao_parceiro] Parceiro nao encontrado para codigo: %', NEW.parceiro_codigo;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dropar trigger se existir e recriar
DROP TRIGGER IF EXISTS trigger_criar_conversao_parceiro ON agendamentos;

CREATE TRIGGER trigger_criar_conversao_parceiro
  AFTER INSERT ON agendamentos
  FOR EACH ROW
  WHEN (NEW.parceiro_codigo IS NOT NULL AND NEW.parceiro_codigo != '')
  EXECUTE FUNCTION criar_conversao_parceiro();

-- Atualizar função increment_link_cliques para melhor tratamento
CREATE OR REPLACE FUNCTION increment_link_cliques(link_codigo text)
RETURNS void AS $$
DECLARE
  v_rows_updated integer;
BEGIN
  -- Tentar atualizar link especifico
  UPDATE parceiro_links
  SET cliques = cliques + 1
  WHERE codigo = link_codigo AND status = 'ativo';
  
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  
  -- Se nao atualizou nenhum link, pode ser codigo principal do parceiro
  IF v_rows_updated = 0 THEN
    RAISE LOG '[increment_link_cliques] Codigo % nao encontrado em links, pode ser codigo principal do parceiro', link_codigo;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;