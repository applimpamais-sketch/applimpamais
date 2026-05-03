-- Primeiro, adicionar 'parceiro' como opção válida do check constraint
ALTER TABLE templates_mensagens DROP CONSTRAINT IF EXISTS templates_mensagens_categoria_check;

ALTER TABLE templates_mensagens ADD CONSTRAINT templates_mensagens_categoria_check 
CHECK (categoria IN ('agendamento', 'carrinho', 'notificacao_tecnico', 'parceiro'));

-- Inserir template de boas-vindas para parceiros (se não existir)
INSERT INTO templates_mensagens (nome, titulo, categoria, conteudo, variaveis, ativo)
SELECT 
  'Boas-vindas Parceiro Bot',
  'Boas-vindas ao Parceiro',
  'parceiro',
  '🎉 Parabéns *{nome}*, você foi aprovado(a) como parceiro RC Limpa+!

Agora você pode acompanhar suas indicações e comissões pelo WhatsApp!

🤝 *Comandos Disponíveis:*
• *@saldo* - Ver seu saldo disponível
• *@link* - Ver seu link de indicação
• *@conversoes* - Ver suas últimas vendas
• *@qrcode* - Ver informações do QR Code
• *@ajuda* - Lista de comandos

📲 *Seu link de indicação:*
{link_indicacao}

💡 *Como funciona:*
• Compartilhe seu link com amigos e clientes
• Eles ganham 20% de desconto na primeira compra
• Você ganha 10% de comissão em cada venda!

Acesse seu painel completo:
🔗 {link_portal}

Vamos juntos! 🚀
Equipe RC Limpa+ 💙',
  '["nome", "link_indicacao", "link_portal"]'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM templates_mensagens WHERE nome = 'Boas-vindas Parceiro Bot'
);