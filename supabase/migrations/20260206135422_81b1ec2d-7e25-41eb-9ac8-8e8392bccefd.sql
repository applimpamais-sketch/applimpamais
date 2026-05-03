-- Tabela para registrar inconsistências encontradas
CREATE TABLE IF NOT EXISTS public.ledger_consistency_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tipo_inconsistencia TEXT NOT NULL,
  tabela_origem TEXT NOT NULL,
  registro_id UUID,
  valor_esperado NUMERIC,
  valor_encontrado NUMERIC,
  detalhes JSONB,
  resolvido BOOLEAN DEFAULT false,
  resolvido_em TIMESTAMPTZ,
  resolvido_por UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.ledger_consistency_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver/gerenciar
CREATE POLICY "Admins podem gerenciar ledger_consistency_log"
ON public.ledger_consistency_log FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Função que verifica consistência do ledger
CREATE OR REPLACE FUNCTION public.verificar_consistencia_ledger()
RETURNS TABLE(
  inconsistencias_in INTEGER,
  inconsistencias_out INTEGER,
  inconsistencias_reembolso INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_in_count INTEGER := 0;
  v_out_count INTEGER := 0;
  v_reembolso_count INTEGER := 0;
BEGIN
  -- 1. Pagamentos PAGOS sem entrada no ledger
  INSERT INTO ledger_consistency_log (tipo_inconsistencia, tabela_origem, registro_id, valor_esperado, detalhes)
  SELECT 
    'PAGAMENTO_SEM_LEDGER',
    'pagamentos_agendamentos',
    pa.id,
    pa.valor_pago,
    jsonb_build_object(
      'agendamento_id', pa.agendamento_id,
      'data_pagamento', pa.data_pagamento,
      'status', pa.status
    )
  FROM pagamentos_agendamentos pa
  LEFT JOIN ledger_entries le ON le.pagamento_id = pa.id AND le.status = 'confirmado'
  WHERE pa.status = 'pago'
    AND le.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM ledger_consistency_log lcl 
      WHERE lcl.registro_id = pa.id 
        AND lcl.tipo_inconsistencia = 'PAGAMENTO_SEM_LEDGER'
        AND lcl.resolvido = false
    );
  
  GET DIAGNOSTICS v_in_count = ROW_COUNT;

  -- 2. Ledger IN sem pagamento correspondente pago
  INSERT INTO ledger_consistency_log (tipo_inconsistencia, tabela_origem, registro_id, valor_esperado, valor_encontrado, detalhes)
  SELECT 
    'LEDGER_IN_SEM_PAGAMENTO',
    'ledger_entries',
    le.id,
    le.valor,
    COALESCE(pa.valor_pago, 0),
    jsonb_build_object(
      'pagamento_id', le.pagamento_id,
      'agendamento_id', le.agendamento_id,
      'data_movimentacao', le.data_movimentacao
    )
  FROM ledger_entries le
  LEFT JOIN pagamentos_agendamentos pa ON pa.id = le.pagamento_id AND pa.status = 'pago'
  WHERE le.tipo = 'IN'
    AND le.origem = 'pagamento'
    AND le.status = 'confirmado'
    AND pa.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM ledger_consistency_log lcl 
      WHERE lcl.registro_id = le.id 
        AND lcl.tipo_inconsistencia = 'LEDGER_IN_SEM_PAGAMENTO'
        AND lcl.resolvido = false
    );

  -- 3. Despesas PAGAS sem saída no ledger
  INSERT INTO ledger_consistency_log (tipo_inconsistencia, tabela_origem, registro_id, valor_esperado, detalhes)
  SELECT 
    'DESPESA_SEM_LEDGER',
    'despesas',
    d.id,
    d.valor,
    jsonb_build_object(
      'descricao', d.descricao,
      'categoria', d.categoria,
      'data_despesa', d.data_despesa
    )
  FROM despesas d
  LEFT JOIN ledger_entries le ON le.despesa_id = d.id AND le.status = 'confirmado'
  WHERE d.status = 'paga'
    AND le.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM ledger_consistency_log lcl 
      WHERE lcl.registro_id = d.id 
        AND lcl.tipo_inconsistencia = 'DESPESA_SEM_LEDGER'
        AND lcl.resolvido = false
    );
  
  GET DIAGNOSTICS v_out_count = ROW_COUNT;

  -- 4. Ledger OUT (despesa) sem despesa correspondente paga
  INSERT INTO ledger_consistency_log (tipo_inconsistencia, tabela_origem, registro_id, valor_esperado, valor_encontrado, detalhes)
  SELECT 
    'LEDGER_OUT_SEM_DESPESA',
    'ledger_entries',
    le.id,
    le.valor,
    COALESCE(d.valor, 0),
    jsonb_build_object(
      'despesa_id', le.despesa_id,
      'data_movimentacao', le.data_movimentacao
    )
  FROM ledger_entries le
  LEFT JOIN despesas d ON d.id = le.despesa_id AND d.status = 'paga'
  WHERE le.tipo = 'OUT'
    AND le.origem = 'despesa'
    AND le.status = 'confirmado'
    AND d.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM ledger_consistency_log lcl 
      WHERE lcl.registro_id = le.id 
        AND lcl.tipo_inconsistencia = 'LEDGER_OUT_SEM_DESPESA'
        AND lcl.resolvido = false
    );

  -- 5. Reembolsos sem entrada no ledger
  INSERT INTO ledger_consistency_log (tipo_inconsistencia, tabela_origem, registro_id, valor_esperado, detalhes)
  SELECT 
    'REEMBOLSO_SEM_LEDGER',
    'reembolsos',
    r.id,
    r.valor_reembolsado,
    jsonb_build_object(
      'agendamento_id', r.agendamento_id,
      'motivo', r.motivo,
      'data_reembolso', r.data_reembolso
    )
  FROM reembolsos r
  LEFT JOIN ledger_entries le ON le.reembolso_id = r.id AND le.status = 'confirmado'
  WHERE le.id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM ledger_consistency_log lcl 
      WHERE lcl.registro_id = r.id 
        AND lcl.tipo_inconsistencia = 'REEMBOLSO_SEM_LEDGER'
        AND lcl.resolvido = false
    );
  
  GET DIAGNOSTICS v_reembolso_count = ROW_COUNT;

  -- Logar resumo
  RAISE LOG '[CONSISTENCIA LEDGER] Verificação concluída: IN=%, OUT=%, REEMBOLSO=%', 
    v_in_count, v_out_count, v_reembolso_count;

  RETURN QUERY SELECT v_in_count, v_out_count, v_reembolso_count;
END;
$$;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_ledger_consistency_log_resolvido 
ON public.ledger_consistency_log(resolvido, created_at DESC);

-- Agendar execução diária às 03:00 (horário do servidor)
SELECT cron.schedule(
  'verificar-consistencia-ledger-diario',
  '0 3 * * *',
  $$SELECT public.verificar_consistencia_ledger()$$
);