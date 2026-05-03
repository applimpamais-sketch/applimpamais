-- Sprint 1: Corrigir RLS policy para técnicos
DROP POLICY IF EXISTS "Tecnicos update status own agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Tecnicos finalizam seus agendamentos" ON agendamentos;

-- Nova policy mais permissiva para técnicos
CREATE POLICY "Tecnicos finalizam seus agendamentos"
ON agendamentos
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'tecnico'::app_role) 
  AND (tecnico_id = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'tecnico'::app_role) 
  AND (tecnico_id = auth.uid())
  AND (
    -- Permitir atualização para status finais
    status IN ('pago', 'concluido', 'em_andamento', 'confirmado')
  )
);

COMMENT ON POLICY "Tecnicos finalizam seus agendamentos" ON agendamentos IS 
'Permite técnicos atualizarem status, pago_em, pago_por e forma_pagamento de seus próprios agendamentos';

-- Sprint 3: Adicionar colunas de auditoria
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS criado_por uuid REFERENCES auth.users(id);

ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS criado_manualmente boolean DEFAULT false;

-- Adicionar comentários
COMMENT ON COLUMN agendamentos.criado_por IS 'Usuário que criou o agendamento (admin/operador para criação manual)';
COMMENT ON COLUMN agendamentos.criado_manualmente IS 'Indica se o agendamento foi criado manualmente por um admin/operador';