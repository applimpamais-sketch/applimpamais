CREATE OR REPLACE FUNCTION public.trigger_enfileirar_avaliacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Quando status muda para 'concluido'
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    -- IGNORAR LOCAÇÕES: pesquisa de satisfação é apenas para higienizações
    IF COALESCE(NEW.is_locacao, false) = true THEN
      RAISE LOG '[trigger_enfileirar_avaliacao] Ignorado (locação) agendamento %', NEW.id;
      RETURN NEW;
    END IF;

    -- Verificar se já não existe avaliação pendente
    IF NOT EXISTS (
      SELECT 1 FROM public.fila_avaliacoes
      WHERE agendamento_id = NEW.id
    ) THEN
      INSERT INTO public.fila_avaliacoes (agendamento_id, telefone, nome_cliente)
      VALUES (NEW.id, NEW.telefone, NEW.nome_cliente);

      RAISE LOG '[trigger_enfileirar_avaliacao] Avaliação enfileirada para agendamento %', NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Limpar avaliações já enfileiradas (mas ainda não enviadas) para locações
UPDATE public.fila_avaliacoes f
SET status = 'cancelado'
FROM public.agendamentos a
WHERE f.agendamento_id = a.id
  AND f.status = 'pendente'
  AND COALESCE(a.is_locacao, false) = true;