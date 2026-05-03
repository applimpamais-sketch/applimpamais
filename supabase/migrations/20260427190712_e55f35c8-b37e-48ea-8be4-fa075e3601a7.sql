CREATE OR REPLACE FUNCTION public.trigger_enfileirar_avaliacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Quando status muda para 'concluido', enfileirar avaliação
  -- Vale para HIGIENIZAÇÃO e LOCAÇÃO (mensagens diferentes são tratadas no process-avaliacao-queue)
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
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

-- Reativar pesquisas de locação canceladas nos últimos 7 dias
UPDATE public.fila_avaliacoes f
SET status = 'pendente'
FROM public.agendamentos a
WHERE f.agendamento_id = a.id
  AND f.status = 'cancelado'
  AND COALESCE(a.is_locacao, false) = true
  AND f.created_at > now() - interval '7 days';