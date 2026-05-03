
CREATE TABLE public.whatsapp_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_type text NOT NULL DEFAULT 'bot',
  instance_id text,
  status text NOT NULL DEFAULT 'unknown',
  substatus text,
  latency_ms integer,
  is_healthy boolean NOT NULL DEFAULT false,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index para buscar último check por tipo
CREATE INDEX idx_whatsapp_health_checks_type_created 
  ON public.whatsapp_health_checks (instance_type, created_at DESC);

-- Limpar registros antigos (manter 7 dias)
CREATE INDEX idx_whatsapp_health_checks_created 
  ON public.whatsapp_health_checks (created_at);

-- RLS
ALTER TABLE public.whatsapp_health_checks ENABLE ROW LEVEL SECURITY;

-- Admins podem ler
CREATE POLICY "Admins can read health checks"
  ON public.whatsapp_health_checks
  FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin(auth.uid())
  );

-- Edge functions podem inserir (via service role, sem RLS)
-- Habilitar realtime para alertas
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_health_checks;
