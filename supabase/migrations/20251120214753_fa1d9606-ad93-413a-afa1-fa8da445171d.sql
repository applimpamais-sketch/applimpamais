-- Corrigir warnings de segurança

-- 1. Adicionar search_path às funções que faltam
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM carrinhos_abandonados 
  WHERE status = 'abandonado' 
  AND created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('carrinhos_abandonados', deleted_count, '90 days');
  
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('audit_logs', deleted_count, '2 years');
  
  DELETE FROM leads_cupom 
  WHERE converteu_em_agendamento = false 
  AND created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  INSERT INTO data_retention_log (table_name, records_deleted, retention_period)
  VALUES ('leads_cupom', deleted_count, '2 years');
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_contact_info()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  
  IF NEW.telefone IS NOT NULL AND NEW.telefone !~ '^\d{10,11}$' THEN
    RAISE EXCEPTION 'Telefone inválido. Use formato: 11987654321';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Habilitar RLS em data_retention_log
ALTER TABLE data_retention_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_retention_admin_only" ON data_retention_log
FOR ALL USING (has_role(auth.uid(), 'admin'));