
-- =============================================
-- CRM - MÓDULO COMPLETO
-- =============================================

-- 1. Tabela Central de Clientes
CREATE TABLE public.crm_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone TEXT UNIQUE NOT NULL,
  nome TEXT,
  email TEXT,
  cpf TEXT,
  
  -- Endereço principal
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  cep TEXT,
  estado TEXT DEFAULT 'MG',
  
  -- Classificação
  tipo TEXT DEFAULT 'lead' CHECK (tipo IN ('lead', 'prospect', 'cliente', 'vip', 'inativo')),
  origem TEXT,
  
  -- Responsável
  responsavel_id UUID REFERENCES public.profiles(id),
  
  -- Métricas calculadas
  total_agendamentos INTEGER DEFAULT 0,
  valor_total_gasto NUMERIC(10,2) DEFAULT 0,
  ticket_medio NUMERIC(10,2) DEFAULT 0,
  ultimo_servico DATE,
  proximo_contato DATE,
  
  -- Engajamento
  score_engajamento INTEGER DEFAULT 0 CHECK (score_engajamento >= 0 AND score_engajamento <= 100),
  dias_desde_ultimo_contato INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Pipeline de Vendas
CREATE TABLE public.crm_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.crm_clientes(id) ON DELETE CASCADE,
  
  estagio TEXT NOT NULL DEFAULT 'novo_lead' CHECK (estagio IN ('novo_lead', 'primeiro_contato', 'proposta', 'negociacao', 'fechado_ganho', 'fechado_perdido')),
  valor_potencial NUMERIC(10,2),
  probabilidade INTEGER DEFAULT 50 CHECK (probabilidade >= 0 AND probabilidade <= 100),
  
  data_entrada TIMESTAMPTZ DEFAULT now(),
  data_previsao_fechamento DATE,
  data_fechamento TIMESTAMPTZ,
  
  motivo_perda TEXT,
  fonte_lead TEXT,
  campanha TEXT,
  
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tarefas e Follow-ups
CREATE TABLE public.crm_tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.crm_clientes(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES public.crm_pipeline(id) ON DELETE SET NULL,
  
  tipo TEXT NOT NULL CHECK (tipo IN ('ligacao', 'whatsapp', 'email', 'visita', 'lembrete', 'outro')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  
  data_agendada TIMESTAMPTZ NOT NULL,
  data_conclusao TIMESTAMPTZ,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  
  responsavel_id UUID REFERENCES public.profiles(id),
  criado_por UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Interações e Notas
CREATE TABLE public.crm_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.crm_clientes(id) ON DELETE CASCADE,
  
  tipo TEXT NOT NULL CHECK (tipo IN ('nota', 'ligacao', 'whatsapp', 'email', 'reuniao', 'servico')),
  titulo TEXT,
  conteudo TEXT,
  
  -- Referências opcionais
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
  tarefa_id UUID REFERENCES public.crm_tarefas(id) ON DELETE SET NULL,
  
  criado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tags para Segmentação
CREATE TABLE public.crm_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT UNIQUE NOT NULL,
  cor TEXT DEFAULT '#3B82F6',
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Relação Cliente-Tags
CREATE TABLE public.crm_clientes_tags (
  cliente_id UUID REFERENCES public.crm_clientes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.crm_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (cliente_id, tag_id)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_crm_clientes_telefone ON public.crm_clientes(telefone);
CREATE INDEX idx_crm_clientes_tipo ON public.crm_clientes(tipo);
CREATE INDEX idx_crm_clientes_responsavel ON public.crm_clientes(responsavel_id);
CREATE INDEX idx_crm_pipeline_cliente ON public.crm_pipeline(cliente_id);
CREATE INDEX idx_crm_pipeline_estagio ON public.crm_pipeline(estagio);
CREATE INDEX idx_crm_tarefas_cliente ON public.crm_tarefas(cliente_id);
CREATE INDEX idx_crm_tarefas_status ON public.crm_tarefas(status);
CREATE INDEX idx_crm_tarefas_data ON public.crm_tarefas(data_agendada);
CREATE INDEX idx_crm_interacoes_cliente ON public.crm_interacoes(cliente_id);

-- =============================================
-- RLS POLICIES
-- =============================================

-- crm_clientes
ALTER TABLE public.crm_clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_clientes_staff_all" ON public.crm_clientes
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

-- crm_pipeline
ALTER TABLE public.crm_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_pipeline_staff_all" ON public.crm_pipeline
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

-- crm_tarefas
ALTER TABLE public.crm_tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_tarefas_staff_all" ON public.crm_tarefas
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

-- crm_interacoes
ALTER TABLE public.crm_interacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_interacoes_staff_all" ON public.crm_interacoes
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

-- crm_tags
ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_tags_staff_all" ON public.crm_tags
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

-- crm_clientes_tags
ALTER TABLE public.crm_clientes_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_clientes_tags_staff_all" ON public.crm_clientes_tags
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

-- =============================================
-- TRIGGERS PARA updated_at
-- =============================================

CREATE TRIGGER update_crm_clientes_updated_at
  BEFORE UPDATE ON public.crm_clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_pipeline_updated_at
  BEFORE UPDATE ON public.crm_pipeline
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_tarefas_updated_at
  BEFORE UPDATE ON public.crm_tarefas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNÇÃO PARA ATUALIZAR MÉTRICAS DO CLIENTE
-- =============================================

CREATE OR REPLACE FUNCTION public.atualizar_metricas_crm_cliente(p_telefone TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_valor NUMERIC;
  v_ultimo DATE;
BEGIN
  SELECT 
    COUNT(*),
    COALESCE(SUM(valor_total), 0),
    MAX(data_agendamento)
  INTO v_total, v_valor, v_ultimo
  FROM agendamentos
  WHERE telefone = p_telefone AND status = 'concluido';
  
  UPDATE crm_clientes
  SET 
    total_agendamentos = v_total,
    valor_total_gasto = v_valor,
    ticket_medio = CASE WHEN v_total > 0 THEN v_valor / v_total ELSE 0 END,
    ultimo_servico = v_ultimo,
    tipo = CASE 
      WHEN v_total >= 5 THEN 'vip'
      WHEN v_total >= 1 THEN 'cliente'
      ELSE tipo 
    END,
    updated_at = now()
  WHERE telefone = p_telefone;
END;
$$;

-- =============================================
-- TAGS PADRÃO
-- =============================================

INSERT INTO public.crm_tags (nome, cor, descricao) VALUES
  ('Residencial', '#10B981', 'Cliente residencial'),
  ('Comercial', '#3B82F6', 'Cliente comercial/empresarial'),
  ('Recorrente', '#8B5CF6', 'Cliente com serviços recorrentes'),
  ('Alto Valor', '#F59E0B', 'Cliente com alto ticket médio'),
  ('Indicação', '#EC4899', 'Veio por indicação'),
  ('Novo', '#06B6D4', 'Cliente novo - primeiro contato');
