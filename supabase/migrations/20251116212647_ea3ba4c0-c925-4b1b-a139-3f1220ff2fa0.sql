-- Tabela de logs de notificações push
CREATE TABLE IF NOT EXISTS push_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  agendamento_id UUID REFERENCES agendamentos(id),
  tipo_evento TEXT NOT NULL,
  
  -- Estatísticas de envio
  total_destinatarios INT NOT NULL DEFAULT 0,
  enviados_sucesso INT NOT NULL DEFAULT 0,
  enviados_falha INT NOT NULL DEFAULT 0,
  
  -- Breakdown por dispositivo
  enviados_android INT DEFAULT 0,
  enviados_ios INT DEFAULT 0,
  enviados_desktop INT DEFAULT 0,
  
  falhas_android INT DEFAULT 0,
  falhas_ios INT DEFAULT 0,
  falhas_desktop INT DEFAULT 0,
  
  -- Payload
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  payload JSONB,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_push_log_created ON push_notifications_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_log_tipo ON push_notifications_log(tipo_evento);

-- RLS para push_notifications_log
ALTER TABLE push_notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e operadores veem logs push"
  ON push_notifications_log
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role));

CREATE POLICY "Sistema cria logs push"
  ON push_notifications_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Tabela de preferências de notificações
CREATE TABLE IF NOT EXISTS push_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preferências por tipo de evento
  novo_agendamento BOOLEAN DEFAULT TRUE,
  agendamento_confirmado BOOLEAN DEFAULT TRUE,
  agendamento_concluido BOOLEAN DEFAULT TRUE,
  pagamento_recebido BOOLEAN DEFAULT TRUE,
  carrinho_abandonado BOOLEAN DEFAULT FALSE,
  problema_reportado BOOLEAN DEFAULT TRUE,
  meta_atingida BOOLEAN DEFAULT TRUE,
  
  -- Horários permitidos
  horario_inicio TIME DEFAULT '08:00:00',
  horario_fim TIME DEFAULT '22:00:00',
  permitir_final_semana BOOLEAN DEFAULT TRUE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para preferências
ALTER TABLE push_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON push_notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_push_preferences_updated_at
  BEFORE UPDATE ON push_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar preferências padrão
CREATE OR REPLACE FUNCTION create_default_push_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO push_notification_preferences (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar preferências quando criar subscription
CREATE TRIGGER on_push_subscription_create_preferences
  AFTER INSERT ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION create_default_push_preferences();