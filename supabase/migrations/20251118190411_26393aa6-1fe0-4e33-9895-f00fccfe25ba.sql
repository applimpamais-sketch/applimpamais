-- Remover política antiga restritiva
DROP POLICY IF EXISTS "Allow anonymous insert for new bookings" ON agendamentos;

-- Criar nova política mais permissiva para inserts anônimos
CREATE POLICY "Allow public booking creation"
ON agendamentos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  nome_cliente IS NOT NULL 
  AND telefone IS NOT NULL 
  AND endereco IS NOT NULL
  AND data_agendamento IS NOT NULL
  AND itens_carrinho IS NOT NULL
  AND valor_total IS NOT NULL
);