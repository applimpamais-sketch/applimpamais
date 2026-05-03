-- Drop the broken trigger
DROP TRIGGER IF EXISTS update_integracoes_updated_at ON public.integracoes;

-- Create a specific function for integracoes table
CREATE OR REPLACE FUNCTION public.update_integracoes_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger with correct function
CREATE TRIGGER update_integracoes_atualizado_em
  BEFORE UPDATE ON public.integracoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integracoes_atualizado_em();