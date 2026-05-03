
-- =====================================================
-- REVISÃO DE SEGURANÇA: agendamentos
-- Garantir proteção de dados de clientes
-- =====================================================

-- 1. Remover TODAS as policies existentes para recriação limpa
DROP POLICY IF EXISTS "Admins update agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Allow public booking creation" ON public.agendamentos;
DROP POLICY IF EXISTS "Tecnicos atualizam seus agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Tecnicos finalizam seus agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_staff_select" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_public_select" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_anon_select" ON public.agendamentos;

-- 2. Garantir RLS habilitado e forçado
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 3. POLICIES SEGURAS
-- =====================================================

-- 3.1 SELECT: Staff vê todos, Técnicos veem apenas os seus
-- NENHUM acesso anônimo/público
CREATE POLICY "agendamentos_select_authorized"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (
  -- Admin, Operador, Visualizador: veem todos
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role) OR 
  has_role(auth.uid(), 'visualizador'::app_role) OR
  -- Técnico: vê apenas os atribuídos a ele
  (has_role(auth.uid(), 'tecnico'::app_role) AND tecnico_id = auth.uid())
);

-- 3.2 INSERT: Público pode criar agendamentos (checkout do site)
-- Com validações obrigatórias para evitar abuso
CREATE POLICY "agendamentos_public_insert"
ON public.agendamentos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Campos obrigatórios para agendamento válido
  nome_cliente IS NOT NULL AND
  LENGTH(nome_cliente) >= 2 AND
  telefone IS NOT NULL AND
  LENGTH(telefone) >= 10 AND
  endereco IS NOT NULL AND
  data_agendamento IS NOT NULL AND
  itens_carrinho IS NOT NULL AND
  valor_total IS NOT NULL AND
  valor_total >= 0
);

-- 3.3 UPDATE: Admin/Operador podem atualizar qualquer agendamento
CREATE POLICY "agendamentos_staff_update"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operador'::app_role)
);

-- 3.4 UPDATE: Técnico pode atualizar apenas seus agendamentos
CREATE POLICY "agendamentos_tecnico_update"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'tecnico'::app_role) AND 
  tecnico_id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'tecnico'::app_role) AND 
  tecnico_id = auth.uid()
);

-- 3.5 DELETE: APENAS admin pode deletar (casos extremos)
CREATE POLICY "agendamentos_admin_delete"
ON public.agendamentos
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Documentação
COMMENT ON TABLE public.agendamentos IS 
'Agendamentos de serviços. DADOS SENSÍVEIS: nome, telefone, endereço. RLS: SELECT bloqueado para anônimos. Staff vê todos, técnicos veem apenas atribuídos. INSERT público permitido para checkout. DELETE apenas admin.';
