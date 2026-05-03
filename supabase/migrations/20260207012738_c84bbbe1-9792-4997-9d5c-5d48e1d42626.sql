-- =============================================
-- ETAPA 2: Adicionar tenant_id nas Tabelas Core
-- =============================================

-- 1. Adicionar tenant_id em agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agendamentos_tenant_id ON public.agendamentos(tenant_id);

-- 2. Adicionar tenant_id em servicos
ALTER TABLE public.servicos 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_servicos_tenant_id ON public.servicos(tenant_id);

-- 3. Adicionar tenant_id em cupons_desconto
ALTER TABLE public.cupons_desconto 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cupons_desconto_tenant_id ON public.cupons_desconto(tenant_id);

-- 4. Adicionar tenant_id em funcionarios_bot
ALTER TABLE public.funcionarios_bot 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_funcionarios_bot_tenant_id ON public.funcionarios_bot(tenant_id);

-- 5. Adicionar tenant_id em despesas
ALTER TABLE public.despesas 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_despesas_tenant_id ON public.despesas(tenant_id);

-- 6. Adicionar tenant_id em ledger_entries
ALTER TABLE public.ledger_entries 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ledger_entries_tenant_id ON public.ledger_entries(tenant_id);

-- 7. Adicionar tenant_id em metas_financeiras
ALTER TABLE public.metas_financeiras 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_metas_financeiras_tenant_id ON public.metas_financeiras(tenant_id);

-- 8. Adicionar tenant_id em avaliacoes_clientes
ALTER TABLE public.avaliacoes_clientes 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_avaliacoes_clientes_tenant_id ON public.avaliacoes_clientes(tenant_id);

-- 9. Adicionar tenant_id em calendario_disponibilidade
ALTER TABLE public.calendario_disponibilidade 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_calendario_disponibilidade_tenant_id ON public.calendario_disponibilidade(tenant_id);

-- 10. Adicionar tenant_id em whatsapp_conversas
ALTER TABLE public.whatsapp_conversas 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversas_tenant_id ON public.whatsapp_conversas(tenant_id);

-- 11. Adicionar tenant_id em templates_mensagens
ALTER TABLE public.templates_mensagens 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_templates_mensagens_tenant_id ON public.templates_mensagens(tenant_id);

-- 12. Adicionar tenant_id em parceiros
ALTER TABLE public.parceiros 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_parceiros_tenant_id ON public.parceiros(tenant_id);

-- 13. Adicionar tenant_id em leads_cupom
ALTER TABLE public.leads_cupom 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.saas_tenants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_cupom_tenant_id ON public.leads_cupom(tenant_id);

-- 14. Trigger para auto-preencher tenant_id baseado no usuário que criou
CREATE OR REPLACE FUNCTION public.auto_set_tenant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Se já tem tenant_id, não altera
  IF NEW.tenant_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Buscar tenant_id do usuário que está inserindo
  SELECT tenant_id INTO v_tenant_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Se encontrou, define o tenant_id
  IF v_tenant_id IS NOT NULL THEN
    NEW.tenant_id := v_tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar triggers para auto-preencher tenant_id
DROP TRIGGER IF EXISTS trigger_auto_set_tenant_id_agendamentos ON public.agendamentos;
CREATE TRIGGER trigger_auto_set_tenant_id_agendamentos
BEFORE INSERT ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION public.auto_set_tenant_id();

DROP TRIGGER IF EXISTS trigger_auto_set_tenant_id_despesas ON public.despesas;
CREATE TRIGGER trigger_auto_set_tenant_id_despesas
BEFORE INSERT ON public.despesas
FOR EACH ROW EXECUTE FUNCTION public.auto_set_tenant_id();

DROP TRIGGER IF EXISTS trigger_auto_set_tenant_id_cupons ON public.cupons_desconto;
CREATE TRIGGER trigger_auto_set_tenant_id_cupons
BEFORE INSERT ON public.cupons_desconto
FOR EACH ROW EXECUTE FUNCTION public.auto_set_tenant_id();

DROP TRIGGER IF EXISTS trigger_auto_set_tenant_id_funcionarios ON public.funcionarios_bot;
CREATE TRIGGER trigger_auto_set_tenant_id_funcionarios
BEFORE INSERT ON public.funcionarios_bot
FOR EACH ROW EXECUTE FUNCTION public.auto_set_tenant_id();

DROP TRIGGER IF EXISTS trigger_auto_set_tenant_id_metas ON public.metas_financeiras;
CREATE TRIGGER trigger_auto_set_tenant_id_metas
BEFORE INSERT ON public.metas_financeiras
FOR EACH ROW EXECUTE FUNCTION public.auto_set_tenant_id();

-- 15. Atualizar função get_tenant_usage com as novas tabelas
CREATE OR REPLACE FUNCTION public.get_tenant_usage(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plano saas_plano;
  v_limites RECORD;
  v_tecnicos INTEGER;
  v_agendamentos_mes INTEGER;
  v_cupons INTEGER;
  v_funcionarios_bot INTEGER;
  v_membros INTEGER;
BEGIN
  -- Obter plano e limites
  SELECT t.plano INTO v_plano
  FROM public.saas_tenants t
  WHERE t.id = p_tenant_id;
  
  IF v_plano IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT * INTO v_limites
  FROM public.saas_plan_limits
  WHERE plano = v_plano;
  
  -- Contar recursos
  SELECT COUNT(*) INTO v_tecnicos
  FROM public.profiles p
  WHERE p.tenant_id = p_tenant_id
  AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'tecnico');
  
  SELECT COUNT(*) INTO v_agendamentos_mes
  FROM public.agendamentos a
  WHERE a.tenant_id = p_tenant_id
  AND a.data_agendamento >= date_trunc('month', CURRENT_DATE)
  AND a.data_agendamento < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
  
  SELECT COUNT(*) INTO v_cupons
  FROM public.cupons_desconto c
  WHERE c.tenant_id = p_tenant_id AND c.status = 'ativo';
  
  SELECT COUNT(*) INTO v_funcionarios_bot
  FROM public.funcionarios_bot f
  WHERE f.tenant_id = p_tenant_id AND f.ativo = true;
  
  SELECT COUNT(*) INTO v_membros
  FROM public.profiles p
  WHERE p.tenant_id = p_tenant_id
  AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('admin', 'operador'));
  
  RETURN jsonb_build_object(
    'plano', v_plano,
    'tecnicos', jsonb_build_object('atual', v_tecnicos, 'limite', v_limites.max_tecnicos),
    'agendamentos_mes', jsonb_build_object('atual', v_agendamentos_mes, 'limite', v_limites.max_agendamentos_mes),
    'cupons', jsonb_build_object('atual', v_cupons, 'limite', v_limites.max_cupons),
    'funcionarios_bot', jsonb_build_object('atual', v_funcionarios_bot, 'limite', v_limites.max_funcionarios_bot),
    'membros_dashboard', jsonb_build_object('atual', v_membros, 'limite', v_limites.max_membros_dashboard),
    'storage_mb', jsonb_build_object('limite', v_limites.max_storage_mb),
    'features', v_limites.features
  );
END;
$$;

-- 16. Atualizar função check_tenant_limit
CREATE OR REPLACE FUNCTION public.check_tenant_limit(
  p_tenant_id UUID,
  p_resource TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plano saas_plano;
  v_limite INTEGER;
  v_uso_atual INTEGER;
BEGIN
  -- Obter plano do tenant
  SELECT plano INTO v_plano
  FROM public.saas_tenants
  WHERE id = p_tenant_id;
  
  IF v_plano IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Obter limite baseado no recurso
  SELECT 
    CASE p_resource
      WHEN 'tecnicos' THEN max_tecnicos
      WHEN 'agendamentos_mes' THEN max_agendamentos_mes
      WHEN 'cupons' THEN max_cupons
      WHEN 'funcionarios_bot' THEN max_funcionarios_bot
      WHEN 'membros_dashboard' THEN max_membros_dashboard
      ELSE NULL
    END INTO v_limite
  FROM public.saas_plan_limits
  WHERE plano = v_plano;
  
  -- NULL significa ilimitado
  IF v_limite IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Contar uso atual baseado no recurso
  CASE p_resource
    WHEN 'tecnicos' THEN
      SELECT COUNT(*) INTO v_uso_atual
      FROM public.profiles p
      WHERE p.tenant_id = p_tenant_id
      AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'tecnico');
      
    WHEN 'agendamentos_mes' THEN
      SELECT COUNT(*) INTO v_uso_atual
      FROM public.agendamentos a
      WHERE a.tenant_id = p_tenant_id
      AND a.data_agendamento >= date_trunc('month', CURRENT_DATE)
      AND a.data_agendamento < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
      
    WHEN 'cupons' THEN
      SELECT COUNT(*) INTO v_uso_atual
      FROM public.cupons_desconto c
      WHERE c.tenant_id = p_tenant_id AND c.status = 'ativo';
      
    WHEN 'funcionarios_bot' THEN
      SELECT COUNT(*) INTO v_uso_atual
      FROM public.funcionarios_bot f
      WHERE f.tenant_id = p_tenant_id AND f.ativo = true;
      
    WHEN 'membros_dashboard' THEN
      SELECT COUNT(*) INTO v_uso_atual
      FROM public.profiles p
      WHERE p.tenant_id = p_tenant_id
      AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('admin', 'operador'));
      
    ELSE
      RETURN TRUE;
  END CASE;
  
  RETURN v_uso_atual < v_limite;
END;
$$;