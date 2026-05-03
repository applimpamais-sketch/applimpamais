-- Consolidar dados do calendario que estão no fallback tenant para o tenant operacional RC Limpa Mais
-- Isso garante que todas as datas fiquem acessíveis com um único filtro de tenant

INSERT INTO calendario_disponibilidade (data, vagas_disponiveis, vagas_totais, tenant_id)
SELECT data, vagas_disponiveis, vagas_totais, '2046cf1c-af8c-4e5e-b992-092ec922c35c'
FROM calendario_disponibilidade
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
  AND data >= CURRENT_DATE
  AND data NOT IN (
    SELECT data FROM calendario_disponibilidade 
    WHERE tenant_id = '2046cf1c-af8c-4e5e-b992-092ec922c35c'
  )
ON CONFLICT (data) DO NOTHING;