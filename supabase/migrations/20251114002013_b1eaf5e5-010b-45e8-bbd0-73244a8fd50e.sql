-- Remover políticas existentes se houver e recriar
DROP POLICY IF EXISTS "Admins e operadores criam histórico atribuições" ON historico_atribuicoes;
DROP POLICY IF EXISTS "Admins e operadores veem histórico atribuições" ON historico_atribuicoes;
DROP POLICY IF EXISTS "Tecnicos veem seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Tecnicos atualizam seus agendamentos" ON agendamentos;

-- Criar tabela de histórico de atribuições se não existir
CREATE TABLE IF NOT EXISTS historico_atribuicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  tecnico_anterior_id UUID REFERENCES profiles(id),
  tecnico_novo_id UUID REFERENCES profiles(id),
  atribuido_por UUID REFERENCES profiles(id),
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE historico_atribuicoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para histórico de atribuições
CREATE POLICY "Admins e operadores criam histórico atribuições"
ON historico_atribuicoes FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

CREATE POLICY "Admins e operadores veem histórico atribuições"
ON historico_atribuicoes FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- Políticas RLS para técnicos
CREATE POLICY "Tecnicos veem seus agendamentos"
ON agendamentos FOR SELECT
USING (
  has_role(auth.uid(), 'tecnico'::app_role) 
  AND tecnico_id = auth.uid()
);

CREATE POLICY "Tecnicos atualizam seus agendamentos"
ON agendamentos FOR UPDATE
USING (
  has_role(auth.uid(), 'tecnico'::app_role) 
  AND tecnico_id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'tecnico'::app_role) 
  AND tecnico_id = auth.uid()
);