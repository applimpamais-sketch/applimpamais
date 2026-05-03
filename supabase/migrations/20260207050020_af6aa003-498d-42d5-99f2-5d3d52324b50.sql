-- Function to automatically recalculate tenant monthly value when modules change
CREATE OR REPLACE FUNCTION public.recalcular_valor_mensal_tenant()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_novo_valor NUMERIC;
BEGIN
  -- Get the tenant_id from either NEW or OLD record
  v_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
  
  -- Calculate the new total based on active modules
  SELECT COALESCE(SUM(COALESCE(tm.preco_negociado, sm.preco_base)), 0)
  INTO v_novo_valor
  FROM tenant_modulos tm
  JOIN saas_modulos sm ON tm.modulo_id = sm.id
  WHERE tm.tenant_id = v_tenant_id
    AND tm.status = 'ativo'
    AND tm.desativado_em IS NULL;
  
  -- Update the tenant's monthly value
  UPDATE saas_tenants 
  SET valor_mensal = v_novo_valor
  WHERE id = v_tenant_id;
  
  RAISE LOG '[recalcular_valor_mensal_tenant] Tenant % atualizado para R$ %', v_tenant_id, v_novo_valor;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to auto-recalculate when tenant_modulos changes
DROP TRIGGER IF EXISTS trigger_recalcular_valor_mensal ON tenant_modulos;
CREATE TRIGGER trigger_recalcular_valor_mensal
AFTER INSERT OR UPDATE OR DELETE ON tenant_modulos
FOR EACH ROW EXECUTE FUNCTION recalcular_valor_mensal_tenant();