
-- Deletar registros relacionados primeiro (histórico, pagamentos, etc.)
DELETE FROM historico_agendamentos WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM agendamentos_historico WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM pagamentos_agendamentos WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM fila_avaliacoes WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM comunicacoes WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM fila_notificacoes_tecnico WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM historico_atribuicoes WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM tracking_sessions WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM entregas_equipamentos WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM reembolsos WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM ledger_entries WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

DELETE FROM parceiro_conversoes WHERE agendamento_id IN (
  SELECT id FROM agendamentos 
  WHERE nome_cliente ILIKE '%jesse%' 
     OR nome_cliente ILIKE '%jessefer%' 
     OR nome_cliente ILIKE '%maria%' 
     OR nome_cliente ILIKE '%teste%' 
     OR nome_cliente ILIKE '%matheus%'
);

-- Finalmente, deletar os agendamentos
DELETE FROM agendamentos 
WHERE nome_cliente ILIKE '%jesse%' 
   OR nome_cliente ILIKE '%jessefer%' 
   OR nome_cliente ILIKE '%maria%' 
   OR nome_cliente ILIKE '%teste%' 
   OR nome_cliente ILIKE '%matheus%';
