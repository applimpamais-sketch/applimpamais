-- =====================================================
-- Corrigir Catálogo de Módulos e Ativar para RC Limpa Mais Master
-- =====================================================

-- 1. Inserir IARC Studio no catálogo de módulos
INSERT INTO saas_modulos (
  id, 
  codigo, 
  nome, 
  descricao, 
  preco_base, 
  categoria, 
  dependencias, 
  icone, 
  ordem, 
  ativo
) VALUES (
  gen_random_uuid(),
  'iarc_criativos',
  'IARC Studio',
  'Ferramenta de IA para criação de criativos publicitários, landing pages e copies persuasivas. Gere anúncios profissionais em segundos.',
  147.00,
  'marketing',
  '{"dashboard_gestao"}',
  'Sparkles',
  12,
  true
) ON CONFLICT (codigo) DO NOTHING;

-- 2. Adicionar IARC Studio ao plano Enterprise (default)
INSERT INTO plano_modulos_default (plano, modulo_id)
SELECT 'enterprise', id 
FROM saas_modulos 
WHERE codigo = 'iarc_criativos'
ON CONFLICT (plano, modulo_id) DO NOTHING;

-- 3. Ativar TODOS os módulos para RC Limpa Mais Master (tenant legado)
INSERT INTO tenant_modulos (tenant_id, modulo_id, status, ativado_em)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  sm.id,
  'ativo',
  now()
FROM saas_modulos sm
WHERE sm.ativo = true
  AND NOT EXISTS (
    SELECT 1 FROM tenant_modulos tm 
    WHERE tm.tenant_id = '00000000-0000-0000-0000-000000000001'
    AND tm.modulo_id = sm.id
  );

-- 4. Recalcular valor mensal do tenant master
UPDATE saas_tenants
SET valor_mensal = (
  SELECT COALESCE(SUM(COALESCE(tm.preco_negociado, sm.preco_base)), 0)
  FROM tenant_modulos tm
  JOIN saas_modulos sm ON tm.modulo_id = sm.id
  WHERE tm.tenant_id = '00000000-0000-0000-0000-000000000001' 
  AND tm.status = 'ativo'
)
WHERE id = '00000000-0000-0000-0000-000000000001';