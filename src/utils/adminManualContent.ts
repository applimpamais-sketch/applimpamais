// Conteúdo completo do Manual do Administrador RC Limpa Mais

export interface ManualSection {
  id: string;
  title: string;
  icon?: string;
  content: ManualContent[];
}

export interface ManualContent {
  id: string;
  title: string;
  route?: string;
  whatIs: string;
  purpose: string[];
  whenToUse: string[];
  howToUse: { step: string; description: string }[];
  whatHappensAfter: string[];
  warnings: string[];
}

export const MANUAL_INTRO = {
  title: "Manual do Administrador",
  subtitle: "RC Limpa Mais - Sistema de Gestão",
  version: "1.0",
  date: new Date().toLocaleDateString('pt-BR'),
  description: `
Este manual foi desenvolvido para capacitar os administradores da plataforma RC Limpa Mais a utilizarem todas as funcionalidades do sistema de forma eficiente e segura.

Como administrador, você tem acesso completo a todas as áreas do sistema, incluindo:
• Gestão de agendamentos e técnicos
• Controle financeiro completo
• Ferramentas de marketing e conversão
• Relatórios e análises de desempenho
• Integrações com sistemas externos
• Gestão de equipe e permissões
• Blog e SEO automatizado
• Configurações de perfil e sistema

Este guia apresenta cada funcionalidade seguindo um padrão didático que facilita o aprendizado e a consulta rápida.
  `.trim(),
  roles: [
    { role: "Admin", description: "Acesso total a todas as funcionalidades" },
    { role: "Operador", description: "Gestão de agendamentos e técnicos" },
    { role: "Visualizador", description: "Apenas visualização de dados" }
  ]
};

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: "principal",
    title: "Módulo Principal",
    icon: "LayoutDashboard",
    content: [
      {
        id: "dashboard",
        title: "Dashboard",
        route: "/admin",
        whatIs: "A tela inicial do sistema que apresenta uma visão consolidada de todas as métricas importantes do negócio em tempo real.",
        purpose: [
          "Visualizar KPIs do dia (agendamentos, receita, leads)",
          "Acompanhar tendências com gráficos comparativos",
          "Identificar rapidamente alertas e pendências",
          "Ter visão geral da saúde do negócio"
        ],
        whenToUse: [
          "Ao iniciar o dia de trabalho",
          "Para reuniões de acompanhamento",
          "Quando precisar de uma visão rápida do status geral",
          "Para identificar oportunidades de melhoria"
        ],
        howToUse: [
          { step: "Acesse o menu lateral", description: "Clique em 'Visão Geral' no menu principal" },
          { step: "Analise os cards de KPIs", description: "Veja agendamentos do dia, receita, leads e conversões" },
          { step: "Explore os gráficos", description: "Compare desempenho atual com períodos anteriores" },
          { step: "Verifique alertas", description: "Confira notificações de pendências ou anomalias" }
        ],
        whatHappensAfter: [
          "Você terá uma visão clara do status atual do negócio",
          "Poderá tomar decisões baseadas em dados atualizados",
          "Identificará áreas que precisam de atenção imediata"
        ],
        warnings: [
          "Os dados são atualizados em tempo real - aguarde carregamento completo",
          "Compare sempre com o mesmo período (dia da semana) para análise justa"
        ]
      },
      {
        id: "live-view",
        title: "Live View",
        route: "/admin/live-view",
        whatIs: "Painel de monitoramento em tempo real que mostra visitantes ativos no site, carrinhos em andamento e conversões acontecendo.",
        purpose: [
          "Monitorar visitantes navegando no site agora",
          "Acompanhar carrinhos sendo preenchidos",
          "Ver vendas sendo finalizadas em tempo real",
          "Identificar padrões de comportamento de usuários"
        ],
        whenToUse: [
          "Durante campanhas de marketing para ver resultado imediato",
          "Em horários de pico para monitorar demanda",
          "Para acompanhar promoções em andamento",
          "Quando quiser entender o fluxo de clientes"
        ],
        howToUse: [
          { step: "Acesse Live View", description: "Menu lateral → Live View" },
          { step: "Observe o mapa", description: "Veja a localização aproximada dos visitantes ativos" },
          { step: "Monitore a lista", description: "Acompanhe sessões ativas com detalhes de cada visitante" },
          { step: "Analise conversões", description: "Veja em qual etapa do funil cada visitante está" }
        ],
        whatHappensAfter: [
          "Você entenderá o comportamento dos visitantes em tempo real",
          "Poderá identificar gargalos no processo de conversão",
          "Terá dados para ajustar estratégias de marketing rapidamente"
        ],
        warnings: [
          "Sessões expiram após 5 minutos de inatividade",
          "A localização é aproximada (baseada em IP)",
          "Alto volume pode indicar campanha ou problema no site"
        ]
      },
      {
        id: "agendamentos",
        title: "Agendamentos",
        route: "/admin/agendamentos",
        whatIs: "Central de gestão de todos os serviços agendados, permitindo visualização, edição, atribuição de técnicos e controle de status.",
        purpose: [
          "Gerenciar todos os agendamentos do sistema",
          "Alterar status conforme andamento do serviço",
          "Atribuir técnicos aos serviços",
          "Exportar relatórios para Excel ou PDF",
          "Contatar clientes via WhatsApp"
        ],
        whenToUse: [
          "No início do dia para planejar a operação",
          "Ao receber novo agendamento",
          "Para acompanhar serviços em andamento",
          "Quando precisar gerar relatórios"
        ],
        howToUse: [
          { step: "Acesse Agendamentos", description: "Menu lateral → Agendamentos" },
          { step: "Use os filtros", description: "Filtre por data, status, técnico ou busque por nome/telefone" },
          { step: "Visualize detalhes", description: "Clique em um agendamento para ver informações completas" },
          { step: "Altere status", description: "Use o dropdown para atualizar: Pendente → Confirmado → Em Andamento → Concluído → Pago" },
          { step: "Atribua técnico", description: "Selecione o profissional disponível para o serviço" },
          { step: "Exporte dados", description: "Use os botões 'Exportar Excel' ou 'Exportar PDF'" }
        ],
        whatHappensAfter: [
          "Cliente recebe notificação ao confirmar agendamento",
          "Técnico recebe o serviço em seu painel",
          "Ao concluir, cliente entra na fila de avaliação",
          "Ao marcar pago, valor é contabilizado no financeiro"
        ],
        warnings: [
          "Não altere status para 'Pago' sem confirmação de pagamento",
          "Sempre verifique disponibilidade do técnico antes de atribuir",
          "Use 'Cancelado' em vez de excluir para manter histórico",
          "Confirme endereço completo antes de enviar técnico"
        ]
      },
      {
        id: "tecnicos",
        title: "Técnicos",
        route: "/admin/tecnicos",
        whatIs: "Tela para cadastro e gestão da equipe de técnicos que executam os serviços, incluindo disponibilidade e localização.",
        purpose: [
          "Cadastrar novos técnicos",
          "Gerenciar informações de contato",
          "Definir localização base para otimização de rotas",
          "Ativar ou desativar técnicos"
        ],
        whenToUse: [
          "Ao contratar novo técnico",
          "Para atualizar dados cadastrais",
          "Quando precisar verificar disponibilidade",
          "Para configurar localização para otimizador de rotas"
        ],
        howToUse: [
          { step: "Acesse Técnicos", description: "Menu lateral → Técnicos" },
          { step: "Adicione técnico", description: "Clique em 'Adicionar Técnico' e preencha os dados" },
          { step: "Configure localização", description: "Clique em 'Definir Localização' para habilitar otimização de rotas" },
          { step: "Gerencie status", description: "Ative ou desative técnicos conforme necessário" }
        ],
        whatHappensAfter: [
          "Técnico fica disponível para receber serviços",
          "Com localização definida, entra no otimizador de rotas",
          "Histórico de serviços fica vinculado ao perfil"
        ],
        warnings: [
          "Técnico sem localização não aparece no otimizador de rotas",
          "Desativar técnico não remove histórico de serviços",
          "Verifique se o telefone está correto para notificações"
        ]
      },
      {
        id: "tracking",
        title: "Histórico Tracking",
        route: "/admin/tracking",
        whatIs: "Sistema de rastreamento de trajetos dos técnicos e otimização de rotas para maximizar eficiência operacional.",
        purpose: [
          "Visualizar trajetos realizados pelos técnicos",
          "Otimizar rotas para reduzir tempo e combustível",
          "Analisar pontualidade e eficiência",
          "Planejar rotas para o dia seguinte"
        ],
        whenToUse: [
          "No planejamento diário de rotas",
          "Para análise de desempenho de técnicos",
          "Quando precisar otimizar custos de deslocamento",
          "Para verificar se técnico está cumprindo rota planejada"
        ],
        howToUse: [
          { step: "Acesse Tracking", description: "Menu lateral → Histórico Tracking" },
          { step: "Selecione técnico e data", description: "Escolha o técnico e período para visualizar" },
          { step: "Veja o mapa", description: "Trajetos são exibidos no mapa com pontos de parada" },
          { step: "Use o otimizador", description: "Clique em 'Otimizar Rota' para calcular melhor trajeto" }
        ],
        whatHappensAfter: [
          "Rota otimizada pode ser enviada ao técnico",
          "Dados ficam disponíveis para relatórios de eficiência",
          "Histórico fica salvo para análises futuras"
        ],
        warnings: [
          "Técnico precisa ter localização cadastrada para otimização",
          "O otimizador considera trânsito em tempo real quando disponível",
          "Alterações na rota devem ser comunicadas ao técnico"
        ]
      }
    ]
  },
  {
    id: "marketing",
    title: "Módulo Marketing",
    icon: "Megaphone",
    content: [
      {
        id: "marketing-dashboard",
        title: "Dashboard Marketing",
        route: "/admin/marketing",
        whatIs: "Painel completo de análise de marketing com métricas de leads, conversões, ROI e desempenho de campanhas.",
        purpose: [
          "Analisar taxa de conversão de leads",
          "Medir ROI de investimentos em marketing",
          "Identificar canais mais eficientes",
          "Acompanhar funil de vendas"
        ],
        whenToUse: [
          "Para planejar investimentos em marketing",
          "Ao avaliar desempenho de campanhas",
          "Em reuniões de resultado",
          "Para justificar orçamento de marketing"
        ],
        howToUse: [
          { step: "Acesse Marketing", description: "Menu lateral → Marketing" },
          { step: "Analise o funil", description: "Veja conversão em cada etapa: visitante → lead → agendamento → pago" },
          { step: "Compare canais", description: "Identifique quais origens trazem mais conversões" },
          { step: "Calcule ROI", description: "Veja custo por aquisição vs. ticket médio" }
        ],
        whatHappensAfter: [
          "Decisões de investimento baseadas em dados",
          "Otimização de campanhas de baixa performance",
          "Aumento progressivo de conversão"
        ],
        warnings: [
          "Considere o ciclo de venda ao analisar ROI (nem todo lead converte no mesmo dia)",
          "Compare sempre períodos equivalentes (mesma quantidade de dias úteis)",
          "Custos de marketing devem estar cadastrados corretamente"
        ]
      },
      {
        id: "carrinhos-abandonados",
        title: "Carrinhos Abandonados",
        route: "/admin/carrinhos-abandonados",
        whatIs: "Ferramenta de recuperação de vendas que lista clientes que iniciaram o processo de agendamento mas não concluíram.",
        purpose: [
          "Identificar vendas perdidas",
          "Recuperar clientes que abandonaram o carrinho",
          "Entender em qual etapa ocorre o abandono",
          "Enviar mensagens de recuperação"
        ],
        whenToUse: [
          "Diariamente para recuperar vendas do dia anterior",
          "Quando a conversão estiver baixa",
          "Para campanhas de reativação",
          "Para entender objeções dos clientes"
        ],
        howToUse: [
          { step: "Acesse Carrinhos Abandonados", description: "Menu lateral → Carrinhos Abandonados" },
          { step: "Filtre por período", description: "Selecione a data para ver abandonos" },
          { step: "Analise a lista", description: "Veja nome, telefone, valor e etapa de abandono" },
          { step: "Faça contato", description: "Clique no WhatsApp para enviar mensagem de recuperação" },
          { step: "Registre resultado", description: "Marque como recuperado, perdido ou sem resposta" }
        ],
        whatHappensAfter: [
          "Cliente pode retomar o agendamento",
          "Dados de abandono alimentam relatórios",
          "Identificação de padrões de abandono"
        ],
        warnings: [
          "Respeite horário comercial para contato (8h às 20h)",
          "Não insista mais de 2x no mesmo cliente",
          "Use tom consultivo, não insistente"
        ]
      },
      {
        id: "cupons",
        title: "Cupons de Desconto",
        route: "/admin/cupons",
        whatIs: "Sistema para criar e gerenciar códigos promocionais com regras de desconto, validade e uso.",
        purpose: [
          "Criar cupons de desconto para campanhas",
          "Definir regras de uso (categorias, validade, limite)",
          "Acompanhar utilização de cada cupom",
          "Medir impacto de promoções na conversão"
        ],
        whenToUse: [
          "Para campanhas promocionais",
          "Em datas comemorativas",
          "Para fidelização de clientes",
          "Como incentivo para primeira compra"
        ],
        howToUse: [
          { step: "Acesse Cupons", description: "Menu lateral → Cupons" },
          { step: "Crie novo cupom", description: "Clique em 'Novo Cupom'" },
          { step: "Configure regras", description: "Defina código, desconto %, categorias aplicáveis" },
          { step: "Defina validade", description: "Configure data início e fim, limite de uso" },
          { step: "Ative o cupom", description: "Salve e ative para disponibilizar" }
        ],
        whatHappensAfter: [
          "Cupom fica disponível para uso no checkout",
          "Sistema aplica desconto automaticamente",
          "Uso é contabilizado e rastreado"
        ],
        warnings: [
          "Códigos são únicos - não duplique",
          "Verifique margem antes de definir % de desconto",
          "Cupons expirados não podem ser reativados",
          "Limite de uso evita abuso"
        ]
      },
      {
        id: "templates",
        title: "Templates WhatsApp",
        route: "/admin/templates",
        whatIs: "Biblioteca de modelos de mensagens para comunicação automatizada via WhatsApp com clientes.",
        purpose: [
          "Criar modelos padronizados de mensagens",
          "Garantir consistência na comunicação",
          "Agilizar envio de mensagens frequentes",
          "Personalizar mensagens com variáveis"
        ],
        whenToUse: [
          "Para configurar mensagens automáticas",
          "Ao padronizar comunicação da equipe",
          "Para criar campanhas de WhatsApp",
          "Quando precisar de mensagens recorrentes"
        ],
        howToUse: [
          { step: "Acesse Templates", description: "Menu lateral → Templates WhatsApp" },
          { step: "Crie novo template", description: "Clique em 'Novo Template'" },
          { step: "Defina o tipo", description: "Escolha: Confirmação, Lembrete, Pós-serviço, etc." },
          { step: "Escreva a mensagem", description: "Use variáveis como {nome}, {data}, {servico}" },
          { step: "Ative o template", description: "Salve e ative para uso" }
        ],
        whatHappensAfter: [
          "Template fica disponível para envio manual ou automático",
          "Variáveis são substituídas pelos dados reais",
          "Histórico de envio fica registrado"
        ],
        warnings: [
          "Respeite políticas do WhatsApp Business",
          "Não use linguagem agressiva ou spam",
          "Teste sempre antes de ativar para uso automático",
          "Mantenha mensagens curtas e objetivas"
        ]
      },
      {
        id: "push-notifications",
        title: "Notificações Push",
        route: "/admin/push-notifications",
        whatIs: "Sistema de envio de notificações push para navegadores de clientes que optaram por receber.",
        purpose: [
          "Enviar alertas instantâneos para clientes",
          "Comunicar promoções e novidades",
          "Reengajar clientes inativos",
          "Lembrar sobre agendamentos"
        ],
        whenToUse: [
          "Para comunicados urgentes",
          "Em lançamento de promoções",
          "Para reativar clientes inativos",
          "Como complemento ao WhatsApp"
        ],
        howToUse: [
          { step: "Acesse Push Notifications", description: "Menu lateral → Notificações Push" },
          { step: "Crie nova notificação", description: "Clique em 'Nova Notificação'" },
          { step: "Escreva o conteúdo", description: "Defina título e mensagem (máx. 120 caracteres)" },
          { step: "Selecione público", description: "Escolha: todos, segmento ou individual" },
          { step: "Envie ou agende", description: "Envie imediatamente ou programe data/hora" }
        ],
        whatHappensAfter: [
          "Notificação é enviada para dispositivos autorizados",
          "Taxa de entrega e cliques são registrados",
          "Dados alimentam análise de engajamento"
        ],
        warnings: [
          "Usuário precisa ter autorizado notificações no navegador",
          "Não abuse da frequência (máx. 2-3 por semana)",
          "Horário comercial tem melhor taxa de abertura",
          "Mensagem deve ser relevante e objetiva"
        ]
      },
      {
        id: "avaliacoes-config",
        title: "Configuração de Avaliações",
        route: "/admin/avaliacoes-config",
        whatIs: "Sistema NPS para coleta e gestão de avaliações de clientes após serviços concluídos.",
        purpose: [
          "Configurar fluxo de solicitação de avaliação",
          "Gerenciar avaliações recebidas",
          "Aprovar depoimentos para exibição",
          "Monitorar satisfação dos clientes"
        ],
        whenToUse: [
          "Para configurar tempo de envio da solicitação",
          "Ao aprovar avaliações para o site",
          "Para responder a avaliações negativas",
          "Para análise de NPS"
        ],
        howToUse: [
          { step: "Acesse Avaliações", description: "Menu lateral → Config. Avaliações" },
          { step: "Configure timing", description: "Defina quando enviar solicitação após serviço" },
          { step: "Gerencie avaliações", description: "Aprove, rejeite ou responda avaliações" },
          { step: "Analise métricas", description: "Veja NPS médio e tendências" }
        ],
        whatHappensAfter: [
          "Avaliações aprovadas aparecem no site",
          "Avaliações negativas geram alerta para tratativa",
          "NPS é calculado automaticamente"
        ],
        warnings: [
          "Responda rapidamente a avaliações negativas",
          "Não aprove avaliações falsas ou compradas",
          "Use feedback negativo para melhorar processos"
        ]
      }
    ]
  },
  {
    id: "gestao",
    title: "Módulo Gestão",
    icon: "Users2",
    content: [
      {
        id: "relatorios",
        title: "Relatórios",
        route: "/admin/relatorios",
        whatIs: "Central de relatórios com análises detalhadas por bairro, serviço, gênero e período.",
        purpose: [
          "Analisar desempenho por região geográfica",
          "Identificar serviços mais vendidos",
          "Entender perfil demográfico dos clientes",
          "Gerar relatórios para tomada de decisão"
        ],
        whenToUse: [
          "Para planejamento estratégico",
          "Em reuniões de resultado",
          "Para definir foco de campanhas",
          "Ao avaliar expansão para novas regiões"
        ],
        howToUse: [
          { step: "Acesse Relatórios", description: "Menu lateral → Relatórios" },
          { step: "Selecione período", description: "Defina data início e fim da análise" },
          { step: "Escolha dimensão", description: "Por bairro, serviço, gênero ou técnico" },
          { step: "Gere o relatório", description: "Visualize gráficos e tabelas" },
          { step: "Exporte se necessário", description: "Baixe em Excel ou PDF" }
        ],
        whatHappensAfter: [
          "Insights para direcionar estratégia",
          "Dados para justificar investimentos",
          "Base para metas e projeções"
        ],
        warnings: [
          "Considere sazonalidade ao comparar períodos",
          "Amostra pequena pode distorcer percentuais",
          "Combine diferentes dimensões para análise completa"
        ]
      },
      {
        id: "equipe",
        title: "Equipe",
        route: "/admin/equipe",
        whatIs: "Gestão completa de usuários do sistema, incluindo membros do dashboard, técnicos e funcionários bot.",
        purpose: [
          "Convidar novos membros para o dashboard",
          "Definir e alterar permissões",
          "Gerenciar técnicos da equipe",
          "Configurar funcionários bot (automação)"
        ],
        whenToUse: [
          "Ao contratar novo colaborador",
          "Para ajustar permissões de acesso",
          "Quando precisar desativar usuário",
          "Para configurar automação de atendimento"
        ],
        howToUse: [
          { step: "Acesse Equipe", description: "Menu lateral → Equipe" },
          { step: "Escolha a aba", description: "Membros Dashboard, Técnicos ou Funcionários Bot" },
          { step: "Adicione usuário", description: "Clique no botão correspondente (Convidar, Adicionar)" },
          { step: "Configure permissões", description: "Defina papel: Admin, Operador ou Visualizador" },
          { step: "Gerencie ativos", description: "Edite ou remova conforme necessário" }
        ],
        whatHappensAfter: [
          "Novo membro recebe convite por e-mail",
          "Acesso é liberado conforme permissão definida",
          "Ações ficam registradas no log de auditoria"
        ],
        warnings: [
          "Apenas admins podem convidar novos membros",
          "Não remova o último admin do sistema",
          "Revise permissões periodicamente",
          "Desative usuários ao invés de excluir para manter histórico"
        ]
      },
      {
        id: "parcerias",
        title: "Parcerias",
        route: "/admin/parcerias",
        whatIs: "Programa de afiliados e influencers com gestão de comissões, conversões e pagamentos.",
        purpose: [
          "Aprovar solicitações de parceria",
          "Acompanhar conversões por parceiro",
          "Processar pagamentos de comissões",
          "Gerenciar códigos de indicação"
        ],
        whenToUse: [
          "Para aprovar novos parceiros",
          "No fechamento mensal de comissões",
          "Para analisar desempenho de afiliados",
          "Ao processar saques solicitados"
        ],
        howToUse: [
          { step: "Acesse Parcerias", description: "Menu lateral → Parcerias" },
          { step: "Veja solicitações pendentes", description: "Aprove ou rejeite novos cadastros" },
          { step: "Acompanhe conversões", description: "Veja vendas geradas por cada parceiro" },
          { step: "Processe pagamentos", description: "Aprove saques e registre comprovante" }
        ],
        whatHappensAfter: [
          "Parceiro aprovado recebe código único",
          "Comissões são calculadas automaticamente",
          "Pagamentos são registrados no financeiro"
        ],
        warnings: [
          "Valide dados bancários antes de aprovar parceiro",
          "Comissões só são devidas para vendas pagas",
          "Estabeleça prazo claro para pagamento (ex: todo dia 10)"
        ]
      },
      {
        id: "notas-fiscais",
        title: "Notas Fiscais",
        route: "/admin/notas-fiscais",
        whatIs: "Sistema de emissão e gestão de Notas Fiscais de Serviço (NFS-e).",
        purpose: [
          "Emitir notas fiscais para clientes",
          "Gerenciar notas emitidas",
          "Cancelar notas quando necessário",
          "Enviar notas por e-mail"
        ],
        whenToUse: [
          "Após conclusão e pagamento do serviço",
          "Quando cliente solicitar nota fiscal",
          "Para cancelar nota emitida com erro",
          "No fechamento fiscal mensal"
        ],
        howToUse: [
          { step: "Acesse Notas Fiscais", description: "Menu lateral → Notas Fiscais" },
          { step: "Emita nova nota", description: "Clique em 'Emitir Nota' e vincule ao agendamento" },
          { step: "Preencha dados", description: "Confirme dados do cliente e serviço" },
          { step: "Envie a nota", description: "Nota é enviada automaticamente por e-mail" }
        ],
        whatHappensAfter: [
          "Nota é transmitida para prefeitura",
          "Cliente recebe PDF por e-mail",
          "Nota fica disponível para download"
        ],
        warnings: [
          "Verifique dados do cliente antes de emitir (CPF/CNPJ)",
          "Nota emitida não pode ser editada",
          "Cancelamento tem prazo legal (geralmente 24h)",
          "Mantenha configurações fiscais atualizadas"
        ]
      },
      {
        id: "orcamentos",
        title: "Orçamentos",
        route: "/admin/orcamentos",
        whatIs: "Sistema para criação e envio de propostas comerciais personalizadas para clientes.",
        purpose: [
          "Criar orçamentos detalhados",
          "Personalizar propostas para cada cliente",
          "Gerar PDF profissional",
          "Acompanhar status de aprovação"
        ],
        whenToUse: [
          "Para serviços de maior valor",
          "Quando cliente solicitar proposta formal",
          "Para negociações corporativas",
          "Em projetos personalizados"
        ],
        howToUse: [
          { step: "Acesse Orçamentos", description: "Menu lateral → Orçamentos" },
          { step: "Crie novo orçamento", description: "Clique em 'Novo Orçamento'" },
          { step: "Adicione itens", description: "Inclua serviços, quantidades e valores" },
          { step: "Personalize", description: "Adicione observações e condições" },
          { step: "Gere o PDF", description: "Escolha o template e exporte" },
          { step: "Envie ao cliente", description: "Compartilhe via WhatsApp ou e-mail" }
        ],
        whatHappensAfter: [
          "Cliente recebe orçamento profissional",
          "Orçamento fica salvo para acompanhamento",
          "Pode ser convertido em agendamento se aprovado"
        ],
        warnings: [
          "Validade do orçamento deve ser clara",
          "Valores devem incluir todos os custos",
          "Mantenha histórico de versões se fizer alterações"
        ]
      }
    ]
  },
  {
    id: "financeiro",
    title: "Módulo Financeiro",
    icon: "DollarSign",
    content: [
      {
        id: "financeiro-dashboard",
        title: "Dashboard Financeiro",
        route: "/admin/financeiro",
        whatIs: "Visão geral das finanças da empresa com resumo de receitas, despesas, saldo e indicadores.",
        purpose: [
          "Ter visão consolidada da saúde financeira",
          "Acompanhar receitas e despesas do período",
          "Verificar saldo disponível",
          "Monitorar indicadores financeiros"
        ],
        whenToUse: [
          "No início do dia/semana para planejamento",
          "Para tomada de decisões financeiras",
          "Em reuniões de gestão",
          "Para identificar tendências"
        ],
        howToUse: [
          { step: "Acesse Financeiro", description: "Menu lateral → Financeiro" },
          { step: "Analise os cards", description: "Veja receita, despesa, saldo e margem" },
          { step: "Explore gráficos", description: "Acompanhe evolução mensal" },
          { step: "Identifique alertas", description: "Verifique contas a vencer ou atrasadas" }
        ],
        whatHappensAfter: [
          "Visão clara para planejamento financeiro",
          "Identificação de problemas de caixa",
          "Base para metas e projeções"
        ],
        warnings: [
          "Dados dependem de lançamentos corretos",
          "Valores não pagos não aparecem como receita realizada",
          "Compare sempre meses equivalentes"
        ]
      },
      {
        id: "receitas",
        title: "Receitas",
        route: "/admin/financeiro/receitas",
        whatIs: "Controle detalhado de todas as receitas da empresa, incluindo agendamentos pagos e outras entradas.",
        purpose: [
          "Registrar todas as entradas de dinheiro",
          "Categorizar receitas por tipo",
          "Acompanhar previsão vs. realizado",
          "Gerar relatórios de faturamento"
        ],
        whenToUse: [
          "Ao receber pagamentos",
          "Para conferência de fechamento",
          "Em análise de faturamento",
          "Para projeção de receitas"
        ],
        howToUse: [
          { step: "Acesse Receitas", description: "Menu lateral → Financeiro → Receitas" },
          { step: "Visualize lista", description: "Veja todas as receitas com filtros" },
          { step: "Adicione receita manual", description: "Para entradas fora de agendamentos" },
          { step: "Exporte relatório", description: "Gere relatório do período" }
        ],
        whatHappensAfter: [
          "Receita é contabilizada no dashboard",
          "Fluxo de caixa é atualizado",
          "Relatórios refletem novos dados"
        ],
        warnings: [
          "Agendamentos pagos geram receita automaticamente",
          "Não duplique lançamentos manuais",
          "Categorize corretamente para relatórios precisos"
        ]
      },
      {
        id: "despesas",
        title: "Despesas",
        route: "/admin/financeiro/despesas",
        whatIs: "Gestão completa de gastos operacionais com categorização, comprovantes e controle de pagamento.",
        purpose: [
          "Registrar todos os gastos da empresa",
          "Categorizar despesas por tipo",
          "Anexar comprovantes",
          "Controlar pagamentos pendentes"
        ],
        whenToUse: [
          "Ao receber contas para pagar",
          "Para registrar gastos realizados",
          "No fechamento mensal",
          "Para análise de custos"
        ],
        howToUse: [
          { step: "Acesse Despesas", description: "Menu lateral → Financeiro → Despesas" },
          { step: "Adicione despesa", description: "Clique em 'Nova Despesa'" },
          { step: "Preencha dados", description: "Valor, categoria, data, forma de pagamento" },
          { step: "Anexe comprovante", description: "Upload do comprovante se disponível" },
          { step: "Defina status", description: "Pendente ou Pago" }
        ],
        whatHappensAfter: [
          "Despesa é contabilizada no dashboard",
          "Afeta saldo e margem",
          "Aparece em relatórios de custos"
        ],
        warnings: [
          "Categorize corretamente para análise precisa",
          "Despesas recorrentes podem ser marcadas para repetição",
          "Mantenha comprovantes para fins fiscais"
        ]
      },
      {
        id: "fluxo-caixa",
        title: "Fluxo de Caixa",
        route: "/admin/financeiro/fluxo-caixa",
        whatIs: "Projeção de entradas e saídas futuras para planejamento financeiro.",
        purpose: [
          "Prever saldo futuro",
          "Identificar períodos de caixa apertado",
          "Planejar pagamentos e investimentos",
          "Antecipar necessidade de capital"
        ],
        whenToUse: [
          "Para planejamento semanal/mensal",
          "Antes de assumir novos compromissos",
          "Para negociar prazos com fornecedores",
          "Em decisões de investimento"
        ],
        howToUse: [
          { step: "Acesse Fluxo de Caixa", description: "Menu lateral → Financeiro → Fluxo de Caixa" },
          { step: "Visualize projeção", description: "Veja entradas e saídas previstas" },
          { step: "Ajuste período", description: "Visualize por semana, mês ou trimestre" },
          { step: "Identifique gaps", description: "Veja períodos com saldo negativo projetado" }
        ],
        whatHappensAfter: [
          "Visão clara do futuro financeiro",
          "Antecipação de problemas de caixa",
          "Base para negociações"
        ],
        warnings: [
          "Projeção depende de dados precisos de contas a pagar/receber",
          "Considere sazonalidade do negócio",
          "Mantenha margem de segurança"
        ]
      },
      {
        id: "metas",
        title: "Metas Financeiras",
        route: "/admin/financeiro/metas",
        whatIs: "Sistema para definição e acompanhamento de metas de receita mensal.",
        purpose: [
          "Definir objetivos de faturamento",
          "Acompanhar progresso em tempo real",
          "Motivar a equipe com metas claras",
          "Analisar histórico de atingimento"
        ],
        whenToUse: [
          "No início de cada mês",
          "Para ajustes de estratégia",
          "Em reuniões de acompanhamento",
          "Para definir metas do próximo período"
        ],
        howToUse: [
          { step: "Acesse Metas", description: "Menu lateral → Financeiro → Metas" },
          { step: "Defina meta mensal", description: "Clique em 'Nova Meta' ou edite existente" },
          { step: "Acompanhe progresso", description: "Visualize % de atingimento" },
          { step: "Analise histórico", description: "Compare com meses anteriores" }
        ],
        whatHappensAfter: [
          "Meta aparece no dashboard com barra de progresso",
          "Sistema calcula % de atingimento automaticamente",
          "Histórico fica disponível para análise"
        ],
        warnings: [
          "Metas devem ser realistas (baseadas em histórico)",
          "Considere sazonalidade ao definir valores",
          "Revise metas se houver mudanças significativas no mercado"
        ]
      }
    ]
  },
  {
    id: "integracoes",
    title: "Módulo Integrações",
    icon: "Plug",
    content: [
      {
        id: "canais",
        title: "Canais de Origem",
        route: "/admin/integracoes/canais",
        whatIs: "Sistema de rastreamento de origens de tráfego com códigos UTM e links personalizados.",
        purpose: [
          "Identificar de onde vêm os clientes",
          "Medir eficiência de cada canal",
          "Criar links rastreáveis para campanhas",
          "Otimizar investimento em marketing"
        ],
        whenToUse: [
          "Ao criar nova campanha",
          "Para analisar origem de vendas",
          "Quando precisar de link rastreável",
          "Para medir ROI por canal"
        ],
        howToUse: [
          { step: "Acesse Canais", description: "Menu lateral → Integrações → Canais de Origem" },
          { step: "Crie novo canal", description: "Defina nome e tipo (Google Ads, Facebook, Influencer, etc.)" },
          { step: "Gere o link", description: "Sistema cria URL com parâmetros de rastreamento" },
          { step: "Use o link", description: "Divulgue o link na campanha correspondente" },
          { step: "Acompanhe resultados", description: "Veja cliques, conversões e receita por canal" }
        ],
        whatHappensAfter: [
          "Todo acesso via link é rastreado",
          "Agendamentos mostram origem do cliente",
          "Relatórios de marketing são alimentados"
        ],
        warnings: [
          "Use links corretos em cada campanha",
          "Não misture links entre campanhas diferentes",
          "Analise atribuição (primeiro clique vs. último clique)"
        ]
      },
      {
        id: "whatsapp",
        title: "Integração WhatsApp",
        route: "/admin/integracoes/whatsapp",
        whatIs: "Configuração da integração com WhatsApp Business para envio de mensagens automatizadas.",
        purpose: [
          "Configurar número do WhatsApp Business",
          "Testar conexão com a API",
          "Definir regras de envio automático",
          "Monitorar status da integração"
        ],
        whenToUse: [
          "Na configuração inicial do sistema",
          "Quando mudar número do WhatsApp",
          "Para resolver problemas de envio",
          "Para verificar status da conexão"
        ],
        howToUse: [
          { step: "Acesse WhatsApp", description: "Menu lateral → Integrações → WhatsApp" },
          { step: "Configure credenciais", description: "Insira token da API e número" },
          { step: "Teste conexão", description: "Envie mensagem de teste" },
          { step: "Configure automações", description: "Defina gatilhos para mensagens automáticas" }
        ],
        whatHappensAfter: [
          "Sistema pode enviar mensagens automaticamente",
          "Confirmações e lembretes são enviados",
          "Comunicação com cliente é automatizada"
        ],
        warnings: [
          "Use apenas WhatsApp Business API oficial",
          "Respeite políticas do WhatsApp (evite spam)",
          "Mantenha token atualizado",
          "Monitore taxa de entrega"
        ]
      },
      {
        id: "pixel",
        title: "Pixel de Conversão",
        route: "/admin/integracoes/pixel",
        whatIs: "Configuração de pixels de rastreamento para Meta (Facebook/Instagram) e Google Ads.",
        purpose: [
          "Rastrear conversões para otimização de anúncios",
          "Criar públicos de remarketing",
          "Medir retorno sobre investimento em ads",
          "Alimentar algoritmos de plataformas"
        ],
        whenToUse: [
          "Na configuração inicial",
          "Ao criar conta de anúncios",
          "Para verificar se pixel está funcionando",
          "Quando alterar ID do pixel"
        ],
        howToUse: [
          { step: "Acesse Pixel", description: "Menu lateral → Integrações → Pixel" },
          { step: "Insira ID do pixel", description: "Cole o ID do Meta Pixel ou Google Ads" },
          { step: "Ative eventos", description: "Configure quais eventos rastrear" },
          { step: "Teste", description: "Verifique no gerenciador de eventos da plataforma" }
        ],
        whatHappensAfter: [
          "Conversões são reportadas para plataformas de ads",
          "Campanhas podem otimizar para conversões",
          "Públicos de remarketing são criados"
        ],
        warnings: [
          "Use pixel correto da conta certa",
          "Teste após configurar",
          "Considere LGPD e consentimento do usuário"
        ]
      },
      {
        id: "webhook",
        title: "Webhooks",
        route: "/admin/integracoes/webhook",
        whatIs: "Configuração de webhooks para integração com sistemas externos via APIs.",
        purpose: [
          "Integrar com sistemas externos (CRM, ERP, etc.)",
          "Enviar dados de eventos em tempo real",
          "Automatizar processos com outras ferramentas",
          "Criar integrações personalizadas"
        ],
        whenToUse: [
          "Para integrar com outros sistemas",
          "Quando precisar de automação avançada",
          "Para enviar dados para ferramentas externas",
          "Em integrações customizadas"
        ],
        howToUse: [
          { step: "Acesse Webhooks", description: "Menu lateral → Integrações → Webhook" },
          { step: "Crie novo webhook", description: "Clique em 'Novo Webhook'" },
          { step: "Configure URL", description: "Insira endpoint que receberá os dados" },
          { step: "Selecione eventos", description: "Escolha quais eventos disparam o webhook" },
          { step: "Teste", description: "Envie evento de teste e verifique recebimento" }
        ],
        whatHappensAfter: [
          "Eventos selecionados enviam dados para a URL",
          "Sistema externo recebe e processa dados",
          "Integrações funcionam automaticamente"
        ],
        warnings: [
          "URL deve estar acessível e segura (HTTPS)",
          "Trate falhas e retries no endpoint",
          "Monitore logs de erro",
          "Não exponha dados sensíveis desnecessariamente"
        ]
      }
    ]
  },
  {
    id: "blog-seo",
    title: "Módulo Blog / SEO",
    icon: "FileText",
    content: [
      {
        id: "blog-dashboard",
        title: "Dashboard Blog",
        route: "/admin/blog",
        whatIs: "Painel central de SEO Intelligence com métricas de keywords, oportunidades de ranqueamento e status de posts gerados pela IA.",
        purpose: [
          "Visualizar total de keywords mapeadas no banco",
          "Identificar keywords de alta oportunidade (score ≥ 80)",
          "Acompanhar posts publicados vs. pendentes",
          "Analisar distribuição por cidade, funil e intent",
          "Monitorar performance do blog automatizado"
        ],
        whenToUse: [
          "No planejamento semanal de conteúdo",
          "Para identificar próximas keywords a atacar",
          "Em reuniões de estratégia de SEO",
          "Para acompanhar ROI do blog"
        ],
        howToUse: [
          { step: "Acesse Blog", description: "Menu lateral → Blog" },
          { step: "Analise os KPIs", description: "Veja total de keywords, oportunidades, posts gerados e publicados" },
          { step: "Veja Top Keywords", description: "Identifique as keywords de maior oportunidade" },
          { step: "Use ações rápidas", description: "Navegue para Gerar Posts, Fila ou Banco de Keywords" }
        ],
        whatHappensAfter: [
          "Decisões informadas sobre prioridade de conteúdo",
          "Visão clara do pipeline de publicação",
          "Base para planejamento de SEO"
        ],
        warnings: [
          "Keywords com difficulty > 70 são difíceis de ranquear",
          "Priorize keywords com volume alto e dificuldade baixa",
          "Monitore keywords já usadas para evitar canibalização"
        ]
      },
      {
        id: "blog-gerar",
        title: "Gerar Posts",
        route: "/admin/blog/gerar",
        whatIs: "Sistema de geração de conteúdo em lote usando Inteligência Artificial, criando artigos SEO-otimizados automaticamente.",
        purpose: [
          "Criar artigos otimizados a partir de keywords",
          "Processar múltiplas keywords de uma vez",
          "Gerar conteúdo seguindo padrões de qualidade (1200+ palavras)",
          "Expandir cobertura de keywords estratégicas"
        ],
        whenToUse: [
          "Para expandir cobertura de keywords",
          "Quando tiver keywords de oportunidade identificadas",
          "Para criar conteúdo de clusters específicos",
          "Em campanhas de SEO agressivas"
        ],
        howToUse: [
          { step: "Acesse Gerar Posts", description: "Menu lateral → Blog → Gerar Posts" },
          { step: "Filtre keywords", description: "Use filtros por cluster, cidade, funil stage" },
          { step: "Selecione keywords", description: "Marque Top 5, Top 10 ou selecione manualmente" },
          { step: "Clique em Gerar", description: "Aguarde processamento (barra de progresso)" }
        ],
        whatHappensAfter: [
          "Posts são criados e vão para Fila & Revisão",
          "Keywords são marcadas como 'usadas'",
          "Conteúdo fica pronto para revisão humana"
        ],
        warnings: [
          "Cada post leva ~2 minutos para gerar",
          "Limite máximo de 10 posts por vez",
          "Sempre revise antes de publicar"
        ]
      },
      {
        id: "blog-fila",
        title: "Fila & Revisão",
        route: "/admin/blog/fila",
        whatIs: "Lista de posts gerados pela IA aguardando revisão humana e publicação no WordPress.",
        purpose: [
          "Revisar conteúdo antes de publicar",
          "Aprovar ou rejeitar posts gerados",
          "Publicar diretamente no WordPress",
          "Gerenciar posts em massa"
        ],
        whenToUse: [
          "Após gerar novos posts",
          "No fluxo diário de publicação",
          "Para controle de qualidade editorial",
          "Para republicar ou atualizar posts"
        ],
        howToUse: [
          { step: "Acesse Fila & Revisão", description: "Menu lateral → Blog → Fila & Revisão" },
          { step: "Filtre por status", description: "Gerado, Revisado, Pronto ou Publicado" },
          { step: "Preview do post", description: "Clique no ícone de olho para visualizar" },
          { step: "Aprove ou rejeite", description: "Use os botões de ação em cada post" },
          { step: "Publique", description: "Clique no ícone de envio para publicar no WordPress" }
        ],
        whatHappensAfter: [
          "Post aprovado fica pronto para publicação",
          "Ao publicar, post é enviado ao WordPress",
          "URL do post fica disponível para compartilhar"
        ],
        warnings: [
          "Sempre revise o conteúdo antes de publicar",
          "Verifique se imagens estão corretas",
          "Confirme título e meta description"
        ]
      },
      {
        id: "blog-keywords",
        title: "Banco de Keywords",
        route: "/admin/blog/keywords",
        whatIs: "Repositório central de todas as keywords SEO mapeadas, com métricas de oportunidade, dificuldade e volume de busca.",
        purpose: [
          "Visualizar todas as keywords disponíveis",
          "Filtrar por dificuldade, oportunidade e intent",
          "Analisar competição de keywords",
          "Exportar lista para análise externa"
        ],
        whenToUse: [
          "Para escolher próximas keywords a atacar",
          "Em análise de competição",
          "Para planejar clusters de conteúdo",
          "Para auditar banco de keywords"
        ],
        howToUse: [
          { step: "Acesse Banco de Keywords", description: "Menu lateral → Blog → Banco de Keywords" },
          { step: "Use filtros avançados", description: "Cluster, cidade, funil, status de uso" },
          { step: "Ordene por métricas", description: "Opportunity score, difficulty, volume" },
          { step: "Exporte se necessário", description: "Baixe em CSV para análise" }
        ],
        whatHappensAfter: [
          "Visão completa do inventário de keywords",
          "Identificação de oportunidades não exploradas",
          "Base para planejamento estratégico"
        ],
        warnings: [
          "Priorize opportunity > 70 e difficulty < 40",
          "Keywords já usadas ficam marcadas",
          "Evite canibalização de keywords similares"
        ]
      },
      {
        id: "blog-importar",
        title: "Importar Keywords",
        route: "/admin/blog/importar",
        whatIs: "Importador de CSV do Google Keyword Planner para enriquecer o banco de keywords com dados reais de volume e competição.",
        purpose: [
          "Enriquecer banco com dados reais de volume de busca",
          "Importar métricas de competição e CPC do Google",
          "Adicionar novas keywords em lote",
          "Atualizar dados de keywords existentes"
        ],
        whenToUse: [
          "Após exportar dados do Google Ads Keyword Planner",
          "Para pesquisa de novas keywords",
          "Ao expandir para novas cidades/serviços"
        ],
        howToUse: [
          { step: "Exporte do Google", description: "No Keyword Planner, exporte CSV" },
          { step: "Acesse Importar", description: "Menu lateral → Blog → Importar Keywords" },
          { step: "Arraste o arquivo", description: "Solte o CSV na área de upload" },
          { step: "Revise preview", description: "Confira keywords antes de importar" },
          { step: "Confirme importação", description: "Clique em importar" }
        ],
        whatHappensAfter: [
          "Keywords são classificadas automaticamente por cluster e intent",
          "Métricas são atualizadas se keyword já existir",
          "Opportunity score é calculado"
        ],
        warnings: [
          "Arquivo deve estar no formato CSV do Google Planner",
          "Colunas obrigatórias: keyword, volume, competition",
          "Keywords duplicadas são atualizadas, não criadas novamente"
        ]
      },
      {
        id: "blog-configuracoes",
        title: "Configurações Blog",
        route: "/admin/blog/configuracoes",
        whatIs: "Configurações de integração com WordPress e parâmetros de qualidade para publicação automática de posts.",
        purpose: [
          "Conectar ao WordPress para publicação automática",
          "Definir padrões mínimos de qualidade",
          "Configurar categorias e tags padrão",
          "Testar conexão com o blog"
        ],
        whenToUse: [
          "No setup inicial do módulo Blog",
          "Ao alterar credenciais do WordPress",
          "Para ajustar padrões de qualidade",
          "Quando conexão falhar"
        ],
        howToUse: [
          { step: "Acesse Configurações", description: "Menu lateral → Blog → Configurações" },
          { step: "Configure WordPress", description: "Insira URL, usuário e Application Password" },
          { step: "Teste a conexão", description: "Clique em 'Testar Conexão'" },
          { step: "Defina qualidade", description: "Configure mín. palavras, H2s, FAQs" },
          { step: "Salve alterações", description: "Clique em Salvar" }
        ],
        whatHappensAfter: [
          "Publicação automática fica habilitada",
          "Posts respeitam padrões de qualidade",
          "Erros de conexão são registrados"
        ],
        warnings: [
          "Use Application Password, não a senha normal do WordPress",
          "URL deve incluir /wp-json/wp/v2",
          "Teste sempre após alterar credenciais"
        ]
      },
      {
        id: "blog-logs",
        title: "Logs de Publicação",
        route: "/admin/blog/logs",
        whatIs: "Histórico de execuções do pipeline de geração e publicação de posts, com status de cada etapa.",
        purpose: [
          "Auditar publicações realizadas",
          "Debug de erros no pipeline",
          "Verificar tempo de processamento",
          "Identificar gargalos na geração"
        ],
        whenToUse: [
          "Quando um post falhar ao gerar ou publicar",
          "Para verificar histórico de publicações",
          "Em análise de performance do sistema",
          "Para troubleshooting"
        ],
        howToUse: [
          { step: "Acesse Logs", description: "Menu lateral → Blog → Logs de Publicação" },
          { step: "Visualize lista", description: "Veja logs recentes com data, etapa e status" },
          { step: "Identifique erros", description: "Ícone vermelho indica falha" },
          { step: "Veja detalhes", description: "Clique para expandir mensagem de erro" }
        ],
        whatHappensAfter: [
          "Identificação rápida de problemas",
          "Dados para correção de erros",
          "Histórico para auditoria"
        ],
        warnings: [
          "Logs são mantidos por 30 dias",
          "Erros frequentes indicam problema de configuração",
          "Verifique conexão com WordPress se publicação falhar"
        ]
      }
    ]
  },
  {
    id: "configuracoes",
    title: "Configurações",
    icon: "Settings",
    content: [
      {
        id: "perfil",
        title: "Perfil do Usuário",
        route: "/admin/perfil",
        whatIs: "Tela de gerenciamento de dados pessoais do usuário logado, incluindo foto, informações de contato e alteração de senha.",
        purpose: [
          "Atualizar foto de perfil",
          "Editar nome, telefone e cargo",
          "Adicionar endereço e bio",
          "Alterar senha de acesso"
        ],
        whenToUse: [
          "No primeiro acesso para completar cadastro",
          "Para atualizar informações pessoais",
          "Quando precisar trocar a senha",
          "Para personalizar seu perfil"
        ],
        howToUse: [
          { step: "Acesse Perfil", description: "Clique no seu avatar no canto superior → Perfil" },
          { step: "Altere a foto", description: "Clique na foto para fazer upload de nova imagem" },
          { step: "Edite campos", description: "Atualize nome, telefone, cargo, etc." },
          { step: "Salve alterações", description: "Clique em 'Salvar Alterações'" }
        ],
        whatHappensAfter: [
          "Dados são atualizados em todo o sistema",
          "Nova foto aparece no menu e históricos",
          "Senha é alterada imediatamente"
        ],
        warnings: [
          "Foto máximo 2MB (JPG, PNG)",
          "Anote a nova senha em lugar seguro",
          "E-mail não pode ser alterado (contate suporte)"
        ]
      },
      {
        id: "central-ajuda",
        title: "Central de Ajuda",
        route: "/admin/ajuda",
        whatIs: "Documentação interativa do sistema com manual completo, boas práticas e guia de erros comuns.",
        purpose: [
          "Consultar instruções de cada funcionalidade",
          "Baixar manual completo em PDF",
          "Aprender boas práticas operacionais",
          "Resolver erros comuns"
        ],
        whenToUse: [
          "Quando tiver dúvidas sobre funcionalidades",
          "Para treinamento de novos usuários",
          "Ao encontrar erros desconhecidos",
          "Para consultar procedimentos"
        ],
        howToUse: [
          { step: "Acesse Ajuda", description: "Menu lateral → Ajuda" },
          { step: "Busque funcionalidade", description: "Use a busca ou navegue pelos módulos" },
          { step: "Leia instruções", description: "Veja O que é, Para que serve, Como usar" },
          { step: "Baixe PDF", description: "Clique em 'Baixar Manual PDF' se preferir offline" }
        ],
        whatHappensAfter: [
          "Conhecimento sobre a funcionalidade desejada",
          "PDF salvo para consulta offline",
          "Dúvida resolvida de forma autônoma"
        ],
        warnings: [
          "Manual é atualizado periodicamente",
          "Para dúvidas não documentadas, contate suporte",
          "PDF reflete versão atual do sistema"
        ]
      },
      {
        id: "instalar-pwa",
        title: "Instalar App (PWA)",
        route: "/admin/instalar",
        whatIs: "Instruções para instalar o sistema como aplicativo no seu dispositivo, permitindo acesso rápido e funcionamento otimizado.",
        purpose: [
          "Acesso rápido via ícone na tela inicial",
          "Funcionamento otimizado como app nativo",
          "Receber notificações push",
          "Experiência fullscreen sem barra do navegador"
        ],
        whenToUse: [
          "No primeiro acesso ao sistema",
          "Ao configurar novo dispositivo",
          "Para facilitar acesso diário",
          "Quando quiser notificações push"
        ],
        howToUse: [
          { step: "No Android (Chrome)", description: "Menu (⋮) → 'Adicionar à tela inicial'" },
          { step: "No iPhone (Safari)", description: "Compartilhar (↑) → 'Adicionar à Tela de Início'" },
          { step: "No Desktop (Chrome)", description: "Menu → 'Instalar RC Limpa Mais'" },
          { step: "Confirme instalação", description: "Clique em 'Instalar' ou 'Adicionar'" }
        ],
        whatHappensAfter: [
          "Ícone aparece na tela inicial",
          "App abre em modo fullscreen",
          "Acesso mais rápido ao sistema"
        ],
        warnings: [
          "Safari no iPhone é obrigatório (Chrome não suporta PWA no iOS)",
          "Primeiro acesso requer login normal no navegador",
          "Notificações precisam ser autorizadas separadamente"
        ]
      },
      {
        id: "canais-origem-completo",
        title: "Canais de Origem",
        route: "/admin/canais",
        whatIs: "Sistema de rastreamento de origens de tráfego com links curtos personalizados para cada canal de marketing.",
        purpose: [
          "Criar links rastreáveis para cada canal (Instagram, TikTok, YouTube, Google)",
          "Copiar link curto para usar em campanhas",
          "Medir conversões por canal de origem",
          "Analisar ROI de cada fonte de tráfego"
        ],
        whenToUse: [
          "Ao criar nova campanha de marketing",
          "Para bio do Instagram/TikTok",
          "Em descrição de vídeos no YouTube",
          "Para links em anúncios Google"
        ],
        howToUse: [
          { step: "Acesse Canais", description: "Menu lateral → Marketing → Canais de Origem" },
          { step: "Crie novo canal", description: "Defina nome, tipo (Instagram, TikTok, etc.)" },
          { step: "Copie o link curto", description: "Clique no ícone de copiar ao lado do link" },
          { step: "Use na campanha", description: "Cole o link na bio, descrição ou anúncio" },
          { step: "Acompanhe resultados", description: "Veja cliques, leads e conversões" }
        ],
        whatHappensAfter: [
          "Todo acesso via link é rastreado",
          "Agendamentos mostram origem do cliente",
          "Relatórios de marketing mostram performance por canal"
        ],
        warnings: [
          "Use links diferentes para campanhas diferentes",
          "Link curto redireciona para o site com UTM",
          "Analise atribuição considerando jornada do cliente"
        ]
      },
      {
        id: "consolidado-financeiro",
        title: "Consolidado Financeiro",
        route: "/admin/financeiro/consolidado",
        whatIs: "Relatório financeiro consolidado que apresenta visão macro de receitas, despesas e resultado por período.",
        purpose: [
          "Ter visão macro de receitas vs. despesas",
          "Fazer comparativo entre meses",
          "Analisar tendências financeiras",
          "Preparar dados para contabilidade"
        ],
        whenToUse: [
          "No fechamento mensal",
          "Em reuniões de gestão e diretoria",
          "Para análise de tendências",
          "Para planejamento orçamentário"
        ],
        howToUse: [
          { step: "Acesse Consolidado", description: "Menu lateral → Financeiro → Consolidado" },
          { step: "Selecione período", description: "Escolha mês/ano para análise" },
          { step: "Analise resumo", description: "Veja receita, despesa, lucro e margem" },
          { step: "Compare períodos", description: "Use gráficos para ver evolução" },
          { step: "Exporte relatório", description: "Baixe PDF para reuniões" }
        ],
        whatHappensAfter: [
          "Visão clara do resultado financeiro",
          "Dados prontos para contabilidade",
          "Base para decisões estratégicas"
        ],
        warnings: [
          "Dados dependem de lançamentos corretos de receitas e despesas",
          "Considere sazonalidade ao comparar meses",
          "Fechamento deve ser feito até dia 5 do mês seguinte"
        ]
      },
      {
        id: "anuncios-facebook",
        title: "Anúncios Facebook/Meta",
        route: "/admin/integracoes/anuncios",
        whatIs: "Integração com Facebook Ads/Meta para conexão da conta de anúncios e visualização de métricas de campanhas.",
        purpose: [
          "Conectar conta de anúncios do Meta Business",
          "Visualizar métricas de campanhas em um só lugar",
          "Comparar investimento vs. retorno",
          "Acompanhar performance de anúncios"
        ],
        whenToUse: [
          "No setup inicial de integração com Meta Ads",
          "Para monitorar campanhas ativas",
          "Ao analisar ROI de Facebook/Instagram Ads",
          "Para renovar conexão expirada"
        ],
        howToUse: [
          { step: "Acesse Anúncios", description: "Menu lateral → Integrações → Anúncios" },
          { step: "Conecte com Facebook", description: "Clique em 'Conectar com Facebook'" },
          { step: "Autorize permissões", description: "Aceite as permissões solicitadas" },
          { step: "Selecione conta", description: "Escolha a conta de anúncios desejada" },
          { step: "Visualize métricas", description: "Veja gastos, impressões, cliques e conversões" }
        ],
        whatHappensAfter: [
          "Métricas de anúncios aparecem no dashboard",
          "Investimento é considerado no cálculo de ROI",
          "Dados são atualizados automaticamente"
        ],
        warnings: [
          "Necessário ter conta de anúncios no Meta Business",
          "Conexão precisa ser renovada periodicamente",
          "Apenas contas com permissão de administrador podem ser conectadas"
        ]
      }
    ]
  }
];

export const MANUAL_BEST_PRACTICES = [
  {
    category: "Segurança",
    items: [
      "Nunca compartilhe suas credenciais de acesso",
      "Faça logout ao sair do computador",
      "Altere sua senha periodicamente (a cada 90 dias)",
      "Ative autenticação em duas etapas quando disponível",
      "Não acesse de redes Wi-Fi públicas sem VPN"
    ]
  },
  {
    category: "Operacional",
    items: [
      "Confirme dados antes de alterar status para 'Pago'",
      "Verifique endereço completo antes de atribuir técnico",
      "Use 'Cancelado' em vez de excluir para manter histórico",
      "Mantenha contato atualizado dos clientes",
      "Documente observações importantes nos agendamentos"
    ]
  },
  {
    category: "Financeiro",
    items: [
      "Confirme comprovante antes de registrar pagamento",
      "Categorize despesas corretamente",
      "Revise metas mensalmente",
      "Mantenha comprovantes anexados",
      "Faça fechamento semanal para evitar acúmulo"
    ]
  },
  {
    category: "Comunicação",
    items: [
      "Responda clientes em até 2 horas (horário comercial)",
      "Use templates aprovados para padronizar comunicação",
      "Personalize mensagens quando necessário",
      "Respeite horário comercial para contatos (8h às 20h)",
      "Registre todas as interações com clientes"
    ]
  },
  {
    category: "Blog e SEO",
    items: [
      "Sempre revise posts gerados por IA antes de publicar",
      "Priorize keywords com opportunity > 70 e difficulty < 40",
      "Publique de forma consistente (mínimo 3 posts por semana)",
      "Use Application Password do WordPress, nunca a senha principal",
      "Monitore logs de publicação para identificar erros rapidamente"
    ]
  },
  {
    category: "Configurações",
    items: [
      "Mantenha seu perfil atualizado com foto e dados corretos",
      "Instale o app (PWA) para acesso mais rápido",
      "Consulte a Central de Ajuda antes de abrir chamado",
      "Teste integrações após qualquer alteração de credenciais",
      "Mantenha backups de senhas em local seguro"
    ]
  }
];

export const MANUAL_COMMON_ERRORS = [
  {
    error: "Agendamento duplicado",
    cause: "Cliente agendou duas vezes ou operador criou manualmente sem verificar",
    solution: "Sempre busque pelo telefone antes de criar agendamento manual",
    prevention: "Habilite alerta de duplicidade nas configurações"
  },
  {
    error: "Técnico sem localização no otimizador",
    cause: "Perfil do técnico não tem coordenadas cadastradas",
    solution: "Acesse Técnicos → Editar → Definir Localização",
    prevention: "Cadastre localização ao adicionar novo técnico"
  },
  {
    error: "WhatsApp não enviando",
    cause: "Token expirado ou número desconectado",
    solution: "Verifique integração em Integrações → WhatsApp",
    prevention: "Monitore status da integração semanalmente"
  },
  {
    error: "Relatório com dados zerados",
    cause: "Período selecionado não tem dados ou filtro muito restritivo",
    solution: "Ajuste o período e remova filtros excessivos",
    prevention: "Verifique se há agendamentos no período selecionado"
  },
  {
    error: "Cupom não aplicando",
    cause: "Cupom expirado, limite atingido ou categoria não aplicável",
    solution: "Verifique status e regras do cupom em Cupons",
    prevention: "Configure alertas de expiração"
  },
  {
    error: "Erro ao publicar no WordPress",
    cause: "Credenciais inválidas, WordPress inacessível ou Application Password incorreto",
    solution: "Verifique URL, usuário e Application Password em Blog → Configurações",
    prevention: "Teste conexão antes de publicar e mantenha credenciais atualizadas"
  },
  {
    error: "Keywords não aparecem no banco",
    cause: "Banco de keywords vazio ou filtros muito restritivos",
    solution: "Importe keywords via CSV ou ajuste os filtros de busca",
    prevention: "Mantenha banco com mínimo de 500 keywords ativas"
  },
  {
    error: "Post não gera conteúdo",
    cause: "Keyword muito específica, limite de API atingido ou erro de IA",
    solution: "Verifique logs de publicação para detalhes do erro",
    prevention: "Use keywords com volume adequado e aguarde entre gerações"
  },
  {
    error: "Foto de perfil não atualiza",
    cause: "Arquivo muito grande ou formato não suportado",
    solution: "Use imagem JPG ou PNG com menos de 2MB",
    prevention: "Redimensione imagens antes do upload"
  },
  {
    error: "Notificações push não chegam",
    cause: "Usuário não autorizou notificações ou navegador não suportado",
    solution: "Verifique permissões do navegador e tente autorizar novamente",
    prevention: "Use navegadores modernos (Chrome, Firefox, Edge)"
  }
];
