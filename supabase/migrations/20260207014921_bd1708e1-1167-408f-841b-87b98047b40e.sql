-- ============================================
-- FASE 1: MIGRAÇÃO DE DADOS EXISTENTES
-- Associar todos os registros órfãos ao tenant RC Limpa Mais
-- ============================================

-- Definir ID do tenant principal (RC Limpa Mais)
DO $$
DECLARE
  v_tenant_id UUID := '2046cf1c-af8c-4e5e-b992-092ec922c35c';
BEGIN
  -- Migrar profiles
  UPDATE public.profiles SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  -- Migrar agendamentos
  UPDATE public.agendamentos SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  -- Migrar funcionarios_bot
  UPDATE public.funcionarios_bot SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  -- Migrar despesas
  UPDATE public.despesas SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  -- Migrar cupons_desconto
  UPDATE public.cupons_desconto SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  -- Migrar calendario_disponibilidade
  UPDATE public.calendario_disponibilidade SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  -- Migrar avaliacoes_clientes
  UPDATE public.avaliacoes_clientes SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  -- Migrar leads_cupom
  UPDATE public.leads_cupom SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  -- Migrar ledger_entries
  UPDATE public.ledger_entries SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  
  RAISE NOTICE 'Migração de dados concluída para tenant %', v_tenant_id;
END $$;

-- ============================================
-- FASE 2: ADICIONAR COLUNAS FALTANTES
-- ============================================

-- Adicionar coluna tenant_id em tabelas que não têm
ALTER TABLE public.pagamentos_agendamentos 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id);

-- Trigger para auto-preencher tenant_id em pagamentos
CREATE OR REPLACE FUNCTION public.auto_set_pagamento_tenant_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tenant_id IS NULL AND NEW.agendamento_id IS NOT NULL THEN
    SELECT tenant_id INTO NEW.tenant_id
    FROM public.agendamentos
    WHERE id = NEW.agendamento_id;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_auto_set_pagamento_tenant_id ON public.pagamentos_agendamentos;
CREATE TRIGGER trigger_auto_set_pagamento_tenant_id
  BEFORE INSERT ON public.pagamentos_agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_pagamento_tenant_id();

-- Migrar pagamentos existentes
UPDATE public.pagamentos_agendamentos pa
SET tenant_id = a.tenant_id
FROM public.agendamentos a
WHERE pa.agendamento_id = a.id
  AND pa.tenant_id IS NULL
  AND a.tenant_id IS NOT NULL;

-- ============================================
-- FASE 3: RLS POLICIES PARA ISOLAMENTO POR TENANT
-- ============================================

-- Agendamentos - Isolamento por tenant
DROP POLICY IF EXISTS "tenant_isolation_agendamentos" ON public.agendamentos;
CREATE POLICY "tenant_isolation_agendamentos" ON public.agendamentos
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL -- Permitir dados legados temporariamente
);

-- Despesas - Isolamento por tenant  
DROP POLICY IF EXISTS "tenant_isolation_despesas" ON public.despesas;
CREATE POLICY "tenant_isolation_despesas" ON public.despesas
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Funcionários Bot - Isolamento por tenant
DROP POLICY IF EXISTS "tenant_isolation_funcionarios_bot" ON public.funcionarios_bot;
CREATE POLICY "tenant_isolation_funcionarios_bot" ON public.funcionarios_bot
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Cupons - Isolamento por tenant
DROP POLICY IF EXISTS "tenant_isolation_cupons" ON public.cupons_desconto;
CREATE POLICY "tenant_isolation_cupons" ON public.cupons_desconto
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Profiles - Isolamento por tenant
DROP POLICY IF EXISTS "tenant_isolation_profiles" ON public.profiles;
CREATE POLICY "tenant_isolation_profiles" ON public.profiles
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
  OR id = auth.uid() -- Usuário pode ver próprio perfil
);

-- Ledger Entries - Isolamento por tenant
DROP POLICY IF EXISTS "tenant_isolation_ledger" ON public.ledger_entries;
CREATE POLICY "tenant_isolation_ledger" ON public.ledger_entries
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Leads Cupom - Isolamento por tenant
DROP POLICY IF EXISTS "tenant_isolation_leads_cupom" ON public.leads_cupom;
CREATE POLICY "tenant_isolation_leads_cupom" ON public.leads_cupom
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Avaliações - Isolamento por tenant
DROP POLICY IF EXISTS "tenant_isolation_avaliacoes" ON public.avaliacoes_clientes;
CREATE POLICY "tenant_isolation_avaliacoes" ON public.avaliacoes_clientes
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);

-- Calendario - Isolamento por tenant
DROP POLICY IF EXISTS "tenant_isolation_calendario" ON public.calendario_disponibilidade;
CREATE POLICY "tenant_isolation_calendario" ON public.calendario_disponibilidade
FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_super_admin(auth.uid())
  OR tenant_id IS NULL
);