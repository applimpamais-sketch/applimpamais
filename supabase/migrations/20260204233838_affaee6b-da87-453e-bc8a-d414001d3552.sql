-- Create function to call OneSignal notification on new agendamento
CREATE OR REPLACE FUNCTION public.notify_new_agendamento_onesignal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Build payload for the edge function
  payload := jsonb_build_object(
    'tipo', 'novo_agendamento',
    'agendamento', jsonb_build_object(
      'id', NEW.id,
      'nome_cliente', NEW.nome_cliente,
      'valor_total', NEW.valor_total,
      'data_agendamento', NEW.data_agendamento,
      'endereco', NEW.endereco,
      'cidade', NEW.cidade
    )
  );

  -- Call edge function via pg_net (non-blocking)
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-onesignal-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to send OneSignal notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for new agendamentos
DROP TRIGGER IF EXISTS trigger_notify_new_agendamento_onesignal ON public.agendamentos;

CREATE TRIGGER trigger_notify_new_agendamento_onesignal
  AFTER INSERT ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_agendamento_onesignal();

-- Create function for payment confirmation notification
CREATE OR REPLACE FUNCTION public.notify_payment_confirmed_onesignal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Only trigger when status changes to 'pago'
  IF NEW.status = 'pago' AND (OLD.status IS NULL OR OLD.status != 'pago') THEN
    payload := jsonb_build_object(
      'tipo', 'pagamento_confirmado',
      'agendamento', jsonb_build_object(
        'id', NEW.id,
        'nome_cliente', NEW.nome_cliente,
        'valor_total', NEW.valor_total,
        'data_agendamento', NEW.data_agendamento
      )
    );

    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-onesignal-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := payload
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send OneSignal payment notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for payment confirmations
DROP TRIGGER IF EXISTS trigger_notify_payment_confirmed_onesignal ON public.agendamentos;

CREATE TRIGGER trigger_notify_payment_confirmed_onesignal
  AFTER UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_payment_confirmed_onesignal();