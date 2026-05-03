-- Criar tabela de sessões de rastreamento
CREATE TABLE public.tracking_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  tecnico_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_publico TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'em_rota' CHECK (status IN ('em_rota', 'chegou', 'servico_em_andamento', 'concluido', 'cancelado')),
  iniciado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  chegou_em TIMESTAMP WITH TIME ZONE,
  concluido_em TIMESTAMP WITH TIME ZONE,
  destino_latitude NUMERIC(10, 7),
  destino_longitude NUMERIC(10, 7),
  eta_minutos INTEGER,
  distancia_metros INTEGER,
  tecnico_nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de posições de rastreamento
CREATE TABLE public.tracking_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_session_id UUID NOT NULL REFERENCES public.tracking_sessions(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  velocidade NUMERIC(5, 2),
  precisao NUMERIC(6, 2),
  heading NUMERIC(5, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_tracking_sessions_token ON public.tracking_sessions(token_publico);
CREATE INDEX idx_tracking_sessions_agendamento ON public.tracking_sessions(agendamento_id);
CREATE INDEX idx_tracking_sessions_tecnico ON public.tracking_sessions(tecnico_id);
CREATE INDEX idx_tracking_sessions_status ON public.tracking_sessions(status);
CREATE INDEX idx_tracking_positions_session ON public.tracking_positions(tracking_session_id);
CREATE INDEX idx_tracking_positions_created ON public.tracking_positions(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_positions ENABLE ROW LEVEL SECURITY;

-- RLS para tracking_sessions
-- Técnicos podem ver e gerenciar suas próprias sessões
CREATE POLICY "Tecnicos podem ver suas sessoes"
  ON public.tracking_sessions
  FOR SELECT
  TO authenticated
  USING (tecnico_id = auth.uid());

CREATE POLICY "Tecnicos podem criar sessoes"
  ON public.tracking_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (tecnico_id = auth.uid());

CREATE POLICY "Tecnicos podem atualizar suas sessoes"
  ON public.tracking_sessions
  FOR UPDATE
  TO authenticated
  USING (tecnico_id = auth.uid());

-- Admins podem ver todas as sessões
CREATE POLICY "Admins podem ver todas sessoes"
  ON public.tracking_sessions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Acesso público via token (para página de rastreamento)
CREATE POLICY "Acesso publico via token"
  ON public.tracking_sessions
  FOR SELECT
  TO anon
  USING (true);

-- RLS para tracking_positions
-- Técnicos podem inserir posições em suas sessões
CREATE POLICY "Tecnicos podem inserir posicoes"
  ON public.tracking_positions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tracking_sessions ts 
      WHERE ts.id = tracking_session_id 
      AND ts.tecnico_id = auth.uid()
    )
  );

-- Técnicos podem ver posições de suas sessões
CREATE POLICY "Tecnicos podem ver suas posicoes"
  ON public.tracking_positions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tracking_sessions ts 
      WHERE ts.id = tracking_session_id 
      AND ts.tecnico_id = auth.uid()
    )
  );

-- Admins podem ver todas as posições
CREATE POLICY "Admins podem ver todas posicoes"
  ON public.tracking_positions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Acesso público via token (para página de rastreamento)
CREATE POLICY "Acesso publico posicoes via session"
  ON public.tracking_positions
  FOR SELECT
  TO anon
  USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tracking_sessions_updated_at
  BEFORE UPDATE ON public.tracking_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_positions;