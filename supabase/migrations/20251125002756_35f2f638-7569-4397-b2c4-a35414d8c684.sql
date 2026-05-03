-- ============================================================================
-- CORREÇÃO: Função validate_contact_info para lidar com tabelas sem email
-- ============================================================================

-- Recriar função com verificação condicional de campos
CREATE OR REPLACE FUNCTION public.validate_contact_info()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  has_email_column boolean;
  has_telefone_column boolean;
BEGIN
  -- Verificar se a tabela TEM coluna email
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = TG_TABLE_SCHEMA 
    AND table_name = TG_TABLE_NAME 
    AND column_name = 'email'
  ) INTO has_email_column;
  
  -- Verificar se a tabela TEM coluna telefone
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = TG_TABLE_SCHEMA 
    AND table_name = TG_TABLE_NAME 
    AND column_name = 'telefone'
  ) INTO has_telefone_column;
  
  -- Validar email APENAS se a coluna existir
  IF has_email_column THEN
    EXECUTE format('
      SELECT CASE 
        WHEN $1.email IS NOT NULL AND $1.email !~ %L 
        THEN TRUE ELSE FALSE 
      END', '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    ) USING NEW INTO has_email_column; -- reutilizando variável
    
    IF has_email_column THEN
      RAISE EXCEPTION 'Email inválido';
    END IF;
  END IF;
  
  -- Validar telefone APENAS se a coluna existir
  IF has_telefone_column THEN
    EXECUTE format('
      SELECT CASE 
        WHEN $1.telefone IS NOT NULL AND $1.telefone !~ %L 
        THEN TRUE ELSE FALSE 
      END', '^\d{10,11}$'
    ) USING NEW INTO has_telefone_column; -- reutilizando variável
    
    IF has_telefone_column THEN
      RAISE EXCEPTION 'Telefone inválido. Use formato: 11987654321';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;