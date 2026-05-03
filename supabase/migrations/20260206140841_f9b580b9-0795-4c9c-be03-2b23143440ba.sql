-- Remoção completa do módulo CRM

-- 1. Tabelas de junção primeiro
DROP TABLE IF EXISTS public.crm_clientes_tags CASCADE;

-- 2. Tabelas com dependências
DROP TABLE IF EXISTS public.crm_interacoes CASCADE;
DROP TABLE IF EXISTS public.crm_tarefas CASCADE;
DROP TABLE IF EXISTS public.crm_pipeline CASCADE;

-- 3. Tabelas auxiliares
DROP TABLE IF EXISTS public.crm_tags CASCADE;

-- 4. Tabela principal por último
DROP TABLE IF EXISTS public.crm_clientes CASCADE;

-- Remover índices (CASCADE já remove, mas por segurança)
DROP INDEX IF EXISTS idx_crm_clientes_telefone;
DROP INDEX IF EXISTS idx_crm_clientes_tipo;
DROP INDEX IF EXISTS idx_crm_clientes_responsavel;
DROP INDEX IF EXISTS idx_crm_pipeline_cliente;
DROP INDEX IF EXISTS idx_crm_pipeline_estagio;
DROP INDEX IF EXISTS idx_crm_tarefas_cliente;
DROP INDEX IF EXISTS idx_crm_tarefas_status;
DROP INDEX IF EXISTS idx_crm_tarefas_data;
DROP INDEX IF EXISTS idx_crm_interacoes_cliente;