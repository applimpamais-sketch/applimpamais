-- Tabela para armazenar push subscriptions dos usuários
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Push Subscription (JSON completo)
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL, -- Chave pública
  auth TEXT NOT NULL,   -- Token de autenticação
  
  -- Metadados
  user_agent TEXT,
  dispositivo TEXT, -- 'android' | 'ios' | 'desktop'
  ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_uso TIMESTAMP WITH TIME ZONE
);

-- RLS: Usuário só vê suas próprias subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_ativo ON push_subscriptions(ativo);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Trigger de atualização automática
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_push_subscription_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_updated_at();

-- Função para enviar push quando agendamento é concluído
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_agendamento_concluido_send_push ON agendamentos;
CREATE TRIGGER on_agendamento_concluido_send_push
  AFTER UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_push_on_agendamento_concluido();