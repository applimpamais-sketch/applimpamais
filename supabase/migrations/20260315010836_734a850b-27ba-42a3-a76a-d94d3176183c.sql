-- Atualizar datas do fallback tenant para o tenant operacional RC Limpa Mais
UPDATE calendario_disponibilidade 
SET tenant_id = '2046cf1c-af8c-4e5e-b992-092ec922c35c'
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
  AND data >= CURRENT_DATE;