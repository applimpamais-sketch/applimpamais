-- ============================================
-- SPRINT 1: DATABASE + ESTRUTURA BASE
-- Bot WhatsApp para Orçamentos de Limpeza
-- ============================================

-- Tabela para gerenciar conversas do bot de orçamentos
CREATE TABLE IF NOT EXISTS public.whatsapp_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT NOT NULL,
  nome_cliente TEXT,
  estado_atual TEXT NOT NULL DEFAULT 'inicial',
  contexto JSONB DEFAULT '{}',
  ultima_mensagem TIMESTAMP DEFAULT now(),
  criado_em TIMESTAMP DEFAULT now(),
  finalizado BOOLEAN DEFAULT false
);

-- Tabela para histórico de mensagens
CREATE TABLE IF NOT EXISTS public.whatsapp_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID REFERENCES public.whatsapp_conversas(id) ON DELETE CASCADE,
  direcao TEXT NOT NULL CHECK (direcao IN ('entrada', 'saida')),
  tipo TEXT NOT NULL CHECK (tipo IN ('texto', 'imagem', 'audio')),
  conteudo TEXT,
  imagem_url TEXT,
  metadata JSONB DEFAULT '{}',
  criado_em TIMESTAMP DEFAULT now()
);

-- Tabela já existe: agendamentos_bot (criada anteriormente)
-- Vamos apenas garantir que está correta
ALTER TABLE public.agendamentos_bot 
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS nome_cliente TEXT,
  ADD COLUMN IF NOT EXISTS itens_selecionados JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS valor_total NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_desejada DATE,
  ADD COLUMN IF NOT EXISTS horario_desejado TEXT,
  ADD COLUMN IF NOT EXISTS endereco_completo TEXT,
  ADD COLUMN IF NOT EXISTS bairro TEXT,
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS cep TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'orcamento',
  ADD COLUMN IF NOT EXISTS agendamento_id UUID REFERENCES public.agendamentos(id);

-- Tabela para lembretes automáticos
CREATE TABLE IF NOT EXISTS public.whatsapp_lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('1_dia_antes', 'dia_do_servico', 'pos_venda')),
  agendado_para TIMESTAMP NOT NULL,
  enviado BOOLEAN DEFAULT false,
  enviado_em TIMESTAMP,
  mensagem TEXT,
  criado_em TIMESTAMP DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversas_telefone ON public.whatsapp_conversas(telefone);
CREATE INDEX IF NOT EXISTS idx_conversas_estado ON public.whatsapp_conversas(estado_atual);
CREATE INDEX IF NOT EXISTS idx_conversas_finalizado ON public.whatsapp_conversas(finalizado);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON public.whatsapp_mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_criado ON public.whatsapp_mensagens(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_lembretes_agendado ON public.whatsapp_lembretes(agendado_para, enviado);
CREATE INDEX IF NOT EXISTS idx_lembretes_tipo ON public.whatsapp_lembretes(tipo);

-- Habilitar RLS
ALTER TABLE public.whatsapp_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_lembretes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversas
CREATE POLICY "Admins gerenciam conversas WhatsApp"
  ON public.whatsapp_conversas
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

CREATE POLICY "Visualizadores veem conversas WhatsApp"
  ON public.whatsapp_conversas
  FOR SELECT
  USING (has_role(auth.uid(), 'visualizador'::app_role));

-- Políticas RLS para mensagens
CREATE POLICY "Admins gerenciam mensagens WhatsApp"
  ON public.whatsapp_mensagens
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

CREATE POLICY "Visualizadores veem mensagens WhatsApp"
  ON public.whatsapp_mensagens
  FOR SELECT
  USING (has_role(auth.uid(), 'visualizador'::app_role));

-- Políticas RLS para lembretes
CREATE POLICY "Admins gerenciam lembretes WhatsApp"
  ON public.whatsapp_lembretes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

CREATE POLICY "Visualizadores veem lembretes WhatsApp"
  ON public.whatsapp_lembretes
  FOR SELECT
  USING (has_role(auth.uid(), 'visualizador'::app_role));

-- Sistema pode inserir lembretes
CREATE POLICY "Sistema cria lembretes WhatsApp"
  ON public.whatsapp_lembretes
  FOR INSERT
  WITH CHECK (true);

-- Função para atualizar última mensagem da conversa
CREATE OR REPLACE FUNCTION public.update_conversa_ultima_mensagem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.whatsapp_conversas
  SET ultima_mensagem = NEW.criado_em
  WHERE id = NEW.conversa_id;
  RETURN NEW;
END;
$$;

-- Trigger para atualizar última mensagem automaticamente
DROP TRIGGER IF EXISTS trigger_update_conversa_ultima_mensagem ON public.whatsapp_mensagens;
CREATE TRIGGER trigger_update_conversa_ultima_mensagem
  AFTER INSERT ON public.whatsapp_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversa_ultima_mensagem();