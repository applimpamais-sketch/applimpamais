export interface ModuloContent {
  codigo: string;
  whatIs: string;
  purpose: string[];
  whenToUse: string[];
  howToUse: { step: string; description: string }[];
  whatHappensAfter: string[];
}

export const MODULOS_CONTENT: Record<string, ModuloContent> = {
  dashboard_gestao: {
    codigo: 'dashboard_gestao',
    whatIs: 'O Command Center é o painel de controle centralizado que oferece visão 360° do seu negócio. Imagine ter todos os dados importantes da sua empresa em uma única tela: agendamentos do dia, faturamento, performance dos técnicos e alertas importantes.',
    purpose: [
      'Visualizar todos os agendamentos em um único lugar',
      'Acompanhar métricas de desempenho em tempo real',
      'Identificar gargalos operacionais rapidamente',
      'Monitorar faturamento e metas do período',
      'Receber alertas sobre situações que precisam de atenção'
    ],
    whenToUse: [
      'Logo ao iniciar o dia de trabalho para planejar as atividades',
      'Durante o expediente para monitorar o andamento',
      'Ao final do dia para avaliar resultados',
      'Quando precisar tomar decisões rápidas baseadas em dados'
    ],
    howToUse: [
      { step: 'Acesse o Dashboard', description: 'Faça login e a tela inicial já é o Command Center' },
      { step: 'Analise os Cards', description: 'Cada card mostra uma métrica importante (agendamentos, faturamento, etc.)' },
      { step: 'Use os Filtros', description: 'Filtre por período, técnico ou status para análises específicas' },
      { step: 'Clique para Detalhar', description: 'Clique em qualquer card para ver mais detalhes' }
    ],
    whatHappensAfter: [
      'Você terá visibilidade total da operação em segundos',
      'Decisões serão tomadas com base em dados, não intuição',
      'Problemas serão identificados antes de virarem crises',
      'Sua gestão se torna mais profissional e eficiente'
    ]
  },

  loja_online: {
    codigo: 'loja_online',
    whatIs: 'O Shop Pro é sua loja online completa para agendamentos. Seus clientes podem ver serviços, preços, escolher data/horário e agendar 24/7 sem precisar falar com ninguém. É como ter uma secretária que nunca dorme.',
    purpose: [
      'Permitir agendamento online 24 horas por dia',
      'Exibir catálogo de serviços com preços transparentes',
      'Processar pagamentos antecipados (opcional)',
      'Reduzir tempo gasto respondendo WhatsApp',
      'Aumentar taxa de conversão com checkout otimizado'
    ],
    whenToUse: [
      'Quando quiser escalar sem contratar mais pessoas',
      'Para reduzir o tempo gasto em atendimento repetitivo',
      'Quando clientes pedirem preços e disponibilidade fora do horário',
      'Para profissionalizar a imagem da empresa'
    ],
    howToUse: [
      { step: 'Configure seus Serviços', description: 'Cadastre serviços, preços, tempo de execução e descrições' },
      { step: 'Defina Disponibilidade', description: 'Configure dias e horários que aceita agendamentos' },
      { step: 'Personalize a Loja', description: 'Adicione logo, cores da marca e fotos dos serviços' },
      { step: 'Compartilhe o Link', description: 'Divulgue o link da sua loja nas redes e WhatsApp' }
    ],
    whatHappensAfter: [
      'Clientes agendam sozinhos enquanto você trabalha',
      'Menos mensagens de WhatsApp para responder',
      'Redução de no-shows com confirmação automática',
      'Aumento no número de agendamentos mensais'
    ]
  },

  financeiro: {
    codigo: 'financeiro',
    whatIs: 'O Finance Pro é o módulo que transforma dados de agendamentos em inteligência financeira. Você terá DRE automático, fluxo de caixa, controle de despesas e saberá exatamente quanto lucra em cada serviço.',
    purpose: [
      'Gerar DRE (Demonstrativo de Resultados) automaticamente',
      'Visualizar fluxo de caixa em tempo real',
      'Controlar receitas e despesas por categoria',
      'Calcular margem de lucro por serviço',
      'Definir e acompanhar metas financeiras'
    ],
    whenToUse: [
      'Para saber se a empresa está dando lucro de verdade',
      'Ao planejar investimentos ou contratações',
      'Quando precisar apresentar números para sócios ou banco',
      'Para identificar serviços mais e menos rentáveis'
    ],
    howToUse: [
      { step: 'Cadastre Despesas', description: 'Registre custos fixos e variáveis do negócio' },
      { step: 'Categorize Corretamente', description: 'Use categorias padrão para relatórios precisos' },
      { step: 'Analise o DRE', description: 'Veja receita, custos e lucro líquido por período' },
      { step: 'Defina Metas', description: 'Configure metas mensais e acompanhe o progresso' }
    ],
    whatHappensAfter: [
      'Você saberá seu lucro real, não apenas faturamento',
      'Decisões de preço serão baseadas em custos reais',
      'Terá argumentos sólidos para renegociar com fornecedores',
      'Planejamento financeiro deixa de ser achismo'
    ]
  },

  whatsapp_bot: {
    codigo: 'whatsapp_bot',
    whatIs: 'O ZapBot Pro é um assistente virtual inteligente no WhatsApp que atende seus clientes 24/7. Ele responde dúvidas, envia orçamentos, agenda serviços e qualifica leads automaticamente, tudo conversando de forma natural.',
    purpose: [
      'Atender clientes automaticamente 24 horas',
      'Responder perguntas frequentes instantaneamente',
      'Enviar orçamentos e catálogo de serviços',
      'Agendar serviços diretamente na conversa',
      'Qualificar leads antes de passar para você'
    ],
    whenToUse: [
      'Quando não conseguir responder clientes rapidamente',
      'Para manter atendimento fora do horário comercial',
      'Quando perceber que responde as mesmas perguntas sempre',
      'Para escalar atendimento sem contratar equipe'
    ],
    howToUse: [
      { step: 'Configure o Bot', description: 'Defina respostas para perguntas frequentes' },
      { step: 'Conecte seu WhatsApp', description: 'Vincule o número comercial ao sistema' },
      { step: 'Treine com Contexto', description: 'Adicione informações do seu negócio' },
      { step: 'Monitore e Ajuste', description: 'Acompanhe conversas e refine respostas' }
    ],
    whatHappensAfter: [
      'Clientes recebem resposta em segundos, não minutos',
      'Você foca em atender quem realmente vai fechar',
      'Redução de 70% no tempo gasto em atendimento',
      'Aumento na satisfação do cliente pelo atendimento rápido'
    ]
  },

  rastreamento_rota: {
    codigo: 'rastreamento_rota',
    whatIs: 'O Track Live permite que seus clientes acompanhem em tempo real a localização do técnico. Como um rastreio de delivery, mas para serviços. O cliente sabe exatamente quando o profissional vai chegar.',
    purpose: [
      'Mostrar localização do técnico em tempo real',
      'Calcular tempo estimado de chegada automaticamente',
      'Reduzir ligações perguntando "já está chegando?"',
      'Aumentar confiança e transparência com o cliente',
      'Otimizar rotas entre atendimentos'
    ],
    whenToUse: [
      'Quando clientes ficam ansiosos esperando o técnico',
      'Para reduzir ligações sobre horário de chegada',
      'Em dias com múltiplos atendimentos para otimizar rota',
      'Para ter histórico de deslocamentos e tempos'
    ],
    howToUse: [
      { step: 'Técnico Inicia Rota', description: 'Ao sair para o atendimento, técnico ativa o rastreio' },
      { step: 'Cliente Recebe Link', description: 'Sistema envia link de acompanhamento por WhatsApp' },
      { step: 'Acompanhamento em Tempo Real', description: 'Cliente vê mapa com posição e ETA' },
      { step: 'Notificação de Chegada', description: 'Aviso automático quando técnico está próximo' }
    ],
    whatHappensAfter: [
      'Clientes param de ligar perguntando sobre horário',
      'Experiência premium de acompanhamento como apps de delivery',
      'Maior confiança e satisfação do cliente',
      'Dados de tempo de deslocamento para melhorar logística'
    ]
  },

  marketing_tools: {
    codigo: 'marketing_tools',
    whatIs: 'O Growth Kit é um arsenal de ferramentas de marketing para atrair e reter clientes. Inclui cupons de desconto, recuperação de carrinhos abandonados, campanhas por WhatsApp e análise de conversão.',
    purpose: [
      'Criar e gerenciar cupons de desconto',
      'Recuperar carrinhos abandonados automaticamente',
      'Enviar campanhas promocionais segmentadas',
      'Analisar taxa de conversão das ações',
      'Reativar clientes inativos'
    ],
    whenToUse: [
      'Para lançar promoções sazonais ou de última hora',
      'Quando perceber muitos abandonos no checkout',
      'Para trazer de volta clientes que sumiram',
      'Em datas comemorativas (Black Friday, aniversário, etc.)'
    ],
    howToUse: [
      { step: 'Crie um Cupom', description: 'Defina código, desconto e regras de validade' },
      { step: 'Configure Recuperação', description: 'Defina tempo e mensagem para carrinhos abandonados' },
      { step: 'Segmente Clientes', description: 'Escolha quem receberá cada campanha' },
      { step: 'Acompanhe Resultados', description: 'Veja conversão e ROI de cada ação' }
    ],
    whatHappensAfter: [
      'Recuperação de vendas que seriam perdidas',
      'Aumento no ticket médio com upsell inteligente',
      'Base de clientes mais engajada e ativa',
      'Marketing mensurável com dados reais'
    ]
  },

  blog_seo: {
    codigo: 'blog_seo',
    whatIs: 'O Content Engine é uma máquina de conteúdo para SEO. Gera artigos otimizados com IA, publica automaticamente no seu blog e posiciona sua empresa no Google para atrair clientes organicamente.',
    purpose: [
      'Gerar artigos otimizados para SEO automaticamente',
      'Posicionar sua empresa no Google para buscas locais',
      'Atrair tráfego orgânico qualificado',
      'Estabelecer autoridade no seu segmento',
      'Publicar conteúdo sem precisar escrever'
    ],
    whenToUse: [
      'Quando quiser aparecer no Google sem pagar ads',
      'Para construir autoridade no mercado local',
      'Quando não tiver tempo para criar conteúdo',
      'Para ter presença digital consistente'
    ],
    howToUse: [
      { step: 'Defina Palavras-chave', description: 'Escolha termos que seus clientes buscam' },
      { step: 'Gere Artigos com IA', description: 'Sistema cria conteúdo otimizado automaticamente' },
      { step: 'Revise e Aprove', description: 'Faça ajustes se necessário e publique' },
      { step: 'Acompanhe Rankings', description: 'Veja posição no Google e tráfego gerado' }
    ],
    whatHappensAfter: [
      'Sua empresa aparece nas primeiras páginas do Google',
      'Clientes encontram você buscando por serviços',
      'Redução de dependência de anúncios pagos',
      'Fluxo constante de leads orgânicos'
    ]
  },

  parcerias: {
    codigo: 'parcerias',
    whatIs: 'O Indica+ é um programa de indicação automatizado. Parceiros (clientes, influenciadores, vendedores) recebem código exclusivo e ganham comissão por cada venda. Você transforma clientes em promotores.',
    purpose: [
      'Criar programa de indicação estruturado',
      'Gerar códigos de parceiro automaticamente',
      'Calcular e pagar comissões por vendas',
      'Acompanhar performance de cada parceiro',
      'Transformar clientes em vendedores da sua marca'
    ],
    whenToUse: [
      'Quando quiser crescer com marketing boca-a-boca',
      'Para premiar clientes que indicam sua empresa',
      'Ao trabalhar com influenciadores locais',
      'Para criar rede de vendedores comissionados'
    ],
    howToUse: [
      { step: 'Configure Comissões', description: 'Defina percentual ou valor fixo por venda' },
      { step: 'Cadastre Parceiros', description: 'Adicione clientes ou vendedores ao programa' },
      { step: 'Distribua Códigos', description: 'Cada parceiro recebe código único de rastreio' },
      { step: 'Pague Automaticamente', description: 'Sistema calcula e gera relatório de pagamentos' }
    ],
    whatHappensAfter: [
      'Clientes satisfeitos viram promotores ativos',
      'Custo de aquisição de cliente (CAC) reduz drasticamente',
      'Vendas por indicação com alta taxa de conversão',
      'Rede de parceiros gerando receita constante'
    ]
  },

  relatorios_avancados: {
    codigo: 'relatorios_avancados',
    whatIs: 'O Insights Pro é um módulo de Business Intelligence (BI) que transforma dados em insights acionáveis. Relatórios customizados, análises comparativas e dashboards que mostram tendências e oportunidades.',
    purpose: [
      'Gerar relatórios customizados para qualquer análise',
      'Comparar períodos, técnicos, serviços e regiões',
      'Identificar tendências e sazonalidades',
      'Exportar dados para Excel ou PDF',
      'Tomar decisões estratégicas baseadas em dados'
    ],
    whenToUse: [
      'Para análises profundas além do dashboard básico',
      'Ao preparar reuniões de planejamento estratégico',
      'Quando precisar comparar performance entre períodos',
      'Para identificar oportunidades de melhoria'
    ],
    howToUse: [
      { step: 'Escolha o Relatório', description: 'Selecione entre modelos prontos ou crie customizado' },
      { step: 'Defina Filtros', description: 'Escolha período, técnico, serviço e outras dimensões' },
      { step: 'Visualize Dados', description: 'Veja gráficos, tabelas e indicadores' },
      { step: 'Exporte ou Compartilhe', description: 'Baixe PDF/Excel ou compartilhe link' }
    ],
    whatHappensAfter: [
      'Visão estratégica do negócio além da operação',
      'Reuniões mais produtivas com dados concretos',
      'Identificação de gargalos e oportunidades',
      'Decisões estratégicas fundamentadas'
    ]
  },

  api_access: {
    codigo: 'api_access',
    whatIs: 'O Connect API permite integrar nossa plataforma com qualquer outro sistema via REST API. Automatize fluxos, sincronize dados e conecte com ERPs, CRMs ou ferramentas que sua empresa já usa.',
    purpose: [
      'Integrar com sistemas existentes (ERP, CRM, etc.)',
      'Automatizar fluxos de trabalho entre plataformas',
      'Sincronizar dados em tempo real',
      'Criar integrações customizadas com Zapier/Make',
      'Extrair dados para sistemas de BI externos'
    ],
    whenToUse: [
      'Quando já tiver outros sistemas na empresa',
      'Para automatizar tarefas entre plataformas',
      'Ao precisar de integração com contabilidade/ERP',
      'Para criar fluxos customizados específicos do seu negócio'
    ],
    howToUse: [
      { step: 'Gere Credenciais', description: 'Crie API Key no painel de integrações' },
      { step: 'Consulte Documentação', description: 'Acesse docs com todos os endpoints disponíveis' },
      { step: 'Configure Webhooks', description: 'Receba eventos em tempo real na sua aplicação' },
      { step: 'Teste e Implemente', description: 'Use ambiente de sandbox antes de produção' }
    ],
    whatHappensAfter: [
      'Sistemas conversam automaticamente sem trabalho manual',
      'Dados sempre sincronizados entre plataformas',
      'Automações customizadas para seu fluxo específico',
      'Escalabilidade para crescer sem gargalos de integração'
    ]
  },

  white_label: {
    codigo: 'white_label',
    whatIs: 'O Sua Marca transforma nossa plataforma em um sistema 100% seu. Domínio próprio, cores da marca, logo em todas as telas. Seus clientes nunca saberão que você usa nossa tecnologia.',
    purpose: [
      'Usar domínio próprio (app.suaempresa.com.br)',
      'Personalizar cores, logo e identidade visual',
      'Remover qualquer menção à nossa marca',
      'Ter app PWA instalável com sua marca',
      'Profissionalizar a experiência do cliente'
    ],
    whenToUse: [
      'Quando quiser total personalização da marca',
      'Para parecer uma empresa de tecnologia própria',
      'Ao atender clientes corporativos exigentes',
      'Para se diferenciar da concorrência'
    ],
    howToUse: [
      { step: 'Configure DNS', description: 'Aponte seu domínio para nossos servidores' },
      { step: 'Faça Upload da Logo', description: 'Adicione logo em diferentes tamanhos' },
      { step: 'Defina Cores', description: 'Configure cores primária, secundária e acentos' },
      { step: 'Ative White Label', description: 'Sistema assume sua identidade completamente' }
    ],
    whatHappensAfter: [
      'Clientes veem apenas sua marca em todo o sistema',
      'URL profissional com seu domínio',
      'App instalável mostra sua marca na tela inicial',
      'Percepção de empresa mais estruturada e confiável'
    ]
  },

  iarc_criativos: {
    codigo: 'iarc_criativos',
    whatIs: 'O IARC Studio é um estúdio criativo com IA. Gere imagens para posts, landing pages de campanha, textos de marketing e muito mais. Tudo sem precisar de designer ou redator.',
    purpose: [
      'Gerar imagens para redes sociais com IA',
      'Criar landing pages de campanha rapidamente',
      'Produzir textos de marketing persuasivos',
      'Ter materiais visuais sem contratar designer',
      'Manter presença digital ativa e profissional'
    ],
    whenToUse: [
      'Quando precisar de posts para redes sociais',
      'Para lançar promoções com landing page dedicada',
      'Ao criar campanhas de marketing',
      'Quando não tiver verba para designer/redator'
    ],
    howToUse: [
      { step: 'Escolha o Tipo', description: 'Selecione imagem, landing page ou texto' },
      { step: 'Descreva o que Quer', description: 'Explique sua ideia em linguagem natural' },
      { step: 'IA Gera Opções', description: 'Receba variações para escolher a melhor' },
      { step: 'Baixe ou Publique', description: 'Use o material onde precisar' }
    ],
    whatHappensAfter: [
      'Conteúdo visual profissional em minutos',
      'Presença nas redes mais ativa e atraente',
      'Campanhas lançadas rapidamente',
      'Economia com design e redação'
    ]
  }
};
