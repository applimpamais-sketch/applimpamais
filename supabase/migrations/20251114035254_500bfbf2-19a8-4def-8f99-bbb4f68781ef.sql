-- Criar tabela pixel_events
CREATE TABLE pixel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT,
  user_agent TEXT,
  page_url TEXT,
  referrer TEXT,
  
  -- Dados do evento
  value DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  content_name TEXT,
  content_type TEXT,
  contents JSONB,
  num_items INTEGER,
  
  -- Dados do pedido (para Purchase)
  order_id TEXT,
  
  -- Metadados
  device_type TEXT,
  browser TEXT,
  ip_address TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX idx_pixel_events_type ON pixel_events(event_type);
CREATE INDEX idx_pixel_events_time ON pixel_events(event_time DESC);
CREATE INDEX idx_pixel_events_session ON pixel_events(session_id);
CREATE INDEX idx_pixel_events_order ON pixel_events(order_id) WHERE order_id IS NOT NULL;

-- Habilitar realtime
ALTER TABLE pixel_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE pixel_events;

-- RLS policies
ALTER TABLE pixel_events ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT anônimo (para eventos do site)
CREATE POLICY "Permitir INSERT anônimo em pixel_events"
ON pixel_events FOR INSERT
WITH CHECK (true);

-- Permitir SELECT para admins
CREATE POLICY "Admins visualizam eventos"
ON pixel_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role) OR has_role(auth.uid(), 'visualizador'::app_role));