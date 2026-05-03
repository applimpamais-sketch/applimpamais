INSERT INTO saas_tenants (
  nome_empresa,
  nome_fantasia,
  email_contato,
  telefone,
  responsavel_nome,
  responsavel_email,
  responsavel_user_id,
  plano,
  status,
  valor_mensal,
  dia_vencimento,
  ativado_em,
  dominio_customizado
) VALUES (
  'RC Limpa Mais Ltda',
  'RC Limpa Mais',
  'rclimpamais@gmail.com',
  '(11) 99999-9999',
  'Caio Matos',
  'caiosm1998@hotmail.com',
  '0b1f84bb-aa64-4881-9634-9b8ea4464b5b',
  'enterprise',
  'ativo',
  997.00,
  10,
  NOW(),
  'rclimpamais.lovable.app'
);