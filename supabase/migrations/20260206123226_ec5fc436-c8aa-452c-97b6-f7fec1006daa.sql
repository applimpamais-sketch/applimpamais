-- ============================================
-- FASE 1: CRIAR TABELA LEDGER_ENTRIES
-- ============================================

-- Criar tabela ledger_entries (Livro-Razão - Fonte Única de Verdade)
CREATE TABLE public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  data_movimentacao DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('IN', 'OUT')),
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  categoria TEXT NOT NULL,
  forma_pagamento TEXT,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'pendente', 'cancelado')),
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  pagamento_id UUID REFERENCES pagamentos_agendamentos(id) ON DELETE SET NULL,
  despesa_id UUID REFERENCES despesas(id) ON DELETE SET NULL,
  reembolso_id UUID REFERENCES reembolsos(id) ON DELETE SET NULL,
  origem TEXT NOT NULL CHECK (origem IN ('pagamento', 'despesa', 'reembolso', 'ajuste_manual')),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX idx_ledger_data ON ledger_entries(data_movimentacao);
CREATE INDEX idx_ledger_tipo ON ledger_entries(tipo);
CREATE INDEX idx_ledger_status ON ledger_entries(status);
CREATE INDEX idx_ledger_agendamento ON ledger_entries(agendamento_id);
CREATE INDEX idx_ledger_despesa ON ledger_entries(despesa_id);
CREATE INDEX idx_ledger_pagamento ON ledger_entries(pagamento_id);
CREATE INDEX idx_ledger_origem ON ledger_entries(origem);

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ledger_entries;

-- RLS
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ledger" ON public.ledger_entries
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view ledger" ON public.ledger_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================
-- FASE 2: TRIGGERS DE SINCRONIZAÇÃO
-- ============================================

-- Trigger: Ao inserir/atualizar pagamento -> criar ledger IN
CREATE OR REPLACE FUNCTION public.sync_pagamento_to_ledger()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status mudou para 'pago', criar entrada no ledger
  IF NEW.status = 'pago' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'pago') THEN
    -- Evitar duplicatas
    IF NOT EXISTS (SELECT 1 FROM public.ledger_entries WHERE pagamento_id = NEW.id AND status = 'confirmado') THEN
      INSERT INTO public.ledger_entries (
        data_movimentacao,
        tipo,
        valor,
        categoria,
        forma_pagamento,
        descricao,
        status,
        agendamento_id,
        pagamento_id,
        origem,
        metadata
      )
      SELECT
        COALESCE(NEW.data_pagamento::DATE, CURRENT_DATE),
        'IN',
        COALESCE(NEW.valor_pago, 0),
        COALESCE(a.categoria_receita, 'servicos_limpeza'),
        NEW.forma_pagamento,
        CONCAT('Pagamento #', LEFT(COALESCE(a.order_code, NEW.id::text), 10), ' - ', a.nome_cliente),
        'confirmado',
        NEW.agendamento_id,
        NEW.id,
        'pagamento',
        jsonb_build_object(
          'cliente', a.nome_cliente,
          'telefone', a.telefone
        )
      FROM agendamentos a
      WHERE a.id = NEW.agendamento_id;
    END IF;
  END IF;
  
  -- Se status mudou de 'pago' para outro, cancelar entrada no ledger
  IF OLD IS NOT NULL AND OLD.status = 'pago' AND NEW.status IS DISTINCT FROM 'pago' THEN
    UPDATE public.ledger_entries
    SET status = 'cancelado'
    WHERE pagamento_id = NEW.id AND status = 'confirmado';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_sync_pagamento_ledger ON public.pagamentos_agendamentos;
CREATE TRIGGER trigger_sync_pagamento_ledger
AFTER INSERT OR UPDATE ON public.pagamentos_agendamentos
FOR EACH ROW EXECUTE FUNCTION public.sync_pagamento_to_ledger();

-- Trigger: Ao pagar despesa -> criar ledger OUT
CREATE OR REPLACE FUNCTION public.sync_despesa_to_ledger()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status mudou para 'paga', criar saída no ledger
  IF NEW.status = 'paga' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'paga') THEN
    -- Evitar duplicatas
    IF NOT EXISTS (SELECT 1 FROM public.ledger_entries WHERE despesa_id = NEW.id AND status = 'confirmado') THEN
      INSERT INTO public.ledger_entries (
        data_movimentacao,
        tipo,
        valor,
        categoria,
        forma_pagamento,
        descricao,
        status,
        despesa_id,
        origem,
        metadata
      ) VALUES (
        NEW.data_despesa::DATE,
        'OUT',
        NEW.valor,
        NEW.categoria,
        NEW.forma_pagamento,
        NEW.descricao,
        'confirmado',
        NEW.id,
        'despesa',
        jsonb_build_object('observacoes', NEW.observacoes)
      );
    END IF;
  END IF;
  
  -- Se status mudou de 'paga' para outro, cancelar entrada no ledger
  IF OLD IS NOT NULL AND OLD.status = 'paga' AND NEW.status IS DISTINCT FROM 'paga' THEN
    UPDATE public.ledger_entries
    SET status = 'cancelado'
    WHERE despesa_id = NEW.id AND status = 'confirmado';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_sync_despesa_ledger ON public.despesas;
CREATE TRIGGER trigger_sync_despesa_ledger
AFTER INSERT OR UPDATE ON public.despesas
FOR EACH ROW EXECUTE FUNCTION public.sync_despesa_to_ledger();

-- Trigger: Ao criar reembolso -> criar ledger OUT (estorno)
CREATE OR REPLACE FUNCTION public.sync_reembolso_to_ledger()
RETURNS TRIGGER AS $$
BEGIN
  -- Evitar duplicatas
  IF NOT EXISTS (SELECT 1 FROM public.ledger_entries WHERE reembolso_id = NEW.id) THEN
    INSERT INTO public.ledger_entries (
      data_movimentacao,
      tipo,
      valor,
      categoria,
      descricao,
      status,
      agendamento_id,
      reembolso_id,
      origem,
      metadata
    ) VALUES (
      COALESCE(NEW.data_reembolso::DATE, CURRENT_DATE),
      'OUT',
      NEW.valor_reembolsado,
      'reembolso',
      CONCAT('Reembolso: ', COALESCE(NEW.motivo, 'Sem motivo especificado')),
      'confirmado',
      NEW.agendamento_id,
      NEW.id,
      'reembolso',
      jsonb_build_object('metodo', NEW.metodo_reembolso)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_sync_reembolso_ledger ON public.reembolsos;
CREATE TRIGGER trigger_sync_reembolso_ledger
AFTER INSERT ON public.reembolsos
FOR EACH ROW EXECUTE FUNCTION public.sync_reembolso_to_ledger();

-- ============================================
-- FASE 3: VIEWS SQL PARA AGREGAÇÕES
-- ============================================

-- View: Resumo financeiro por período
CREATE OR REPLACE VIEW public.vw_finance_summary AS
SELECT
  data_movimentacao AS data,
  SUM(CASE WHEN tipo = 'IN' AND status = 'confirmado' THEN valor ELSE 0 END) AS receita_realizada,
  SUM(CASE WHEN tipo = 'OUT' AND status = 'confirmado' AND origem = 'despesa' THEN valor ELSE 0 END) AS despesas_pagas,
  SUM(CASE WHEN tipo = 'OUT' AND status = 'confirmado' AND origem = 'reembolso' THEN valor ELSE 0 END) AS reembolsos,
  SUM(CASE 
    WHEN tipo = 'IN' AND status = 'confirmado' THEN valor 
    WHEN tipo = 'OUT' AND status = 'confirmado' THEN -valor 
    ELSE 0 
  END) AS saldo_dia
FROM public.ledger_entries
GROUP BY data_movimentacao;

-- View: Fluxo de caixa diário com saldo acumulado
CREATE OR REPLACE VIEW public.vw_cashflow_daily AS
WITH daily_summary AS (
  SELECT
    data_movimentacao AS data,
    SUM(CASE WHEN tipo = 'IN' AND status = 'confirmado' THEN valor ELSE 0 END) AS entradas,
    SUM(CASE WHEN tipo = 'OUT' AND status = 'confirmado' THEN valor ELSE 0 END) AS saidas
  FROM public.ledger_entries
  GROUP BY data_movimentacao
)
SELECT
  data,
  entradas,
  saidas,
  (entradas - saidas) AS saldo,
  SUM(entradas - saidas) OVER (ORDER BY data) AS saldo_acumulado
FROM daily_summary
ORDER BY data;

-- View: Receitas por forma de pagamento
CREATE OR REPLACE VIEW public.vw_receipts_by_method AS
SELECT
  COALESCE(forma_pagamento, 'Não informado') AS forma,
  SUM(valor) AS total,
  COUNT(*) AS quantidade
FROM public.ledger_entries
WHERE tipo = 'IN' AND status = 'confirmado'
GROUP BY forma_pagamento;

-- View: Despesas por categoria
CREATE OR REPLACE VIEW public.vw_expenses_by_category AS
SELECT
  categoria,
  SUM(valor) AS total,
  COUNT(*) AS quantidade
FROM public.ledger_entries
WHERE tipo = 'OUT' AND status = 'confirmado' AND origem = 'despesa'
GROUP BY categoria;

-- ============================================
-- FASE 4: MIGRAR DADOS EXISTENTES
-- ============================================

-- 1. Migrar pagamentos existentes
INSERT INTO public.ledger_entries (
  data_movimentacao, tipo, valor, categoria, forma_pagamento,
  descricao, status, agendamento_id, pagamento_id, origem, metadata
)
SELECT
  COALESCE(p.data_pagamento::DATE, CURRENT_DATE),
  'IN',
  COALESCE(p.valor_pago, 0),
  COALESCE(a.categoria_receita, 'servicos_limpeza'),
  p.forma_pagamento,
  CONCAT('Migrado - ', a.nome_cliente),
  'confirmado',
  p.agendamento_id,
  p.id,
  'pagamento',
  jsonb_build_object('cliente', a.nome_cliente, 'migrado', true)
FROM pagamentos_agendamentos p
JOIN agendamentos a ON a.id = p.agendamento_id
WHERE p.status = 'pago'
  AND p.valor_pago > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.ledger_entries le WHERE le.pagamento_id = p.id
  );

-- 2. Migrar despesas existentes
INSERT INTO public.ledger_entries (
  data_movimentacao, tipo, valor, categoria, forma_pagamento,
  descricao, status, despesa_id, origem, metadata
)
SELECT
  d.data_despesa::DATE,
  'OUT',
  d.valor,
  d.categoria,
  d.forma_pagamento,
  COALESCE(d.descricao, 'Despesa migrada'),
  'confirmado',
  d.id,
  'despesa',
  jsonb_build_object('migrado', true)
FROM despesas d
WHERE d.status = 'paga'
  AND d.valor > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.ledger_entries le WHERE le.despesa_id = d.id
  );

-- 3. Migrar reembolsos existentes
INSERT INTO public.ledger_entries (
  data_movimentacao, tipo, valor, categoria,
  descricao, status, agendamento_id, reembolso_id, origem, metadata
)
SELECT
  COALESCE(r.data_reembolso::DATE, r.created_at::DATE, CURRENT_DATE),
  'OUT',
  r.valor_reembolsado,
  'reembolso',
  CONCAT('Reembolso migrado: ', COALESCE(r.motivo, 'Sem motivo')),
  'confirmado',
  r.agendamento_id,
  r.id,
  'reembolso',
  jsonb_build_object('migrado', true)
FROM reembolsos r
WHERE r.valor_reembolsado > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.ledger_entries le WHERE le.reembolso_id = r.id
  );