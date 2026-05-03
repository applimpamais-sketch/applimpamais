-- Criar função específica para tabelas com coluna atualizado_em
CREATE OR REPLACE FUNCTION public.update_atualizado_em_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

-- Remover triggers antigos que usam a função errada
DROP TRIGGER IF EXISTS update_saas_tenants_updated_at ON public.saas_tenants;
DROP TRIGGER IF EXISTS update_saas_subscriptions_updated_at ON public.saas_subscriptions;

-- Criar novos triggers com a função correta
CREATE TRIGGER update_saas_tenants_atualizado_em
  BEFORE UPDATE ON public.saas_tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_atualizado_em_column();

CREATE TRIGGER update_saas_subscriptions_atualizado_em
  BEFORE UPDATE ON public.saas_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_atualizado_em_column();