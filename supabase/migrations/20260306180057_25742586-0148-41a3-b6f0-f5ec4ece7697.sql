
CREATE OR REPLACE FUNCTION public.trigger_send_utmify_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_api_token TEXT;
  v_integracao_id UUID;
  supabase_url TEXT;
  anon_key TEXT;
BEGIN
  -- Only on relevant status changes
  IF NEW.status NOT IN ('pendente', 'confirmado', 'pago', 'concluido') THEN
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Check if UTMify integration is active and has API token
  SELECT id, configuracao->>'api_token'
  INTO v_integracao_id, v_api_token
  FROM integracoes
  WHERE tipo = 'utmify' AND status = 'ativo'
  AND configuracao->>'api_token' IS NOT NULL
  LIMIT 1;

  IF v_api_token IS NULL THEN
    RETURN NEW;
  END IF;

  -- Use hardcoded values (anon key is public, not a secret)
  supabase_url := 'https://yyrnshankehiqvkndrwk.supabase.co';
  anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cm5zaGFua2VoaXF2a25kcndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzcxNTgsImV4cCI6MjA3ODExMzE1OH0.QsEdE5OsdSsD6cpuPyJy_K98bBDDzybyEN3CEr_eo-M';

  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-utmify-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key,
      'apikey', anon_key
    ),
    body := jsonb_build_object(
      'agendamento_id', NEW.id,
      'status', NEW.status,
      'api_token', v_api_token
    )
  );

  -- Update ultimo_uso
  UPDATE integracoes SET ultimo_uso = now() WHERE id = v_integracao_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[UTMify] Erro ao enviar: %', SQLERRM;
  RETURN NEW;
END;
$function$;
