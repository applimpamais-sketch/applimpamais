-- Make calendario_disponibilidade uniqueness tenant-aware.
-- Old schema enforced unique(data), which blocks multi-tenant calendars.

ALTER TABLE public.calendario_disponibilidade
  DROP CONSTRAINT IF EXISTS calendario_disponibilidade_data_key;

DROP INDEX IF EXISTS calendario_disponibilidade_data_key;
DROP INDEX IF EXISTS uq_calendario_disponibilidade_data;
DROP INDEX IF EXISTS uq_calendario_disponibilidade_tenant_data;

CREATE UNIQUE INDEX uq_calendario_disponibilidade_tenant_data
ON public.calendario_disponibilidade (tenant_id, data);
