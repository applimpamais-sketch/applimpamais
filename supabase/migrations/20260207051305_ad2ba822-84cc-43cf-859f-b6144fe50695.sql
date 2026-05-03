-- 1. Criar tabela de mapeamento plano → módulos padrão
CREATE TABLE IF NOT EXISTS plano_modulos_default (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano TEXT NOT NULL CHECK (plano IN ('starter', 'professional', 'enterprise')),
  modulo_id UUID NOT NULL REFERENCES saas_modulos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plano, modulo_id)
);

-- 2. Popular com os módulos de cada plano usando IDs conhecidos
-- Starter: Command Center + Shop Pro
INSERT INTO plano_modulos_default (plano, modulo_id) VALUES
  ('starter', '0186a3d1-e312-4906-af68-b852c108018f'), -- Command Center
  ('starter', '061a8332-559a-43f7-a210-4b931279e899'); -- Shop Pro

-- Professional: Starter + Finance Pro, ZapBot Pro, Track Live, Growth Kit, Insights Pro
INSERT INTO plano_modulos_default (plano, modulo_id) VALUES
  ('professional', '0186a3d1-e312-4906-af68-b852c108018f'), -- Command Center
  ('professional', '061a8332-559a-43f7-a210-4b931279e899'), -- Shop Pro
  ('professional', '26b7ed05-c9f7-42fd-8d2e-6ec1190b6d66'), -- Finance Pro
  ('professional', '470c9885-c2d9-4c06-97a5-9f29db806334'), -- ZapBot Pro
  ('professional', '79e3d0b2-ace2-4db1-aef1-91ead16a110e'), -- Track Live
  ('professional', '3c85075e-41bb-4828-b3ed-3b3a191937db'), -- Growth Kit
  ('professional', 'c489c377-95c7-4dde-9e1b-6db870364957'); -- Insights Pro

-- Enterprise: Todos os módulos ativos
INSERT INTO plano_modulos_default (plano, modulo_id) VALUES
  ('enterprise', '0186a3d1-e312-4906-af68-b852c108018f'), -- Command Center
  ('enterprise', '061a8332-559a-43f7-a210-4b931279e899'), -- Shop Pro
  ('enterprise', '26b7ed05-c9f7-42fd-8d2e-6ec1190b6d66'), -- Finance Pro
  ('enterprise', '470c9885-c2d9-4c06-97a5-9f29db806334'), -- ZapBot Pro
  ('enterprise', '79e3d0b2-ace2-4db1-aef1-91ead16a110e'), -- Track Live
  ('enterprise', '3c85075e-41bb-4828-b3ed-3b3a191937db'), -- Growth Kit
  ('enterprise', '638986c9-60d0-4343-adff-8218dbcee920'), -- Content Engine
  ('enterprise', '5047c917-0ab3-4c6c-bc27-1f35cc83ecfc'), -- Indica+
  ('enterprise', 'c489c377-95c7-4dde-9e1b-6db870364957'), -- Insights Pro
  ('enterprise', '9dcbfa87-f0cf-4e1a-8a87-bfdca810006c'), -- Connect API
  ('enterprise', 'c42d9fb6-5669-4749-a44f-8611a7cccb57'); -- White Label (Sua Marca)

-- 3. Criar função para sincronizar módulos quando plano muda
CREATE OR REPLACE FUNCTION sync_modulos_on_plan_change()
RETURNS TRIGGER AS $$
DECLARE
  v_modulo RECORD;
BEGIN
  -- Se o plano mudou
  IF OLD.plano IS DISTINCT FROM NEW.plano THEN
    -- Ativar todos os módulos do novo plano
    FOR v_modulo IN 
      SELECT pm.modulo_id, sm.preco_base
      FROM plano_modulos_default pm
      JOIN saas_modulos sm ON pm.modulo_id = sm.id AND sm.ativo = true
      WHERE pm.plano = NEW.plano
    LOOP
      INSERT INTO tenant_modulos (tenant_id, modulo_id, preco_negociado, status, ativado_em)
      VALUES (NEW.id, v_modulo.modulo_id, v_modulo.preco_base, 'ativo', now())
      ON CONFLICT (tenant_id, modulo_id) 
      DO UPDATE SET 
        status = 'ativo', 
        desativado_em = NULL,
        ativado_em = COALESCE(tenant_modulos.ativado_em, now()),
        preco_negociado = COALESCE(tenant_modulos.preco_negociado, EXCLUDED.preco_negociado);
    END LOOP;
    
    -- Recalcular valor_mensal baseado nos módulos ativos
    UPDATE saas_tenants
    SET valor_mensal = (
      SELECT COALESCE(SUM(COALESCE(tm.preco_negociado, sm.preco_base)), 0)
      FROM tenant_modulos tm
      JOIN saas_modulos sm ON tm.modulo_id = sm.id
      WHERE tm.tenant_id = NEW.id AND tm.status = 'ativo'
    )
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Criar trigger para sincronizar módulos quando plano muda
DROP TRIGGER IF EXISTS trigger_sync_modulos_on_plan_change ON saas_tenants;
CREATE TRIGGER trigger_sync_modulos_on_plan_change
AFTER UPDATE OF plano ON saas_tenants
FOR EACH ROW
WHEN (OLD.plano IS DISTINCT FROM NEW.plano)
EXECUTE FUNCTION sync_modulos_on_plan_change();

-- 5. Criar função para sincronizar módulos em novos tenants
CREATE OR REPLACE FUNCTION sync_modulos_on_tenant_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_modulo RECORD;
BEGIN
  -- Ativar todos os módulos do plano inicial
  FOR v_modulo IN 
    SELECT pm.modulo_id, sm.preco_base
    FROM plano_modulos_default pm
    JOIN saas_modulos sm ON pm.modulo_id = sm.id AND sm.ativo = true
    WHERE pm.plano = NEW.plano
  LOOP
    INSERT INTO tenant_modulos (tenant_id, modulo_id, preco_negociado, status, ativado_em)
    VALUES (NEW.id, v_modulo.modulo_id, v_modulo.preco_base, 'ativo', now())
    ON CONFLICT (tenant_id, modulo_id) DO NOTHING;
  END LOOP;
  
  -- Atualizar valor_mensal baseado nos módulos
  UPDATE saas_tenants
  SET valor_mensal = (
    SELECT COALESCE(SUM(COALESCE(tm.preco_negociado, sm.preco_base)), 0)
    FROM tenant_modulos tm
    JOIN saas_modulos sm ON tm.modulo_id = sm.id
    WHERE tm.tenant_id = NEW.id AND tm.status = 'ativo'
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Criar trigger para novos tenants
DROP TRIGGER IF EXISTS trigger_sync_modulos_on_tenant_insert ON saas_tenants;
CREATE TRIGGER trigger_sync_modulos_on_tenant_insert
AFTER INSERT ON saas_tenants
FOR EACH ROW
EXECUTE FUNCTION sync_modulos_on_tenant_insert();

-- 7. Habilitar RLS
ALTER TABLE plano_modulos_default ENABLE ROW LEVEL SECURITY;

-- 8. Política de leitura para todos (catálogo público)
CREATE POLICY "Qualquer um pode ler mapeamento de planos"
ON plano_modulos_default FOR SELECT
USING (true);

-- 9. Política de escrita apenas para super_admin
CREATE POLICY "Super admin pode gerenciar mapeamento"
ON plano_modulos_default FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));