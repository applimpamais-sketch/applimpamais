-- Adicionar comentários nas tabelas financeiras para forçar regeneração de tipos TypeScript

COMMENT ON TABLE public.despesas IS 'Registro de despesas operacionais da empresa';
COMMENT ON TABLE public.metas_financeiras IS 'Metas financeiras mensais definidas pela empresa';
COMMENT ON TABLE public.pagamentos_agendamentos IS 'Registros de pagamentos recebidos de agendamentos';
COMMENT ON TABLE public.entregas_equipamentos IS 'Controle de entregas de equipamentos aos clientes';

-- Adicionar comentários em colunas principais para melhor documentação
COMMENT ON COLUMN public.despesas.categoria IS 'Categoria da despesa (combustivel, manutencao, etc)';
COMMENT ON COLUMN public.despesas.status IS 'Status do pagamento da despesa (pendente, pago, vencido)';
COMMENT ON COLUMN public.metas_financeiras.status IS 'Status da meta (em_andamento, atingida, nao_atingida)';
COMMENT ON COLUMN public.pagamentos_agendamentos.status IS 'Status do pagamento (pendente, pago, cancelado)';