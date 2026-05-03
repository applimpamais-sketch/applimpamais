-- Harden public agendamento inserts with tenant scoping.
-- Prevent anonymous inserts without tenant context.

DROP POLICY IF EXISTS "agendamentos_public_insert" ON public.agendamentos;
DROP POLICY IF EXISTS "Permitir INSERT anônimo em agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Permitir INSERT anonimo em agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Qualquer pessoa pode criar agendamento" ON public.agendamentos;

CREATE POLICY "agendamentos_public_insert"
ON public.agendamentos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (
    (
      auth.uid() IS NULL
      AND tenant_id = nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid
      AND EXISTS (
        SELECT 1
        FROM public.saas_tenants t
        WHERE t.id = agendamentos.tenant_id
          AND t.status = 'ativo'
      )
    )
    OR (
      auth.uid() IS NOT NULL
      AND (tenant_id = public.get_user_tenant_id() OR public.is_super_admin(auth.uid()))
    )
  )
  AND nome_cliente IS NOT NULL
  AND length(nome_cliente) >= 2
  AND length(nome_cliente) <= 200
  AND telefone IS NOT NULL
  AND length(telefone) >= 10
  AND length(telefone) <= 15
  AND endereco IS NOT NULL
  AND length(endereco) <= 500
  AND data_agendamento IS NOT NULL
  AND itens_carrinho IS NOT NULL
  AND valor_total IS NOT NULL
  AND valor_total >= 0
  AND valor_total <= 100000
  AND (bairro IS NULL OR length(bairro) <= 100)
  AND (cidade IS NULL OR length(cidade) <= 100)
  AND (cep IS NULL OR length(cep) <= 10)
  AND (nome_cliente !~ '[<>{}]')
  AND (endereco !~ '[<>{}]')
);
