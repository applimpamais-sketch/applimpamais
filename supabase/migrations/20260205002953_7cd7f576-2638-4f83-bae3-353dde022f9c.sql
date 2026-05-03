-- ============================================================================
-- Push Notifications: Triggers para Novos Agendamentos e Pagamentos
-- ============================================================================

-- Tabela de logs de push (se não existir)
CREATE TABLE IF NOT EXISTS push_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  agendamento_id uuid REFERENCES agendamentos(id) ON DELETE SET NULL,
  sucesso integer DEFAULT 0,
  falha integer DEFAULT 0,
  dispositivos jsonb,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE push_logs ENABLE ROW LEVEL SECURITY;

-- Política: apenas admins podem ver logs
CREATE POLICY "Admins podem ver push_logs" ON push_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- Trigger 1: Novos Agendamentos (INSERT)
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_send_push_on_new_agendamento()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Obter configurações
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);
  
  -- Fallback para URL hardcoded se settings não disponíveis
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'https://yyrnshankehiqvkndrwk.supabase.co';
  END IF;
  
  -- Chamar edge function para novo agendamento
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_key, '')
    ),
    body := jsonb_build_object(
      'agendamento_id', NEW.id,
      'tipo', 'novo_agendamento',
      'agendamento', row_to_json(NEW)
    )
  );
  
  RAISE LOG '[PUSH] Novo agendamento: % - Notificação enviada', NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[PUSH] Erro ao enviar notificação para novo agendamento %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para INSERT
DROP TRIGGER IF EXISTS on_new_agendamento_send_push ON agendamentos;
CREATE TRIGGER on_new_agendamento_send_push
  AFTER INSERT ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_push_on_new_agendamento();

-- ============================================================================
-- Trigger 2: Pagamento Recebido (UPDATE para pago/concluido)
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_send_push_on_pagamento_recebido()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Apenas quando status muda para 'pago' ou 'concluido'
  IF NEW.status IN ('pago', 'concluido') AND (OLD.status IS NULL OR OLD.status NOT IN ('pago', 'concluido')) THEN
    -- Obter configurações
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_key := current_setting('app.settings.service_role_key', true);
    
    -- Fallback para URL hardcoded se settings não disponíveis
    IF supabase_url IS NULL OR supabase_url = '' THEN
      supabase_url := 'https://yyrnshankehiqvkndrwk.supabase.co';
    END IF;
    
    -- Chamar edge function para pagamento recebido
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(service_key, '')
      ),
      body := jsonb_build_object(
        'agendamento_id', NEW.id,
        'tipo', 'pagamento_recebido',
        'agendamento', row_to_json(NEW)
      )
    );
    
    RAISE LOG '[PUSH] Pagamento recebido: % - Notificação enviada', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[PUSH] Erro ao enviar notificação de pagamento %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para UPDATE
DROP TRIGGER IF EXISTS on_pagamento_recebido_send_push ON agendamentos;
CREATE TRIGGER on_pagamento_recebido_send_push
  AFTER UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_push_on_pagamento_recebido();