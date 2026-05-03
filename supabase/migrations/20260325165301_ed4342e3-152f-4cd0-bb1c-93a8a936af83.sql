-- Function to auto-create reminders when agendamento is confirmed
CREATE OR REPLACE FUNCTION public.criar_lembretes_agendamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  data_servico DATE;
  lembrete_vespera TIMESTAMPTZ;
  lembrete_dia TIMESTAMPTZ;
BEGIN
  IF NEW.status NOT IN ('confirmado', 'pendente') THEN
    RETURN NEW;
  END IF;
  IF NEW.origem = 'google_calendar' THEN
    RETURN NEW;
  END IF;
  data_servico := NEW.data_agendamento::DATE;
  lembrete_vespera := (data_servico - INTERVAL '1 day') + INTERVAL '12 hours';
  lembrete_dia := data_servico + INTERVAL '10 hours';
  IF lembrete_vespera > NOW() THEN
    INSERT INTO whatsapp_lembretes (agendamento_id, tipo, agendado_para)
    VALUES (NEW.id, '1_dia_antes', lembrete_vespera)
    ON CONFLICT DO NOTHING;
  END IF;
  IF lembrete_dia > NOW() THEN
    INSERT INTO whatsapp_lembretes (agendamento_id, tipo, agendado_para)
    VALUES (NEW.id, 'dia_do_servico', lembrete_dia)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_criar_lembretes_insert ON agendamentos;
CREATE TRIGGER trigger_criar_lembretes_insert
  AFTER INSERT ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION criar_lembretes_agendamento();

DROP TRIGGER IF EXISTS trigger_criar_lembretes_update ON agendamentos;
CREATE TRIGGER trigger_criar_lembretes_update
  AFTER UPDATE OF status ON agendamentos
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'confirmado')
  EXECUTE FUNCTION criar_lembretes_agendamento();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_lembretes_unique_tipo'
  ) THEN
    ALTER TABLE whatsapp_lembretes ADD CONSTRAINT whatsapp_lembretes_unique_tipo 
    UNIQUE (agendamento_id, tipo);
  END IF;
END $$;