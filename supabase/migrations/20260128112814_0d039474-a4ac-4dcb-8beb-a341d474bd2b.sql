-- =====================================================
-- FASE 1: Sistema de Parcerias/Influencers
-- =====================================================

-- 1. Adicionar role 'parceiro' ao enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'parceiro';

-- 2. Adicionar coluna parceiro_codigo na tabela agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS parceiro_codigo TEXT;

-- Criar índice para busca por parceiro_codigo
CREATE INDEX IF NOT EXISTS idx_agendamentos_parceiro_codigo 
ON public.agendamentos(parceiro_codigo) WHERE parceiro_codigo IS NOT NULL;

-- 3. Criar tabela de parceiros
CREATE TABLE IF NOT EXISTS public.parceiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  nome_exibicao TEXT,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  documento TEXT,
  tipo TEXT NOT NULL DEFAULT 'afiliado' CHECK (tipo IN ('influencer', 'empresa', 'afiliado')),
  codigo_referencia TEXT NOT NULL UNIQUE,
  comissao_percentual NUMERIC NOT NULL DEFAULT 10 CHECK (comissao_percentual >= 0 AND comissao_percentual <= 100),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'suspenso', 'inativo')),
  saldo_disponivel NUMERIC NOT NULL DEFAULT 0,
  total_ganhos NUMERIC NOT NULL DEFAULT 0,
  dados_bancarios JSONB DEFAULT '{}',
  redes_sociais JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  aprovado_por UUID REFERENCES auth.users(id),
  aprovado_em TIMESTAMP WITH TIME ZONE
);

-- Índices para parceiros
CREATE INDEX IF NOT EXISTS idx_parceiros_codigo_referencia ON public.parceiros(codigo_referencia);
CREATE INDEX IF NOT EXISTS idx_parceiros_status ON public.parceiros(status);
CREATE INDEX IF NOT EXISTS idx_parceiros_user_id ON public.parceiros(user_id);

-- 4. Criar tabela de links de parceiros
CREATE TABLE IF NOT EXISTS public.parceiro_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID REFERENCES public.parceiros(id) ON DELETE CASCADE NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  url_destino TEXT NOT NULL DEFAULT '/agendamento',
  nome_campanha TEXT,
  cupom_vinculado TEXT,
  cliques INTEGER NOT NULL DEFAULT 0,
  conversoes INTEGER NOT NULL DEFAULT 0,
  receita_gerada NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'expirado')),
  validade DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para links
CREATE INDEX IF NOT EXISTS idx_parceiro_links_codigo ON public.parceiro_links(codigo);
CREATE INDEX IF NOT EXISTS idx_parceiro_links_parceiro_id ON public.parceiro_links(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_parceiro_links_status ON public.parceiro_links(status);

-- 5. Criar tabela de conversões
CREATE TABLE IF NOT EXISTS public.parceiro_conversoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID REFERENCES public.parceiros(id) ON DELETE CASCADE NOT NULL,
  link_id UUID REFERENCES public.parceiro_links(id) ON DELETE SET NULL,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE NOT NULL UNIQUE,
  valor_agendamento NUMERIC NOT NULL,
  comissao_percentual NUMERIC NOT NULL,
  valor_comissao NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'paga', 'cancelada')),
  aprovada_em TIMESTAMP WITH TIME ZONE,
  paga_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para conversões
CREATE INDEX IF NOT EXISTS idx_parceiro_conversoes_parceiro_id ON public.parceiro_conversoes(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_parceiro_conversoes_agendamento_id ON public.parceiro_conversoes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_parceiro_conversoes_status ON public.parceiro_conversoes(status);

-- 6. Criar tabela de saques
CREATE TABLE IF NOT EXISTS public.parceiro_saques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID REFERENCES public.parceiros(id) ON DELETE CASCADE NOT NULL,
  valor NUMERIC NOT NULL CHECK (valor > 0),
  metodo TEXT NOT NULL CHECK (metodo IN ('pix', 'transferencia')),
  dados_pagamento JSONB DEFAULT '{}',
  comprovante_url TEXT,
  status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'processando', 'pago', 'rejeitado')),
  motivo_rejeicao TEXT,
  processado_por UUID REFERENCES auth.users(id),
  processado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para saques
CREATE INDEX IF NOT EXISTS idx_parceiro_saques_parceiro_id ON public.parceiro_saques(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_parceiro_saques_status ON public.parceiro_saques(status);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiro_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiro_conversoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiro_saques ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar se é parceiro
CREATE OR REPLACE FUNCTION public.is_parceiro(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parceiros 
    WHERE user_id = _user_id AND status = 'ativo'
  )
$$;

-- Função para obter parceiro_id do usuário
CREATE OR REPLACE FUNCTION public.get_parceiro_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.parceiros WHERE user_id = _user_id LIMIT 1
$$;

-- POLICIES para parceiros
CREATE POLICY "parceiros_own_select" ON public.parceiros
FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

CREATE POLICY "parceiros_own_update" ON public.parceiros
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "parceiros_admin_all" ON public.parceiros
FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

CREATE POLICY "parceiros_public_insert" ON public.parceiros
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  nome IS NOT NULL AND
  email IS NOT NULL AND
  telefone IS NOT NULL AND
  codigo_referencia IS NOT NULL AND
  status = 'pendente'
);

-- POLICIES para parceiro_links
CREATE POLICY "parceiro_links_own_select" ON public.parceiro_links
FOR SELECT USING (
  parceiro_id = get_parceiro_id(auth.uid()) OR 
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'operador')
);

CREATE POLICY "parceiro_links_own_insert" ON public.parceiro_links
FOR INSERT WITH CHECK (
  parceiro_id = get_parceiro_id(auth.uid()) AND
  is_parceiro(auth.uid())
);

CREATE POLICY "parceiro_links_own_update" ON public.parceiro_links
FOR UPDATE USING (parceiro_id = get_parceiro_id(auth.uid()) AND is_parceiro(auth.uid()))
WITH CHECK (parceiro_id = get_parceiro_id(auth.uid()));

CREATE POLICY "parceiro_links_admin_all" ON public.parceiro_links
FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

-- POLICIES para parceiro_conversoes
CREATE POLICY "parceiro_conversoes_own_select" ON public.parceiro_conversoes
FOR SELECT USING (
  parceiro_id = get_parceiro_id(auth.uid()) OR 
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'operador')
);

CREATE POLICY "parceiro_conversoes_admin_all" ON public.parceiro_conversoes
FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

CREATE POLICY "parceiro_conversoes_system_insert" ON public.parceiro_conversoes
FOR INSERT WITH CHECK (true);

-- POLICIES para parceiro_saques
CREATE POLICY "parceiro_saques_own_select" ON public.parceiro_saques
FOR SELECT USING (
  parceiro_id = get_parceiro_id(auth.uid()) OR 
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'operador')
);

CREATE POLICY "parceiro_saques_own_insert" ON public.parceiro_saques
FOR INSERT WITH CHECK (
  parceiro_id = get_parceiro_id(auth.uid()) AND
  is_parceiro(auth.uid())
);

CREATE POLICY "parceiro_saques_admin_all" ON public.parceiro_saques
FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'));

-- =====================================================
-- TRIGGERS para automação
-- =====================================================

-- Trigger: Atualizar updated_at em parceiros
CREATE OR REPLACE FUNCTION public.update_parceiros_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_parceiros_updated_at
BEFORE UPDATE ON public.parceiros
FOR EACH ROW EXECUTE FUNCTION public.update_parceiros_updated_at();

-- Trigger: Atualizar updated_at em parceiro_links
CREATE TRIGGER trigger_parceiro_links_updated_at
BEFORE UPDATE ON public.parceiro_links
FOR EACH ROW EXECUTE FUNCTION public.update_parceiros_updated_at();

-- Trigger: Aprovar comissão quando agendamento for concluído
CREATE OR REPLACE FUNCTION public.aprovar_comissao_parceiro()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'concluido' e tem parceiro_codigo
  IF NEW.status = 'concluido' AND OLD.status != 'concluido' AND NEW.parceiro_codigo IS NOT NULL THEN
    -- Atualiza a conversão para aprovada
    UPDATE public.parceiro_conversoes
    SET 
      status = 'aprovada',
      aprovada_em = now()
    WHERE agendamento_id = NEW.id AND status = 'pendente';
    
    -- Atualiza o saldo do parceiro
    UPDATE public.parceiros p
    SET 
      saldo_disponivel = saldo_disponivel + pc.valor_comissao,
      total_ganhos = total_ganhos + pc.valor_comissao
    FROM public.parceiro_conversoes pc
    WHERE pc.agendamento_id = NEW.id 
      AND pc.parceiro_id = p.id
      AND pc.status = 'aprovada';
      
    -- Atualiza estatísticas do link
    UPDATE public.parceiro_links pl
    SET 
      conversoes = conversoes + 1,
      receita_gerada = receita_gerada + NEW.valor_total
    FROM public.parceiro_conversoes pc
    WHERE pc.agendamento_id = NEW.id 
      AND pc.link_id = pl.id;
  END IF;
  
  -- Se o status mudou para 'cancelado' ou 'reembolsado'
  IF NEW.status IN ('cancelado', 'reembolsado') AND OLD.status NOT IN ('cancelado', 'reembolsado') THEN
    -- Se a comissão estava aprovada, reverter
    UPDATE public.parceiros p
    SET 
      saldo_disponivel = GREATEST(0, saldo_disponivel - pc.valor_comissao),
      total_ganhos = GREATEST(0, total_ganhos - pc.valor_comissao)
    FROM public.parceiro_conversoes pc
    WHERE pc.agendamento_id = NEW.id 
      AND pc.parceiro_id = p.id
      AND pc.status = 'aprovada';
    
    -- Marcar conversão como cancelada
    UPDATE public.parceiro_conversoes
    SET status = 'cancelada'
    WHERE agendamento_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_aprovar_comissao_parceiro
AFTER UPDATE ON public.agendamentos
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.aprovar_comissao_parceiro();

-- Trigger: Atribuir role 'parceiro' quando aprovado
CREATE OR REPLACE FUNCTION public.atribuir_role_parceiro()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status mudou para 'ativo'
  IF NEW.status = 'ativo' AND OLD.status != 'ativo' THEN
    -- Inserir role se não existir
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'parceiro')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- Se status mudou de 'ativo' para outro
  IF OLD.status = 'ativo' AND NEW.status != 'ativo' THEN
    -- Remover role
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'parceiro';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_atribuir_role_parceiro
AFTER UPDATE ON public.parceiros
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.atribuir_role_parceiro();

-- Habilitar realtime para parceiros e conversões
ALTER PUBLICATION supabase_realtime ADD TABLE public.parceiros;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parceiro_conversoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parceiro_saques;