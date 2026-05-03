-- Gerar disponibilidade para os próximos 120 dias a partir de hoje
-- para o tenant operacional RC Limpa Mais
-- Média de 6 vagas por dia (conforme operação do cliente)
INSERT INTO calendario_disponibilidade (data, vagas_disponiveis, vagas_totais, tenant_id)
SELECT 
  d::date,
  6,  -- vagas padrão disponíveis
  10, -- vagas totais
  '2046cf1c-af8c-4e5e-b992-092ec922c35c'
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '120 days', '1 day') AS d
WHERE NOT EXISTS (
  SELECT 1 FROM calendario_disponibilidade c 
  WHERE c.data = d::date
)
ON CONFLICT (data) DO NOTHING;