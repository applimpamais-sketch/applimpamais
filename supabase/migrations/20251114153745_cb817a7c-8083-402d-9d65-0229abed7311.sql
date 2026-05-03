-- Criar template de boas-vindas para funcionários bot
INSERT INTO public.templates_mensagens (
  nome,
  titulo,
  categoria,
  conteudo,
  variaveis,
  ativo,
  uso_count
) VALUES (
  'Boas-vindas Funcionário Bot',
  '🤖 Bem-vindo ao Bot Financeiro!',
  'notificacao_tecnico',
  '👋 Olá *{nome_funcionario}*!

Você foi cadastrado no *Sistema RC Limpa+* e agora tem acesso ao nosso Bot Financeiro pelo WhatsApp! 🎉

📊 *O que você pode fazer:*

1️⃣ *Registrar Despesas*
   Exemplos:
   • "Paguei R$ 1.500 de aluguel hoje"
   • "Gastei 350 reais com combustível"
   • Enviar foto de nota fiscal

2️⃣ *Registrar Receitas*
   Exemplos:
   • "Recebi R$ 2.800 do serviço do João"
   • "Entrada de R$ 1.200 do aluguel"

3️⃣ *Enviar Comprovantes*
   • Tire foto da nota fiscal ou recibo
   • Adicione uma legenda curta
   • O sistema extrai automaticamente os valores!

🎤 *Áudios também funcionam!*
Pode enviar áudios falando sobre despesas/receitas que o sistema transcreve automaticamente.

✏️ *Comandos úteis:*
• Digite *"editar"* para corrigir o último lançamento
• Digite *"cancelar"* para descartar o último registro

⚠️ *Importante:*
• Sempre informe valor, categoria e data (se diferente de hoje)
• Seja claro e objetivo nas mensagens
• Em caso de dúvida, a equipe administrativa pode ajudar

💡 *Dica:* Quanto mais detalhes você fornecer, melhor será o registro!

Estamos aqui para facilitar seu trabalho! 💪

Equipe RC Limpa+ 💙',
  '["nome_funcionario"]'::jsonb,
  true,
  0
);