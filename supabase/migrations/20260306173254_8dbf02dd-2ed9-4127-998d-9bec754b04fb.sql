
-- Tabela para registrar envios à UTMify
CREATE TABLE public.utmify_envios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  status_enviado TEXT NOT NULL,
  utmify_response JSONB,
  sucesso BOOLEAN DEFAULT false,
  erro_mensagem TEXT,
  tenant_id UUID REFERENCES public.saas_tenants(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.utmify_envios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view utmify_envios"
  ON public.utmify_envios FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Index
CREATE INDEX idx_utmify_envios_agendamento ON public.utmify_envios(agendamento_id);
CREATE INDEX idx_utmify_envios_created ON public.utmify_envios(created_at DESC);

-- Trigger: auto-send to UTMify on status change
CREATE OR REPLACE FUNCTION public.trigger_send_utmify_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_api_token TEXT;
  v_integracao_id UUID;
  supabase_url TEXT;
  service_key TEXT;
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

  -- Call edge function via pg_net
  supabase_url := COALESCE(
    current_setting('app.settings.supabase_url', true),
    'https://yyrnshankehiqvkndrwk.supabase.co'
  );
  service_key := current_setting('app.settings.service_role_key', true);

  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-utmify-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_key, '')
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
$$;

CREATE TRIGGER trigger_utmify_on_status_change
  AFTER INSERT OR UPDATE OF status ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_send_utmify_order();
