ALTER TABLE historico_agendamentos DROP CONSTRAINT historico_agendamentos_tipo_alteracao_check;

ALTER TABLE historico_agendamentos ADD CONSTRAINT historico_agendamentos_tipo_alteracao_check 
CHECK (tipo_alteracao = ANY (ARRAY['status', 'dados', 'pagamento', 'observacao', 'agendamento_criado', 'data_remarcada']));