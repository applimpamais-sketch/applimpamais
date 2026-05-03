-- =============================================
-- FASE 1-2: Tabelas para automação do Bot WhatsApp
-- =============================================

-- Tabela para fila de avaliações pós-venda
CREATE TABLE IF NOT EXISTS public.fila_avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  telefone TEXT NOT NULL,
  nome_cliente TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  enviado_em TIMESTAMPTZ,
  respondido_em TIMESTAMPTZ,
  nota INTEGER,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela para fila de notificações para técnicos
CREATE TABLE IF NOT EXISTS public.fila_notificacoes_tecnico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tecnico_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'novo_servico', 'reatribuicao', 'rota_diaria'
  status TEXT NOT NULL DEFAULT 'pendente',
  enviado_em TIMESTAMPTZ,
  erro_mensagem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar coluna para tipo de última mensagem em carrinhos
ALTER TABLE public.carrinhos_abandonados
ADD COLUMN IF NOT EXISTS tipo_ultima_mensagem TEXT;

-- Comentário: 'padrao', 'com_cupom', 'oferta_final'

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.fila_avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fila_notificacoes_tecnico ENABLE ROW LEVEL SECURITY;

-- Políticas para fila_avaliacoes (apenas service_role pode acessar)
CREATE POLICY "Service role full access fila_avaliacoes" 
ON public.fila_avaliacoes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Políticas para fila_notificacoes_tecnico
CREATE POLICY "Service role full access fila_notificacoes_tecnico" 
ON public.fila_notificacoes_tecnico 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Políticas para técnicos verem suas próprias notificações
CREATE POLICY "Técnicos podem ver próprias notificações" 
ON public.fila_notificacoes_tecnico 
FOR SELECT 
USING (auth.uid() = tecnico_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fila_avaliacoes_status 
ON public.fila_avaliacoes(status);

CREATE INDEX IF NOT EXISTS idx_fila_avaliacoes_agendamento 
ON public.fila_avaliacoes(agendamento_id);

CREATE INDEX IF NOT EXISTS idx_fila_notificacoes_status 
ON public.fila_notificacoes_tecnico(status);

CREATE INDEX IF NOT EXISTS idx_fila_notificacoes_tecnico_id 
ON public.fila_notificacoes_tecnico(tecnico_id);

CREATE INDEX IF NOT EXISTS idx_carrinhos_tipo_mensagem 
ON public.carrinhos_abandonados(tipo_ultima_mensagem);

-- Trigger para adicionar avaliação na fila quando agendamento é concluído
CREATE OR REPLACE FUNCTION public.trigger_enfileirar_avaliacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando status muda para 'concluido'
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    -- Verificar se já não existe avaliação pendente
    IF NOT EXISTS (
      SELECT 1 FROM public.fila_avaliacoes 
      WHERE agendamento_id = NEW.id
    ) THEN
      INSERT INTO public.fila_avaliacoes (agendamento_id, telefone, nome_cliente)
      VALUES (NEW.id, NEW.telefone, NEW.nome_cliente);
      
      RAISE LOG '[trigger_enfileirar_avaliacao] Avaliação enfileirada para agendamento %', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_avaliacao_pos_conclusao ON public.agendamentos;
CREATE TRIGGER trigger_avaliacao_pos_conclusao
  AFTER UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_enfileirar_avaliacao();

-- Trigger para notificar técnico quando serviço é atribuído
CREATE OR REPLACE FUNCTION public.trigger_notificar_tecnico_atribuicao()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando técnico é atribuído ou alterado
  IF NEW.tecnico_id IS NOT NULL AND (OLD.tecnico_id IS NULL OR OLD.tecnico_id != NEW.tecnico_id) THEN
    -- Determinar tipo de notificação
    INSERT INTO public.fila_notificacoes_tecnico (
      tecnico_id, 
      agendamento_id, 
      tipo
    )
    VALUES (
      NEW.tecnico_id, 
      NEW.id, 
      CASE 
        WHEN OLD.tecnico_id IS NULL THEN 'novo_servico'
        ELSE 'reatribuicao'
      END
    );
    
    RAISE LOG '[trigger_notificar_tecnico] Notificação criada para técnico % agendamento %', NEW.tecnico_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_atribuicao_tecnico ON public.agendamentos;
CREATE TRIGGER trigger_atribuicao_tecnico
  AFTER UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_notificar_tecnico_atribuicao();