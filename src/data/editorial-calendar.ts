export type ContentType = 'reel' | 'carrossel' | 'stories';
export type ContentCategory = 'dor' | 'tutorial' | 'prova_social' | 'educativo' | 'meme' | 'oferta' | 'bastidores';

export interface ContentSlide {
  title?: string;
  content: string;
}

export interface ContentScene {
  timing: string;
  description: string;
  text?: string;
}

export interface EditorialDay {
  day: number;
  weekDay: string;
  week: number;
  title: string;
  type: ContentType;
  category: ContentCategory;
  module: string;
  hook: string;
  format: string;
  scenes?: ContentScene[];
  slides?: ContentSlide[];
  caption: string;
  hashtags: string[];
  published: boolean;
  publishedAt?: string;
  notes?: string;
}

export const editorialCalendar: EditorialDay[] = [
  // SEMANA 1 - Agendamento e Atendimento Automático
  {
    day: 1,
    weekDay: 'Segunda',
    week: 1,
    title: 'Dor do Atendimento',
    type: 'reel',
    category: 'dor',
    module: 'Agendamento Online',
    hook: 'Você responde 50 mensagens por dia... e fecha quantas?',
    format: 'POV com legenda + áudio trend',
    scenes: [
      { timing: '0-3s', description: 'Tela do WhatsApp com 47 mensagens não lidas', text: 'Você responde 50 mensagens por dia...' },
      { timing: '3-8s', description: 'Zoom dramático na tela', text: '...e fecha quantas?' },
      { timing: '8-18s', description: 'POV de você respondendo cliente às 23h. Cliente: "Quanto custa limpar um sofá 3 lugares?" Você digita resposta enquanto chegam +3 mensagens' },
      { timing: '18-25s', description: 'Corte para sistema: Catálogo online > Seleção de serviço > Confirmação automática', text: 'E se o cliente agendasse sozinho?' },
      { timing: '25-30s', description: 'Você com o celular, recebendo notificação: "Novo agendamento confirmado - R$ 280"', text: 'Enquanto você dorme.' },
    ],
    caption: `Quantas vendas você já perdeu por não responder a tempo?

O cliente de 2025 não espera. Ele vai pro concorrente.

A solução? Um sistema que:
- Mostra seus serviços e preços 24h
- Aceita agendamentos mesmo de madrugada  
- Confirma automaticamente no WhatsApp

Você trabalha, o sistema vende.

Link na bio para teste grátis.`,
    hashtags: ['higienizacao', 'limpezadeestofados', 'empreendedorismo', 'negociolocal', 'automacao'],
    published: false,
  },
  {
    day: 2,
    weekDay: 'Terça',
    week: 1,
    title: 'Tutorial Agendamento Online',
    type: 'reel',
    category: 'tutorial',
    module: 'Agendamento Online',
    hook: 'Em 60 segundos, seu cliente agenda sozinho. Olha isso:',
    format: 'Screencast com narração',
    scenes: [
      { timing: '0-3s', description: 'Tela inicial', text: 'Cliente agendando em 60 segundos' },
      { timing: '3-12s', description: 'Mostrando catálogo online com Sofá, Colchão, Combos', text: 'O cliente abre seu link, vê todos os serviços com preços.' },
      { timing: '12-20s', description: 'Selecionando: Sofá Retrátil > 3 lugares > Tecido', text: 'Escolhe o que precisa, seleciona modelo e tamanho' },
      { timing: '20-28s', description: 'Calendário com horários disponíveis', text: 'Vê sua agenda real e escolhe o melhor dia' },
      { timing: '28-35s', description: 'Notificações chegando nos dois celulares', text: 'Confirma, você recebe no WhatsApp, ele recebe confirmação' },
      { timing: '35-40s', description: 'Você sorrindo', text: 'Zero ligação. Zero resposta. Só venda.' },
    ],
    caption: `Seu cliente pode agendar sozinho em menos de 1 minuto.

Funciona assim:
1. Ele acessa seu link (bio, WhatsApp, Instagram)
2. Vê os serviços com preços claros
3. Escolhe data e horário disponível
4. Confirma e pronto

Você recebe o agendamento no celular.
Ele recebe confirmação automática.

Ninguém precisou ligar, esperar ou desistir.

Quer ver funcionando? Link na bio.`,
    hashtags: ['higienizacao', 'agendamentoonline', 'automacao', 'limpezaprofissional', 'gestao'],
    published: false,
  },
  {
    day: 3,
    weekDay: 'Quarta',
    week: 1,
    title: 'Prova Social - Case de Sucesso',
    type: 'carrossel',
    category: 'prova_social',
    module: 'Agendamento Online',
    hook: 'COMO ELE SAIU DE 12 PARA 47 ATENDIMENTOS/MÊS',
    format: '6 slides com depoimentos + números',
    slides: [
      { title: 'Capa', content: 'COMO ELE SAIU DE 12 PARA 47 ATENDIMENTOS/MÊS\n[Foto: Técnico com equipamento]' },
      { title: 'O Antes', content: '- Respondia cliente no outro dia\n- Passava orçamento por áudio\n- Perdia cliente que queria agendar à noite\n- 12 atendimentos no melhor mês' },
      { title: 'A Virada', content: 'Ativou o agendamento online e parou de perder venda.\n\n"Sempre que eu não conseguia responder rápido, o cliente já tinha fechado com outro. Agora ele agenda direto, 24 horas."' },
      { title: 'O Depois (90 dias)', content: '- 47 atendimentos/mês (+291%)\n- Ticket médio: R$ 280\n- Faturamento: R$ 13.160\n- Tempo respondendo: -4 horas/dia' },
      { title: 'O Que Mudou', content: '- Cliente vê catálogo profissional\n- Preços transparentes geram confiança\n- Confirmação automática reduz no-show\n- Você foca em executar, não em vender' },
      { title: 'CTA', content: 'QUER O MESMO RESULTADO?\n\nTeste grátis por 14 dias.\nLink na bio.\n\nNenhum cartão necessário.' },
    ],
    caption: `De 12 para 47 atendimentos em 90 dias.

Não foi sorte. Foi sistema.

Quando o cliente consegue agendar sozinho, 24 horas por dia, você para de perder venda.

O resultado fala por si:
📈 +291% de atendimentos
💰 R$ 13.160/mês de faturamento
⏰ -4 horas/dia respondendo WhatsApp

Quer ver como funciona? Link na bio.`,
    hashtags: ['casesucesso', 'higienizacao', 'resultados', 'empreendedor', 'negociolocal'],
    published: false,
  },
  {
    day: 4,
    weekDay: 'Quinta',
    week: 1,
    title: 'Educativo sobre No-Show',
    type: 'carrossel',
    category: 'educativo',
    module: 'Agendamento Online',
    hook: 'POR QUE 23% DOS SEUS CLIENTES NÃO APARECEM',
    format: '5 slides educativos',
    slides: [
      { title: 'Capa', content: 'POR QUE 23% DOS SEUS CLIENTES NÃO APARECEM\n(E como reduzir para menos de 5%)' },
      { title: 'Motivo 1', content: 'ESQUECIMENTO\n\nO cliente agendou 5 dias antes.\nNão recebeu lembrete.\nEsqueceu completamente.\n\nSOLUÇÃO:\nLembrete automático 24h antes pelo WhatsApp.' },
      { title: 'Motivo 2', content: 'ARREPENDIMENTO\n\nFechou por impulso.\nTeve tempo de repensar.\nNão quis cancelar por vergonha.\n\nSOLUÇÃO:\nConfirmação com detalhes do serviço gera compromisso real.\nLink para reagendar facilita a vida dele.' },
      { title: 'Motivo 3', content: 'FALTA DE COMPROMETIMENTO\n\nNão pagou nada adiantado.\nNão assinou nada.\nCusto zero de desistir.\n\nSOLUÇÃO:\nSinal/Taxa de confirmação.\nPolítica de reagendamento clara.' },
      { title: 'Resumo', content: 'RESUMO: 3 COISAS QUE REDUZEM NO-SHOW\n\n1. Lembrete automático 24h antes\n2. Confirmação com todos os detalhes\n3. Política clara de cancelamento\n\nTudo isso funciona no automático.\nLink na bio para configurar.' },
    ],
    caption: `23% dos agendamentos não aparecem.

Isso significa que a cada 10 clientes, 2 furam.
A cada 100, são 23 vendas perdidas.

Os 3 motivos principais:
1️⃣ Esquecimento (sem lembrete)
2️⃣ Arrependimento (sem compromisso)
3️⃣ Custo zero de desistir (sem sinal)

A boa notícia: dá pra reduzir pra menos de 5%.

A solução está no link da bio.`,
    hashtags: ['noshow', 'agendamento', 'gestao', 'higienizacao', 'dicasempreendedor'],
    published: false,
  },
  {
    day: 5,
    weekDay: 'Sexta',
    week: 1,
    title: 'Meme - Quanto Custa?',
    type: 'reel',
    category: 'meme',
    module: 'Agendamento Online',
    hook: 'Áudio: "Eu não aguento mais..." com cara de desespero',
    format: 'Trend com áudio viral',
    scenes: [
      { timing: '0-5s', description: 'Você olhando pro celular com cara de desespero', text: 'EU respondendo "quanto custa?" pela 47ª vez hoje' },
      { timing: '5-12s', description: 'Montagem rápida de prints: "Boa tarde, qual o valor?" / "Preço do sofá?" / "Quanto fica um colchão?" / "Passa orçamento?"', text: 'TODOS. OS. DIAS.' },
      { timing: '12-18s', description: 'Você mostrando a tela do catálogo online com preços', text: 'Aí eu descobri isso...' },
      { timing: '18-25s', description: 'Cliente navegando no catálogo', text: 'Agora eles veem sozinhos' },
      { timing: '25-30s', description: 'Você relaxando', text: 'E eu descanso.' },
    ],
    caption: `Só quem trabalha com higienização sabe.

A pergunta que mais aparece no WhatsApp:
"Quanto custa?"

50x por dia.
Todo santo dia.

A solução é simples: catálogo online com preços.

O cliente vê, escolhe e agenda.
Você para de ser secretária e vira empresário.

Link na bio.`,
    hashtags: ['meme', 'higienizacao', 'empreendedor', 'whatsapp', 'humor'],
    published: false,
  },
  {
    day: 6,
    weekDay: 'Sábado',
    week: 1,
    title: 'Oferta Direta - Agendamento',
    type: 'reel',
    category: 'oferta',
    module: 'Agendamento Online',
    hook: 'Se você limpa estofados e ainda não tem isso, você está perdendo dinheiro.',
    format: 'Você falando direto com a câmera',
    scenes: [
      { timing: '0-3s', description: 'Você olhando direto pra câmera', text: 'ATENÇÃO: Profissionais de higienização' },
      { timing: '3-12s', description: 'Você falando sobre o problema', text: 'Se você ainda responde cada cliente manualmente, passa orçamento por áudio e perde venda de madrugada...' },
      { timing: '12-20s', description: 'Contextualização do mercado', text: '...você está trabalhando em 2015. O mercado mudou. O cliente mudou.' },
      { timing: '20-30s', description: 'Apresentação da solução com lista de benefícios', text: 'Eu tenho uma plataforma que coloca sua empresa no padrão de 2025:\n- Agendamento online 24h\n- Catálogo profissional\n- Confirmação automática\n- Lembrete pro cliente não furar\n\nE você pode testar grátis por 14 dias.\nLink na bio. Sem cartão.' },
    ],
    caption: `Vou ser direto com você:

Se o seu cliente precisa te chamar no WhatsApp, 
esperar você responder, 
receber orçamento por áudio,
e você anotar tudo no papel...

Você está perdendo cliente todo dia.

O profissional de 2025 tem:
- Link de agendamento online
- Catálogo com preços
- Confirmação automática
- Lembrete no WhatsApp

E não custa uma fortuna.
Na verdade, custa menos que um atendimento por mês.

Teste 14 dias grátis. Link na bio.`,
    hashtags: ['oferta', 'higienizacao', 'agendamentoonline', 'testegratis', 'automacao'],
    published: false,
  },

  // SEMANA 2 - Dashboard e Financeiro
  {
    day: 8,
    weekDay: 'Segunda',
    week: 2,
    title: 'Dor do Controle Financeiro',
    type: 'reel',
    category: 'dor',
    module: 'Dashboard + Financeiro',
    hook: 'Você sabe quanto lucrou mês passado? Não faturou. LUCROU.',
    format: 'POV desafiador',
    scenes: [
      { timing: '0-3s', description: 'Close no rosto, pergunta desafiadora', text: 'Quanto você LUCROU mês passado?' },
      { timing: '3-10s', description: 'Calculadora na mão, contando: "Entrou 8 mil... gasolina 600... produto 800..."', text: 'Isso não é lucro. Isso é chute.' },
      { timing: '10-18s', description: 'Mostrando planilha bagunçada / papel amassado', text: 'Se você não sabe... Não tem como crescer.' },
      { timing: '18-28s', description: 'Mostrando dashboard financeiro do sistema com Receita / Despesas / Lucro Líquido / DRE automático', text: 'Isso é ter controle de verdade' },
      { timing: '28-35s', description: 'Você olhando pro celular satisfeito', text: 'Lucro real. Todo mês. Sem planilha.' },
    ],
    caption: `Me responde sinceramente:

Quanto você LUCROU mês passado?
(Não quanto ENTROU. Quanto SOBROU de verdade.)

Se você hesitou... você não sabe.

E se você não sabe, não tem como:
- Saber se o preço está certo
- Decidir se pode investir
- Entender se está crescendo

A solução é simples: 
Um sistema que faz o DRE automático pra você.

Receita - Custos - Despesas = Lucro Real

Link na bio pra ver funcionando.`,
    hashtags: ['financeiro', 'lucro', 'gestao', 'empreendedorismo', 'higienizacao'],
    published: false,
  },
  {
    day: 9,
    weekDay: 'Terça',
    week: 2,
    title: 'Tutorial Dashboard',
    type: 'reel',
    category: 'tutorial',
    module: 'Dashboard + Financeiro',
    hook: 'Tudo que você precisa saber do seu negócio. Uma tela.',
    format: 'Screencast com narração',
    scenes: [
      { timing: '0-3s', description: 'Tela inicial do Dashboard', text: 'Seu negócio em uma tela' },
      { timing: '3-10s', description: 'Zoom nos cards principais', text: 'Agendamentos do dia, faturamento, técnicos ativos' },
      { timing: '10-18s', description: 'Gráfico de evolução', text: 'Comparativo com mês anterior. Verde ou vermelho.' },
      { timing: '18-25s', description: 'Alertas: Pagamento pendente, cliente esperando confirmação', text: 'Alertas do que precisa de atenção' },
      { timing: '25-32s', description: 'Visão geral completa', text: 'Abre. Olha. Decide. Gestão em 30 segundos.' },
    ],
    caption: `Imagina abrir o celular e ver:
📊 Quantos agendamentos você tem hoje
💰 Quanto faturou essa semana
📈 Se está melhor que mês passado
⚠️ O que precisa de atenção

Tudo em uma tela. Sem planilha. Sem papel.

Isso é gestão de verdade.
Link na bio pra testar.`,
    hashtags: ['dashboard', 'gestao', 'higienizacao', 'controle', 'empreendedor'],
    published: false,
  },
  {
    day: 10,
    weekDay: 'Quarta',
    week: 2,
    title: 'Case Financeiro',
    type: 'carrossel',
    category: 'prova_social',
    module: 'Dashboard + Financeiro',
    hook: 'ELE ACHAVA QUE FATURAVA BEM. DESCOBRIU QUE LUCRAVA NADA.',
    format: '5 slides com case real',
    slides: [
      { title: 'Capa', content: 'ELE ACHAVA QUE FATURAVA BEM.\nDESCOBRIU QUE LUCRAVA NADA.' },
      { title: 'O Cenário', content: 'Faturamento mensal: R$ 12.000\nSensação: "Estou ganhando bem"\nRealidade: Não sobrava quase nada no final do mês' },
      { title: 'O Diagnóstico', content: 'Usando nosso Financeiro:\n\nReceita Bruta: R$ 12.000\n- Combustível: R$ 1.800\n- Produtos: R$ 1.200\n- Manutenção: R$ 800\n- Marketing: R$ 600\n- Outros custos: R$ 2.400\n\nLucro Real: R$ 5.200 (43%)\n\n"Eu achava que sobrava 10 mil."' },
      { title: 'As Mudanças', content: '1. Ajustou preços após ver custos reais\n2. Trocou fornecedor de produto\n3. Otimizou rotas (menos combustível)\n4. Cortou gasto de marketing que não convertia\n\nRESULTADO APÓS 60 DIAS:\nFaturamento: R$ 11.500\nLucro: R$ 6.900 (60%)' },
      { title: 'A Lição', content: '"Não é sobre faturar mais.\nÉ sobre lucrar mais."\n\nE pra lucrar mais, você precisa SABER quanto lucra.\n\nDashboard financeiro automático.\nLink na bio.' },
    ],
    caption: `Faturamento alto não significa lucro alto.

Esse profissional achava que estava ganhando bem.
Faturava R$ 12.000 por mês.

Quando colocou tudo no sistema, descobriu:
- Gastava R$ 6.800 sem perceber
- Lucro real era 43%, não 80%
- Tinha gastos que nem lembrava

Após 60 dias ajustando:
- Faturamento: R$ 11.500 (menor)
- Lucro: R$ 6.900 (maior!)

A lição: não é sobre faturar mais.
É sobre lucrar mais.

Link na bio.`,
    hashtags: ['financeiro', 'lucro', 'case', 'higienizacao', 'gestaofinanceira'],
    published: false,
  },
  {
    day: 11,
    weekDay: 'Quinta',
    week: 2,
    title: 'Como Precificar Serviço',
    type: 'carrossel',
    category: 'educativo',
    module: 'Dashboard + Financeiro',
    hook: 'COMO PRECIFICAR SEU SERVIÇO SEM CHUTAR',
    format: '6 slides educativos',
    slides: [
      { title: 'Capa', content: 'COMO PRECIFICAR SEU SERVIÇO SEM CHUTAR\n(O método que garante lucro)' },
      { title: 'Passo 1', content: 'CUSTOS DIRETOS\n\nO que você gasta POR ATENDIMENTO?\n- Produto (shampoo, química)\n- Combustível (ida e volta)\n- Desgaste equipamento\n\nExemplo Sofá 3 lugares:\nProduto: R$ 15\nCombustível: R$ 25\nDesgaste: R$ 10\nTOTAL: R$ 50' },
      { title: 'Passo 2', content: 'CUSTOS FIXOS\n\nDivida pelo número de atendimentos/mês:\n- Aluguel: R$ X\n- Internet/Celular: R$ X\n- Marketing: R$ X\n- Outros: R$ X\n\nTotal fixo: R$ 1.500\nAtendimentos/mês: 30\nCusto fixo por atendimento: R$ 50' },
      { title: 'Passo 3', content: 'SEU SALÁRIO\n\nQuanto você quer ganhar por hora?\nTempo por sofá: 2 horas\nValor/hora desejado: R$ 50\n\nSeu trabalho: R$ 100' },
      { title: 'A Conta Final', content: 'Custo direto: R$ 50\nCusto fixo rateado: R$ 50\nSeu trabalho: R$ 100\nMargem de segurança (20%): R$ 40\n\nPREÇO MÍNIMO: R$ 240\n\nCobrar menos = prejuízo garantido.' },
      { title: 'Automatize', content: 'COMO AUTOMATIZAR ISSO?\n\nNosso módulo financeiro:\n- Calcula custos automaticamente\n- Mostra margem por serviço\n- Alerta quando preço está errado\n\nNunca mais chute preço.\nLink na bio.' },
    ],
    caption: `Você sabe quanto custa fazer um serviço?

Se não sabe, está chutando o preço.
E quem chuta, perde dinheiro.

O método simples:
1️⃣ Custos diretos (produto, combustível, desgaste)
2️⃣ Custos fixos rateados (aluguel, celular, marketing)
3️⃣ Seu salário por hora
4️⃣ Margem de segurança (20%)

Exemplo prático:
Sofá 3 lugares = Custo R$ 200
Preço mínimo = R$ 240

Cobrar menos = prejuízo.

Quer automatizar esse cálculo? Link na bio.`,
    hashtags: ['precificacao', 'preco', 'lucro', 'higienizacao', 'gestao'],
    published: false,
  },
  {
    day: 12,
    weekDay: 'Sexta',
    week: 2,
    title: 'Meme Financeiro',
    type: 'reel',
    category: 'meme',
    module: 'Dashboard + Financeiro',
    hook: 'Áudio: "Money money money"',
    format: 'Trend com transições rápidas',
    scenes: [
      { timing: '0-5s', description: 'Notificações de pagamento chegando', text: 'O dinheiro entrando' },
      { timing: '5-12s', description: 'Lista gigante de despesas', text: 'O dinheiro saindo' },
      { timing: '12-18s', description: 'Bolso vazio (humor)', text: 'O que sobra' },
      { timing: '18-25s', description: 'Dashboard financeiro com gráficos', text: 'Até você descobrir onde tá o ralo' },
      { timing: '25-30s', description: 'Lucro crescendo no gráfico', text: 'Aí sim.' },
    ],
    caption: `O dinheiro entra... 💰
O dinheiro sai... 💸
E você não sabe pra onde vai... 🤷

Até você descobrir onde tá o ralo.

Dashboard financeiro mostra:
- Onde você gasta mais
- Qual serviço dá mais lucro
- Se está crescendo ou não

Para de jogar dinheiro fora.
Link na bio.`,
    hashtags: ['meme', 'dinheiro', 'financeiro', 'higienizacao', 'humor'],
    published: false,
  },
  {
    day: 13,
    weekDay: 'Sábado',
    week: 2,
    title: 'Oferta Financeiro',
    type: 'reel',
    category: 'oferta',
    module: 'Dashboard + Financeiro',
    hook: 'O sistema que te mostra ONDE você tá perdendo dinheiro.',
    format: 'Você falando direto',
    scenes: [
      { timing: '0-3s', description: 'Olhando pra câmera', text: 'Vou te mostrar algo que vai mudar sua visão do negócio.' },
      { timing: '3-15s', description: 'Mostrando benefícios', text: 'Um dashboard que mostra:\n- Quanto você fatura por dia/semana/mês\n- Quanto gasta com cada categoria\n- Qual serviço dá mais lucro\n- Se você tá no caminho certo' },
      { timing: '15-25s', description: 'Fechamento', text: 'Sabe aquela sensação de "não sei pra onde vai meu dinheiro"? Acaba hoje.' },
      { timing: '25-30s', description: 'CTA', text: 'Teste grátis. Link na bio.' },
    ],
    caption: `Você trabalha o mês inteiro...
E no final não sabe quanto sobrou.

Isso acaba hoje.

Com nosso dashboard financeiro você vê:
📊 Faturamento por dia/semana/mês
💸 Gastos por categoria
📈 Qual serviço dá mais lucro
✅ Se está no caminho certo

Chega de achismo.
Chega de planilha.

Teste grátis por 14 dias.
Link na bio.`,
    hashtags: ['oferta', 'financeiro', 'dashboard', 'testegratis', 'higienizacao'],
    published: false,
  },

  // SEMANA 3 - Ordem de Serviço e Rastreamento
  {
    day: 15,
    weekDay: 'Segunda',
    week: 3,
    title: 'Dor do Papel',
    type: 'reel',
    category: 'dor',
    module: 'Ordem de Serviço + Rastreamento',
    hook: 'Você ainda anota atendimento em papel?',
    format: 'POV com contraste',
    scenes: [
      { timing: '0-5s', description: 'Bloco de anotações sujo, amassado', text: 'Isso é organização?' },
      { timing: '5-15s', description: 'Cliente ligando: "Vocês limparam meu sofá mês passado, quanto foi mesmo?" Você procurando em papéis', text: 'Profissional?' },
      { timing: '15-25s', description: 'Ordem de Serviço digital com foto antes/depois, checklist, assinatura digital', text: 'Isso é profissional.' },
      { timing: '25-30s', description: 'Fechamento', text: 'O cliente recebe por WhatsApp.\nVocê tem histórico pra sempre.\nZero papel. Zero bagunça.' },
    ],
    caption: `Cliente liga: "Quanto foi aquele sofá que vocês limparam?"

Você: "Deixa eu ver aqui..." (procurando em 47 papéis)

Isso é amador.

Profissional de verdade tem:
📱 OS digital com foto antes/depois
✅ Checklist do que foi feito
✍️ Assinatura do cliente
📤 Envio automático por WhatsApp

O cliente guarda. Você guarda. 
Histórico pra sempre.

Link na bio.`,
    hashtags: ['ordemdeservico', 'profissional', 'organizacao', 'higienizacao', 'gestao'],
    published: false,
  },
  {
    day: 16,
    weekDay: 'Terça',
    week: 3,
    title: 'Tutorial OS Digital',
    type: 'reel',
    category: 'tutorial',
    module: 'Ordem de Serviço + Rastreamento',
    hook: 'Como gerar uma OS profissional em 30 segundos',
    format: 'Screencast passo a passo',
    scenes: [
      { timing: '0-5s', description: 'Abrindo agendamento no sistema', text: '1. Abrir agendamento' },
      { timing: '5-10s', description: 'Tirando foto do sofá sujo', text: '2. Foto ANTES' },
      { timing: '10-15s', description: 'Marcando checklist: limpou, impermeabilizou', text: '3. Marcar o que foi feito' },
      { timing: '15-20s', description: 'Tirando foto do sofá limpo', text: '4. Foto DEPOIS' },
      { timing: '20-25s', description: 'Cliente assinando no celular', text: '5. Cliente assina' },
      { timing: '25-30s', description: 'OS sendo enviada por WhatsApp', text: 'OS gerada e enviada automaticamente!' },
    ],
    caption: `Gerar uma OS profissional em 30 segundos:

1️⃣ Abrir agendamento
2️⃣ Tirar foto ANTES
3️⃣ Marcar checklist (limpou, impermeabilizou)
4️⃣ Tirar foto DEPOIS
5️⃣ Cliente assina no celular
6️⃣ OS gerada automaticamente
7️⃣ Enviada por WhatsApp

O cliente guarda como comprovante.
Você guarda como histórico.

Profissionalismo que impressiona.
Link na bio.`,
    hashtags: ['tutorial', 'ordemdeservico', 'profissional', 'higienizacao', 'tecnologia'],
    published: false,
  },
  {
    day: 17,
    weekDay: 'Quarta',
    week: 3,
    title: 'Benefícios da OS Digital',
    type: 'carrossel',
    category: 'educativo',
    module: 'Ordem de Serviço + Rastreamento',
    hook: '5 MOTIVOS PARA USAR OS DIGITAL',
    format: '5 slides com benefícios',
    slides: [
      { title: 'Capa', content: '5 MOTIVOS PARA USAR OS DIGITAL\n(E abandonar o papel de vez)' },
      { title: 'Profissionalismo', content: '1. PROFISSIONALISMO PERCEBIDO\n\nCliente que recebe OS digital:\n- Percebe valor maior\n- Confia mais no serviço\n- Indica com mais facilidade\n\nPapel amassado = amador\nOS digital = profissional' },
      { title: 'Histórico', content: '2. HISTÓRICO DO CLIENTE\n\nVocê sabe:\n- Quando atendeu ele pela última vez\n- O que foi feito\n- Quanto cobrou\n\nPróximo atendimento?\nUpsell fácil: "Da última vez fizemos X, quer incluir Y?"' },
      { title: 'Prova', content: '3. FOTO ANTES/DEPOIS\n\n- Prova do seu trabalho\n- Cliente vê a transformação\n- Material para redes sociais\n- Proteção contra reclamações\n\n"Meu sofá já estava assim" não cola mais.' },
      { title: 'Proteção', content: '4. ASSINATURA DIGITAL\n\n- Comprovante legal\n- Cliente confirmou que aprovou\n- Proteção jurídica\n- Evita contestação\n\nVale como documento.' },
      { title: 'CTA', content: 'RESULTADO:\n\nMais profissionalismo.\nMais confiança.\nMais indicações.\nMais vendas.\n\nTeste grátis por 14 dias.\nLink na bio.' },
    ],
    caption: `Por que OS digital é melhor que papel?

1️⃣ Profissionalismo percebido
Cliente vê valor e indica mais

2️⃣ Histórico completo
Sabe tudo do cliente pro próximo atendimento

3️⃣ Foto antes/depois
Prova do trabalho e proteção contra reclamação

4️⃣ Assinatura digital
Comprovante legal que vale como documento

5️⃣ Envio automático
Cliente recebe tudo no WhatsApp

Resultado: mais confiança, mais indicações, mais vendas.

Link na bio.`,
    hashtags: ['ordemdeservico', 'digital', 'profissional', 'higienizacao', 'gestao'],
    published: false,
  },
  {
    day: 18,
    weekDay: 'Quinta',
    week: 3,
    title: 'Rastreamento em Tempo Real',
    type: 'carrossel',
    category: 'educativo',
    module: 'Ordem de Serviço + Rastreamento',
    hook: 'SEU CLIENTE SABE ONDE VOCÊ ESTÁ?',
    format: '5 slides sobre tracking',
    slides: [
      { title: 'Capa', content: 'SEU CLIENTE SABE ONDE VOCÊ ESTÁ?\n(Como funcionar tipo iFood)' },
      { title: 'Problema', content: 'O PROBLEMA:\n\nCliente agendou pras 14h.\n\nSão 14:05.\n\nEle já te mandou:\n"Já está vindo?"\n"Que horas chega?"\n"Aconteceu alguma coisa?"\n\nVocê: No trânsito, não pode responder.' },
      { title: 'Solução', content: 'A SOLUÇÃO:\n\nRastreamento em tempo real.\n\nCliente abre o link e vê:\n📍 Onde você está\n⏱️ Tempo estimado de chegada\n🚗 Que você está a caminho\n\nIgual iFood. Igual Uber.' },
      { title: 'Benefícios', content: 'OS BENEFÍCIOS:\n\n✅ Menos ligações durante trajeto\n✅ Cliente mais tranquilo\n✅ Profissionalismo tipo app grande\n✅ Mais confiança = mais indicação\n✅ Você foca em dirigir, não em responder' },
      { title: 'CTA', content: 'RESULTADO:\n\nCliente vê você chegando.\nVocê para de responder no trânsito.\nTodo mundo mais tranquilo.\n\nAtivação simples.\nLink na bio.' },
    ],
    caption: `"Já está vindo?"
"Que horas chega?"
"Aconteceu alguma coisa?"

Quantas vezes você recebe isso por dia?

Com rastreamento em tempo real:
📍 Cliente vê onde você está
⏱️ Tempo estimado de chegada
🚗 Que você está a caminho

Igual iFood. Igual Uber.

Menos ligações.
Mais profissionalismo.
Mais tranquilidade.

Link na bio.`,
    hashtags: ['rastreamento', 'tracking', 'profissional', 'higienizacao', 'tecnologia'],
    published: false,
  },
  {
    day: 19,
    weekDay: 'Sexta',
    week: 3,
    title: 'Meme Rastreamento',
    type: 'reel',
    category: 'meme',
    module: 'Ordem de Serviço + Rastreamento',
    hook: 'Cliente ligando 10x vs Cliente com rastreamento',
    format: 'Antes/Depois com humor',
    scenes: [
      { timing: '0-10s', description: 'Tela dividida: Você no trânsito + WhatsApp explodindo de mensagens do cliente perguntando "já está vindo?"', text: 'Sem rastreamento' },
      { timing: '10-20s', description: 'Cliente olhando tranquilo pro celular vendo pontinho se movendo no mapa', text: 'Com rastreamento' },
      { timing: '20-30s', description: 'Você chegando, cliente já esperando na porta sorrindo', text: 'Paz.' },
    ],
    caption: `SEM rastreamento:
📱 "Já está vindo?"
📱 "Que horas chega?"
📱 "Tá perto?"
📱 "Aconteceu algo?"
📱 "Alôôô?"

COM rastreamento:
😌 Cliente vê você no mapa
😌 Sabe que está a 5 min
😌 Te espera tranquilo

A diferença entre amador e profissional.

Link na bio.`,
    hashtags: ['meme', 'rastreamento', 'higienizacao', 'humor', 'profissional'],
    published: false,
  },
  {
    day: 20,
    weekDay: 'Sábado',
    week: 3,
    title: 'Oferta OS + Tracking',
    type: 'reel',
    category: 'oferta',
    module: 'Ordem de Serviço + Rastreamento',
    hook: 'Sua empresa funcionando como o iFood. Só que pra limpeza de estofados.',
    format: 'Comparativo direto',
    scenes: [
      { timing: '0-5s', description: 'Tela do iFood com rastreamento', text: 'Isso é o iFood' },
      { timing: '5-15s', description: 'Tela do seu sistema com rastreamento', text: 'Isso é a sua empresa' },
      { timing: '15-25s', description: 'Lista de funcionalidades: OS digital, foto antes/depois, rastreamento, assinatura', text: 'Mesma experiência. Seu cliente merece.' },
      { timing: '25-30s', description: 'CTA', text: 'Teste 14 dias grátis. Link na bio.' },
    ],
    caption: `Por que o iFood funciona tão bem?

✅ Cliente vê onde está o entregador
✅ Sabe quanto tempo falta
✅ Recebe confirmação automática
✅ Tem histórico de pedidos

Agora imagina sua empresa assim:

✅ Cliente vê onde você está
✅ Recebe OS digital por WhatsApp
✅ Foto antes/depois do serviço
✅ Assinatura digital

Mesma experiência profissional.
Preço que cabe no bolso.

Teste 14 dias grátis. Link na bio.`,
    hashtags: ['oferta', 'ordemdeservico', 'rastreamento', 'ifood', 'higienizacao'],
    published: false,
  },

  // SEMANA 4 - Marketing e Parcerias
  {
    day: 22,
    weekDay: 'Segunda',
    week: 4,
    title: 'Dor de Depender de Indicação',
    type: 'reel',
    category: 'dor',
    module: 'Marketing + Parcerias',
    hook: 'Você depende de indicação pra ter cliente?',
    format: 'Reflexão direta',
    scenes: [
      { timing: '0-5s', description: 'Você pensativo', text: 'Você depende de indicação pra ter cliente?' },
      { timing: '5-15s', description: 'Gráfico irregular de clientes: semana boa 8, semana ruim 1', text: 'Indicação é ótimo. Mas não dá pra controlar.\nSemana boa: 8 clientes.\nSemana ruim: 1 cliente.' },
      { timing: '15-25s', description: 'Mostrando programa de parcerias no sistema', text: 'E se você transformasse indicação em SISTEMA?\nSeus clientes satisfeitos viram parceiros.\nCada indicação = comissão pra eles.\nVocê paga só quando vende.' },
      { timing: '25-30s', description: 'Fechamento', text: 'Marketing grátis que funciona.' },
    ],
    caption: `Indicação é ótimo.
Mas depender dela é perigoso.

Semana boa: 8 clientes.
Semana ruim: 1 cliente.

A solução? Transformar indicação em SISTEMA.

Como funciona:
1️⃣ Cliente satisfeito vira parceiro
2️⃣ Recebe código de indicação
3️⃣ Cada venda = comissão pra ele
4️⃣ Você paga só quando vende

Marketing que funciona no automático.
E não custa nada adiantado.

Link na bio.`,
    hashtags: ['marketing', 'indicacao', 'parcerias', 'higienizacao', 'vendas'],
    published: false,
  },
  {
    day: 23,
    weekDay: 'Terça',
    week: 4,
    title: 'Tutorial Programa de Parcerias',
    type: 'reel',
    category: 'tutorial',
    module: 'Marketing + Parcerias',
    hook: 'Como transformar cliente em vendedor',
    format: 'Screencast tutorial',
    scenes: [
      { timing: '0-5s', description: 'Tela de cadastro de parceiro', text: '1. Cadastra o parceiro' },
      { timing: '5-10s', description: 'Gerando código único', text: '2. Gera código exclusivo' },
      { timing: '10-15s', description: 'Parceiro compartilhando código', text: '3. Parceiro divulga o código' },
      { timing: '15-20s', description: 'Cliente usando código no checkout', text: '4. Cliente usa e ganha desconto' },
      { timing: '20-25s', description: 'Dashboard mostrando vendas e comissões', text: '5. Você vê tudo: vendas, comissões, ROI' },
      { timing: '25-30s', description: 'Parceiro recebendo comissão', text: '6. Parceiro recebe. Todo mundo ganha.' },
    ],
    caption: `Transforme clientes em vendedores em 5 passos:

1️⃣ Cadastra como parceiro
2️⃣ Gera código exclusivo dele
3️⃣ Ele divulga pros conhecidos
4️⃣ Cliente usa e ganha desconto
5️⃣ Parceiro recebe comissão

Você acompanha tudo:
📊 Quantas vendas cada parceiro trouxe
💰 Quanto de comissão gerou
📈 ROI de cada parceria

Marketing que se paga sozinho.

Link na bio.`,
    hashtags: ['tutorial', 'parcerias', 'indicacao', 'marketing', 'higienizacao'],
    published: false,
  },
  {
    day: 24,
    weekDay: 'Quarta',
    week: 4,
    title: 'Recuperação de Carrinho Abandonado',
    type: 'carrossel',
    category: 'educativo',
    module: 'Marketing + Parcerias',
    hook: '67% DOS SEUS ORÇAMENTOS SÃO ABANDONADOS',
    format: '5 slides educativos',
    slides: [
      { title: 'Capa', content: '67% DOS SEUS ORÇAMENTOS SÃO ABANDONADOS\n(Como recuperar 15-25% deles)' },
      { title: 'O Problema', content: 'O PROBLEMA:\n\nCliente entra no site.\nVê os serviços.\nAdiciona no carrinho.\n\n...e vai embora.\n\n67% fazem isso.\nVocê perde 2 a cada 3.' },
      { title: 'A Solução', content: 'A SOLUÇÃO:\n\nMensagem automática 1 hora depois:\n\n"Oi [nome]! Vi que você estava olhando [serviço].\nFicou alguma dúvida?\nPosso te ajudar a finalizar?"\n\nSimples. Pessoal. Efetivo.' },
      { title: 'Resultados', content: 'OS RESULTADOS:\n\n📈 15-25% dos carrinhos recuperados\n💰 Vendas que estavam perdidas\n🔄 Sem esforço manual\n⏰ Funciona 24 horas\n\nSe você tem 10 carrinhos abandonados por semana,\nrecupera 2-3 vendas extras.' },
      { title: 'CTA', content: 'COMO ATIVAR:\n\nConfiguração em 5 minutos.\nMensagem personalizada.\nEnvio automático.\n\nTeste grátis por 14 dias.\nLink na bio.' },
    ],
    caption: `De cada 3 clientes que olham seus serviços...
2 vão embora sem agendar.

67% de abandono.
Isso é normal. Mas recuperável.

Com mensagem automática de recuperação:
⏰ 1 hora depois do abandono
📱 Mensagem personalizada no WhatsApp
❓ "Ficou alguma dúvida?"

Resultado: 15-25% voltam e agendam.

São vendas que estavam PERDIDAS.

Ativação em 5 minutos.
Link na bio.`,
    hashtags: ['carrinho', 'recuperacao', 'vendas', 'marketing', 'higienizacao'],
    published: false,
  },
  {
    day: 25,
    weekDay: 'Quinta',
    week: 4,
    title: 'Como Usar Cupons de Desconto',
    type: 'carrossel',
    category: 'educativo',
    module: 'Marketing + Parcerias',
    hook: 'CUPONS: COMO USAR SEM DESTRUIR SUA MARGEM',
    format: '5 slides estratégicos',
    slides: [
      { title: 'Capa', content: 'CUPONS: COMO USAR SEM DESTRUIR SUA MARGEM\n(Estratégia que funciona)' },
      { title: 'Erro Comum', content: 'O ERRO:\n\n"10% de desconto pra todo mundo!"\n\n- Quem ia pagar cheio, paga menos\n- Margem reduzida sem necessidade\n- Cliente acostumado a esperar promoção\n- Prejuízo disfarçado de venda' },
      { title: 'Estratégia Certa', content: 'A ESTRATÉGIA CERTA:\n\nCupom para situações específicas:\n\n🆕 Primeiro agendamento (aquisição)\n🔄 Cliente sumido há 90 dias (reativação)\n📦 Combo de serviços (ticket maior)\n📅 Dia/horário vazio (ocupação)\n\nDesconto com propósito, não com desespero.' },
      { title: 'Exemplos', content: 'EXEMPLOS PRÁTICOS:\n\n"PRIMEIRA10" → 10% no primeiro serviço\n"VOLTEI15" → 15% pra quem não agenda há 3 meses\n"COMBO20" → 20% em 3+ itens\n"QUINTA10" → 10% às quintas (dia fraco)\n\nCada cupom tem um objetivo claro.' },
      { title: 'CTA', content: 'NO SISTEMA:\n\n✅ Cria cupons personalizados\n✅ Define validade\n✅ Limita uso por cliente\n✅ Acompanha resultado\n\nDesconto inteligente, não aleatório.\n\nLink na bio.' },
    ],
    caption: `Cupom de desconto pode ser:
❌ Prejuízo disfarçado de venda
✅ Estratégia inteligente de crescimento

A diferença está no PROPÓSITO.

Cupons estratégicos:
🆕 Primeiro serviço → Aquisição
🔄 Cliente sumido → Reativação  
📦 Combo de itens → Ticket maior
📅 Dia vazio → Ocupação

Cada cupom com objetivo claro.
Não desconto por desespero.

Configure no sistema. Link na bio.`,
    hashtags: ['cupom', 'desconto', 'estrategia', 'marketing', 'higienizacao'],
    published: false,
  },
  {
    day: 26,
    weekDay: 'Sexta',
    week: 4,
    title: 'Meme Marketing',
    type: 'reel',
    category: 'meme',
    module: 'Marketing + Parcerias',
    hook: 'R$ 500 em ads vs. Programa de parcerias',
    format: 'Comparativo com humor',
    scenes: [
      { timing: '0-10s', description: 'Você colocando dinheiro no Meta Ads, expressão de dor', text: 'Eu gastando R$ 500 em ads' },
      { timing: '10-15s', description: 'Resultado: 2 leads, 0 vendas', text: 'Resultado: 2 leads, 0 vendas' },
      { timing: '15-25s', description: 'Clientes felizes indicando amigos, código de parceiro', text: 'Programa de parcerias: R$ 0 investido, 5 vendas' },
      { timing: '25-30s', description: 'Você sorrindo com dinheiro', text: 'Marketing que se paga sozinho.' },
    ],
    caption: `Gastando R$ 500 em Meta Ads:
💸 Investimento: R$ 500
📊 Leads: 2
💰 Vendas: 0
😭 ROI: -100%

Programa de Parcerias:
💸 Investimento: R$ 0
📊 Indicações: 8
💰 Vendas: 5
💵 Comissão paga: R$ 150
😎 ROI: ∞

Clientes satisfeitos vendem melhor que algoritmo.

Link na bio.`,
    hashtags: ['meme', 'marketing', 'ads', 'parcerias', 'higienizacao'],
    published: false,
  },
  {
    day: 27,
    weekDay: 'Sábado',
    week: 4,
    title: 'Oferta Completa',
    type: 'reel',
    category: 'oferta',
    module: 'Marketing + Parcerias',
    hook: 'Tudo que você precisa pra profissionalizar sua empresa de higienização. Em uma plataforma.',
    format: 'Compilado de funcionalidades',
    scenes: [
      { timing: '0-5s', description: 'Hook forte', text: 'Uma plataforma. Tudo que você precisa.' },
      { timing: '5-10s', description: 'Agendamento online', text: '📅 Agendamento 24h' },
      { timing: '10-15s', description: 'Dashboard financeiro', text: '📊 Financeiro automático' },
      { timing: '15-20s', description: 'OS digital', text: '📝 OS profissional' },
      { timing: '20-25s', description: 'Rastreamento + Parcerias', text: '📍 Rastreamento + 🤝 Parcerias' },
      { timing: '25-30s', description: 'CTA final', text: '14 dias grátis. Sem cartão. Link na bio.' },
    ],
    caption: `Tudo que uma empresa de higienização precisa:

📅 Agendamento online 24h
📊 Dashboard financeiro com DRE
📝 OS digital com foto antes/depois
📍 Rastreamento em tempo real
🤝 Programa de parcerias
📱 Lembrete automático no WhatsApp
🛒 Recuperação de carrinho abandonado
🎫 Cupons de desconto estratégicos

Uma plataforma. Um preço.
Menos que um atendimento por mês.

Teste 14 dias grátis. Sem cartão.
Link na bio.`,
    hashtags: ['oferta', 'plataforma', 'higienizacao', 'gestao', 'profissional'],
    published: false,
  },

  // SEMANA 5 - Consolidação
  {
    day: 29,
    weekDay: 'Segunda',
    week: 5,
    title: 'Compilado de Funcionalidades',
    type: 'reel',
    category: 'tutorial',
    module: 'Consolidação',
    hook: 'Tudo isso em 30 segundos',
    format: 'Montagem rápida',
    scenes: [
      { timing: '0-6s', description: 'Agendamento online', text: 'Cliente agenda sozinho' },
      { timing: '6-12s', description: 'Dashboard', text: 'Você vê tudo' },
      { timing: '12-18s', description: 'OS digital', text: 'Serviço documentado' },
      { timing: '18-24s', description: 'Rastreamento', text: 'Cliente acompanha' },
      { timing: '24-30s', description: 'Parcerias + CTA', text: 'Clientes vendem por você. Link na bio.' },
    ],
    caption: `30 segundos pra você ver TUDO:

1. Cliente agenda sozinho (sem você responder)
2. Você vê quanto lucra de verdade
3. Serviço documentado com foto e assinatura
4. Cliente acompanha você no mapa
5. Clientes satisfeitos viram vendedores

Uma plataforma. Tudo integrado.
Preço que cabe no bolso.

Link na bio.`,
    hashtags: ['compilado', 'funcionalidades', 'higienizacao', 'gestao', 'profissional'],
    published: false,
  },
  {
    day: 30,
    weekDay: 'Terça',
    week: 5,
    title: 'Depoimento/Resultado',
    type: 'reel',
    category: 'prova_social',
    module: 'Consolidação',
    hook: 'O que mudou em 90 dias',
    format: 'Depoimento real',
    scenes: [
      { timing: '0-10s', description: 'Você ou cliente contando o antes', text: 'Antes eu perdia cliente toda semana por não responder a tempo...' },
      { timing: '10-20s', description: 'A virada', text: 'Ativei o sistema e em 1 semana já vi diferença.' },
      { timing: '20-30s', description: 'Resultado', text: 'Hoje: +40% de agendamentos, -3h/dia no WhatsApp, lucro real no bolso.' },
    ],
    caption: `90 dias de transformação:

ANTES:
❌ Perdia cliente por demora
❌ Não sabia quanto lucrava
❌ Papel pra todo lado
❌ Cliente ligando toda hora

DEPOIS:
✅ Cliente agenda sozinho
✅ Lucro real no dashboard
✅ OS digital profissional
✅ Rastreamento em tempo real

Resultado:
📈 +40% agendamentos
⏰ -3h/dia no WhatsApp
💰 Lucro aumentou 25%

Sua vez. Link na bio.`,
    hashtags: ['depoimento', 'resultado', 'transformacao', 'higienizacao', 'case'],
    published: false,
  },
  {
    day: 31,
    weekDay: 'Quarta',
    week: 5,
    title: 'Comparativo Antes x Depois',
    type: 'carrossel',
    category: 'prova_social',
    module: 'Consolidação',
    hook: 'A TRANSFORMAÇÃO COMPLETA',
    format: '6 slides comparativos',
    slides: [
      { title: 'Capa', content: 'A TRANSFORMAÇÃO COMPLETA\nAntes x Depois de usar o sistema' },
      { title: 'Atendimento', content: 'ATENDIMENTO\n\nANTES:\n- Responde no outro dia\n- Perde cliente de madrugada\n- Orçamento por áudio\n\nDEPOIS:\n- Cliente agenda 24h\n- Catálogo com preços\n- Confirmação automática' },
      { title: 'Financeiro', content: 'FINANCEIRO\n\nANTES:\n- Não sabe quanto lucra\n- Chuta o preço\n- Planilha bagunçada\n\nDEPOIS:\n- DRE automático\n- Margem por serviço\n- Dashboard em tempo real' },
      { title: 'Operação', content: 'OPERAÇÃO\n\nANTES:\n- Papel amassado\n- Sem histórico\n- Cliente ligando "já está vindo?"\n\nDEPOIS:\n- OS digital com foto\n- Histórico completo\n- Rastreamento em tempo real' },
      { title: 'Marketing', content: 'MARKETING\n\nANTES:\n- Depende de indicação aleatória\n- Gasta com ads sem retorno\n- Carrinho abandonado = perdido\n\nDEPOIS:\n- Programa de parcerias\n- Recuperação automática\n- Cupons estratégicos' },
      { title: 'CTA', content: 'VOCÊ QUER CONTINUAR NO ANTES?\n\nOu dar o próximo passo?\n\n14 dias grátis.\nSem cartão.\nSem compromisso.\n\nLink na bio.' },
    ],
    caption: `Antes x Depois de usar o sistema:

📱 ATENDIMENTO
Antes: Responde no outro dia, perde cliente
Depois: Cliente agenda 24h sozinho

💰 FINANCEIRO
Antes: Não sabe quanto lucra
Depois: DRE automático, margem clara

🔧 OPERAÇÃO
Antes: Papel, sem histórico
Depois: OS digital, rastreamento

📣 MARKETING
Antes: Indicação aleatória
Depois: Parcerias + recuperação automática

Qual versão você quer ser?

Link na bio.`,
    hashtags: ['antesedepois', 'transformacao', 'higienizacao', 'gestao', 'profissional'],
    published: false,
  },
  {
    day: 32,
    weekDay: 'Quinta',
    week: 5,
    title: 'FAQ - Dúvidas Frequentes',
    type: 'carrossel',
    category: 'educativo',
    module: 'Consolidação',
    hook: 'SUAS DÚVIDAS RESPONDIDAS',
    format: '5 slides FAQ',
    slides: [
      { title: 'Capa', content: 'SUAS DÚVIDAS RESPONDIDAS\n5 perguntas que mais recebemos' },
      { title: 'Quanto custa?', content: '"QUANTO CUSTA?"\n\nMenos que um atendimento por mês.\n\nSe você cobra R$ 200 por um sofá,\no sistema custa menos que isso.\n\nE te ajuda a fechar MAIS atendimentos.' },
      { title: 'Funciona no celular?', content: '"FUNCIONA NO MEU CELULAR?"\n\nSim! Android e iPhone.\n\nNão precisa baixar nada.\nFunciona direto no navegador.\n\nSeu cliente também acessa pelo celular.' },
      { title: 'Precisa de internet?', content: '"PRECISA DE INTERNET?"\n\nPra funcionar 100%, sim.\n\nMas o sistema salva dados offline\ne sincroniza quando voltar a conexão.\n\nVocê não perde informação.' },
      { title: 'Se eu não souber usar?', content: '"E SE EU NÃO SOUBER USAR?"\n\n✅ Tutoriais passo a passo\n✅ Suporte por WhatsApp\n✅ Vídeos explicativos\n✅ Acompanhamento inicial\n\nNinguém fica perdido.' },
      { title: 'Posso testar?', content: '"POSSO TESTAR ANTES?"\n\n14 dias grátis.\nSem cartão.\nSem compromisso.\n\nSe não gostar, só parar de usar.\n\nLink na bio.' },
    ],
    caption: `5 perguntas que mais recebo:

1️⃣ "Quanto custa?"
Menos que um atendimento por mês.

2️⃣ "Funciona no celular?"
Sim! Android e iPhone, direto no navegador.

3️⃣ "Precisa de internet?"
Sim, mas salva offline e sincroniza depois.

4️⃣ "Se eu não souber usar?"
Tutoriais + suporte + acompanhamento.

5️⃣ "Posso testar?"
14 dias grátis. Sem cartão.

Mais alguma dúvida? Pergunta aí embaixo!

Link na bio.`,
    hashtags: ['faq', 'duvidas', 'higienizacao', 'perguntas', 'respostas'],
    published: false,
  },
  {
    day: 33,
    weekDay: 'Sexta',
    week: 5,
    title: 'Oferta Final de Fechamento',
    type: 'reel',
    category: 'oferta',
    module: 'Consolidação',
    hook: 'Último dia do mês. Última chance com bônus.',
    format: 'Urgência + escassez',
    scenes: [
      { timing: '0-5s', description: 'Contagem regressiva ou calendário', text: 'Última chance desse mês' },
      { timing: '5-15s', description: 'Resumo de tudo que está incluso', text: 'Tudo isso:\n📅 Agendamento\n📊 Financeiro\n📝 OS Digital\n📍 Rastreamento\n🤝 Parcerias' },
      { timing: '15-25s', description: 'Bônus especial', text: '+ BÔNUS: Configuração inicial gratuita\n(Só hoje)' },
      { timing: '25-30s', description: 'CTA final urgente', text: 'Link na bio. Aproveita.' },
    ],
    caption: `⏰ ÚLTIMA CHANCE DO MÊS

Tudo isso incluído:
📅 Agendamento online 24h
📊 Dashboard financeiro completo
📝 OS digital profissional
📍 Rastreamento em tempo real
🤝 Programa de parcerias
📱 Automações de WhatsApp

+ BÔNUS EXCLUSIVO:
🎁 Configuração inicial GRATUITA
(Normalmente R$ 197)

Só pra quem começar HOJE.

14 dias grátis pra testar.
Depois disso, decide.

Link na bio. Não deixa passar.`,
    hashtags: ['oferta', 'ultimachance', 'bonus', 'higienizacao', 'oportunidade'],
    published: false,
  },
];

// Função para obter posts por semana
export const getPostsByWeek = (week: number) => 
  editorialCalendar.filter(post => post.week === week);

// Função para obter posts por tipo
export const getPostsByType = (type: ContentType) => 
  editorialCalendar.filter(post => post.type === type);

// Função para obter posts por categoria
export const getPostsByCategory = (category: ContentCategory) => 
  editorialCalendar.filter(post => post.category === category);

// Estatísticas do calendário
export const calendarStats = {
  total: editorialCalendar.length,
  reels: editorialCalendar.filter(p => p.type === 'reel').length,
  carrosseis: editorialCalendar.filter(p => p.type === 'carrossel').length,
  porCategoria: {
    dor: editorialCalendar.filter(p => p.category === 'dor').length,
    tutorial: editorialCalendar.filter(p => p.category === 'tutorial').length,
    prova_social: editorialCalendar.filter(p => p.category === 'prova_social').length,
    educativo: editorialCalendar.filter(p => p.category === 'educativo').length,
    meme: editorialCalendar.filter(p => p.category === 'meme').length,
    oferta: editorialCalendar.filter(p => p.category === 'oferta').length,
  },
};
