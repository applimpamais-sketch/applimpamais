-- Corrigir security warnings: adicionar search_path às funções

-- 1. Atualizar função update_push_subscription_updated_at
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Atualizar função trigger_send_push_on_agendamento_concluido
CREATE OR REPLACE FUNCTION trigger_send_push_on_agendamento_concluido()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
BEGIN
  -- Apenas quando muda para concluído
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    -- Construir URL da edge function
    function_url := current_setting('app.settings')::json->>'api_url' || '/functions/v1/send-push-notification';
    
    -- Chamar edge function de forma assíncrona usando pg_net (se disponível)
    -- ou usando HTTP POST
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings')::json->>'service_role_key'
      ),
      body := jsonb_build_object(
        'agendamento_id', NEW.id,
        'tipo', 'novo_agendamento'
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Logar erro mas não bloquear a transação
  RAISE WARNING 'Erro ao enviar push notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;