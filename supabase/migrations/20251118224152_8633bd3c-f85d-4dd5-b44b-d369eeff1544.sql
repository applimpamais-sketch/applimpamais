-- Corrigir a função update_leads_white_label_updated_at com search_path seguro
CREATE OR REPLACE FUNCTION update_leads_white_label_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;