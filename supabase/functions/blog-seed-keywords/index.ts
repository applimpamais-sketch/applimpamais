import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ============================================================================
// PARTE 1 — FONTES DE BASE (Serviços, Cidades, Bairros)
// ============================================================================

const CLUSTER_MAP: Record<string, string> = {
  'SOFÁ': 'sofa', 'COLCHÃO': 'colchao', 'POLTRONA': 'poltrona',
  'CADEIRA': 'cadeira', 'BANQUETA': 'cadeira', 'TAPETE': 'tapete',
  'CARRO': 'carro', 'BEBE CONFORTO': 'bebe', 'CADEIRINHA': 'bebe',
  'CARRINHO DE BEBE': 'bebe', 'CHAISE': 'sofa', 'DIVÃ': 'poltrona',
  'NAMORADEIRA': 'poltrona', 'PUFF': 'poltrona', 'TRAVESSEIRO': 'colchao',
  'RECAMIER': 'poltrona', 'MOISÉS': 'bebe',
};

const OBJETOS: Record<string, string[]> = {
  sofa: ['sofá', 'estofado', 'sofá retrátil', 'sofá cama', 'sofá de canto'],
  colchao: ['colchão', 'cama', 'colchão casal', 'colchão solteiro', 'colchão queen'],
  poltrona: ['poltrona', 'poltrona de amamentação', 'poltrona papai'],
  cadeira: ['cadeira', 'cadeira de escritório', 'cadeira estofada'],
  tapete: ['tapete', 'carpete', 'passadeira'],
  carro: ['banco do carro', 'estofado do carro', 'interior do carro', 'bancos automotivos'],
  bebe: ['carrinho de bebê', 'bebê conforto', 'cadeirinha de bebê'],
  aluguel: ['extratora', 'máquina extratora', 'extratora profissional'],
  outros: ['estofado', 'puff', 'divã', 'namoradeira'],
};

const CIDADES = ['Belo Horizonte', 'Contagem', 'Betim', 'Nova Lima', 'Ibirité', 'Lagoa Santa', 'Sarzedo', 'Vespasiano'];

const BAIRROS: Record<string, string[]> = {
  'Belo Horizonte': [
    'Savassi', 'Buritis', 'Belvedere', 'Mangabeiras', 'Pampulha', 'Funcionários', 'Lourdes',
    'Santo Agostinho', 'Santa Efigênia', 'São Pedro', 'Cidade Nova', 'Padre Eustáquio',
    'Venda Nova', 'Santa Tereza', 'Horto', 'Ouro Preto', 'Castelo', 'Sion', 'Gutierrez',
    'Grajaú', 'Carlos Prates', 'Sagrada Família', 'Floresta', 'Serra', 'Anchieta',
    'Carmo', 'Coração de Jesus', 'Santa Lúcia', 'Luxemburgo', 'Coração Eucarístico',
    'Barreiro', 'Centro', 'Barro Preto', 'Cruzeiro', 'Santa Mônica', 'Caiçara',
    'Santo Antônio', 'Jardim América', 'Liberdade', 'Nova Suíça', 'Planalto',
    'Renascença', 'União', 'São Lucas', 'Alto Vera Cruz', 'Pompéia', 'Calafate',
    'Estoril', 'Dona Clara', 'São Bento', 'Jaraguá', 'Santa Amélia', 'Céu Azul',
  ],
  'Contagem': ['Centro', 'Eldorado', 'Industrial', 'Ressaca', 'Riacho', 'Inconfidentes', 'Novo Eldorado', 'Água Branca'],
  'Betim': ['Centro', 'Citrolândia', 'PTB', 'Jardim Teresópolis', 'Alterosas', 'Imbiruçu', 'Icaivera'],
  'Nova Lima': ['Centro', 'Vila da Serra', 'Vale do Sereno', 'Jardim Canadá', 'Belvedere III', 'Alphaville'],
  'Ibirité': ['Centro', 'Alvorada', 'Industrial', 'Novo Horizonte'],
  'Lagoa Santa': ['Centro', 'Lundceia', 'Joá', 'Lapinha'],
  'Sarzedo': ['Centro', 'Bela Vista', 'Campo Alegre'],
  'Vespasiano': ['Centro', 'Morro Alto', 'Jardim Alterosa'],
};

// ============================================================================
// PARTE 2 — EXPANSÃO SEMÂNTICA AVANÇADA (Sinônimos Reais)
// ============================================================================

const SINONIMOS_ACAO = {
  limpeza: ['limpeza', 'limpar', 'lavagem', 'lavar', 'higienização', 'higienizar', 'lavagem profunda', 'limpeza profunda', 'higienização profissional'],
  empresa: ['empresa', 'serviço', 'profissional', 'especialista', 'técnico', 'atendimento'],
  comercial: ['preço', 'valor', 'quanto custa', 'orçamento', 'contratar', 'agendar', 'melhor empresa', 'empresa perto'],
};

// ============================================================================
// PARTE 3 — EXPANSÃO POR OBJETO (Variações)
// ============================================================================

const gerarVariacoesObjeto = (objeto: string): string[] => {
  const variacoes = [
    `limpeza de ${objeto}`,
    `limpeza em ${objeto}`,
    `limpar ${objeto}`,
    `lavagem de ${objeto}`,
    `lavagem de estofados`,
    `higienização de ${objeto}`,
    `higienização de estofados`,
  ];
  return variacoes;
};

// ============================================================================
// PARTE 5 — ALUGUEL EXTRATORA VARIAÇÕES COMPLETAS
// ============================================================================

// Variações base de aluguel
const VARIACOES_ALUGUEL_BASE = [
  'aluguel extratora', 'alugar extratora', 'aluguel de extratora',
  'locação extratora', 'locação de extratora', 'extratora para alugar',
  'onde alugar extratora', 'extratora aluguel', 'aluguel máquina extratora',
  'locação máquina extratora', 'máquina de limpar sofá para alugar',
  'máquina lavar sofá aluguel', 'extratora ipc aluguel', 'extratora ipc para alugar',
  'aluguel extratora profissional', 'locação extratora profissional',
  'aluguel máquina limpeza estofados', 'máquina extratora para locação',
  'alugar máquina de lavar estofados', 'máquina extratora locação',
];

// Topo de funil - Informativo sobre aluguel
const ALUGUEL_TOPO = [
  'como funciona aluguel de extratora',
  'vale a pena alugar extratora',
  'quanto tempo pode ficar com extratora alugada',
  'como usar extratora alugada',
  'extratora alugada vs comprar',
  'cuidados ao usar extratora alugada',
  'primeira vez usando extratora alugada',
  'extratora alugada funciona bem',
  'dicas para usar extratora alugada',
  'como limpar sofá com extratora alugada',
  'extratora alugada como funciona',
  'tutorial extratora alugada',
  'passo a passo extratora alugada',
  'o que saber antes de alugar extratora',
  'alugar extratora pela primeira vez',
  'como escolher extratora para alugar',
  'extratora caseira vs profissional aluguel',
  'qual extratora alugar para limpar sofá',
  'qual melhor extratora para alugar',
];

// Meio de funil - Comparativo/Decisão sobre aluguel
const ALUGUEL_MEIO = [
  'preço aluguel extratora',
  'quanto custa alugar extratora',
  'aluguel de extratora preço',
  'aluguel de extratora por dia',
  'aluguel extratora diária',
  'aluguel extratora final de semana',
  'aluguel extratora por hora',
  'aluguel extratora semanal',
  'alugar extratora ou contratar limpeza',
  'extratora alugada ou limpeza profissional',
  'vale a pena alugar ou contratar limpeza',
  'comparativo alugar vs contratar limpeza sofá',
  'aluguel extratora vale a pena',
  'locação extratora preço',
  'quanto custa locação de extratora',
  'preço locação máquina extratora',
  'aluguel máquina limpar sofá preço',
  'extratora ipc aluguel preço',
];

// ============================================================================
// PARTE 6 — IMPERMEABILIZAÇÃO VARIAÇÕES
// ============================================================================

const VARIACOES_IMPERMEABILIZACAO = [
  'impermeabilização de sofá', 'impermeabilizar sofá',
  'proteção de tecido sofá', 'impermeabilização de estofados',
  'impermeabilização de colchão', 'proteção impermeável sofá',
  'impermeabilização profissional sofá', 'impermeabilizar estofado',
  'proteção antimanchas sofá', 'tratamento antimancha estofados',
];

// ============================================================================
// PARTE 8 — PROBLEMAS REAIS DO USUÁRIO
// ============================================================================

const PROBLEMAS = {
  manchas: [
    'café', 'vinho', 'vinho tinto', 'sangue', 'gordura', 'óleo', 'tinta', 'caneta',
    'chocolate', 'catchup', 'mostarda', 'molho', 'urina', 'xixi', 'fezes', 'vômito',
    'maquiagem', 'batom', 'base', 'rímel', 'cerveja', 'refrigerante', 'suco',
    'graxa', 'suor', 'leite', 'comida', 'ketchup', 'coca cola', 'água',
    'mancha amarela', 'mancha antiga', 'mancha escura', 'mancha de pet',
  ],
  cheiros: [
    'xixi de gato', 'xixi de cachorro', 'urina de animal', 'mofo', 'bolor',
    'umidade', 'cigarro', 'fumaça', 'vômito', 'cachorro molhado', 'suor',
    'urina humana', 'cheiro de animal', 'cheiro forte', 'odor desagradável',
    'mau cheiro', 'cheiro de bebê', 'cheiro de leite azedo', 'cheiro de pet',
  ],
  tecidos: [
    'suede', 'veludo', 'linho', 'couro', 'courino', 'couro sintético', 'chenille',
    'jacquard', 'sarja', 'algodão', 'poliéster', 'sintético', 'microfibra',
    'tecido claro', 'tecido escuro', 'tecido delicado', 'tecido impermeável',
  ],
  condicoes: [
    'mofo', 'ácaro', 'bolor', 'encardido', 'amarelado', 'desbotado',
    'pelo de animal', 'pelo de gato', 'pelo de cachorro', 'poeira',
    'sujeira incrustada', 'mancha persistente', 'muito sujo', 'velho',
  ],
  produtos: [
    'bicarbonato', 'vinagre', 'detergente', 'água sanitária', 'sabão neutro',
    'álcool', 'limpa vidros', 'multiuso', 'amaciante', 'água oxigenada',
    'limpa estofados', 'veja', 'vanish', 'sabão em pó', 'cloro',
  ],
};

// ============================================================================
// PARTE 9 — DETECÇÃO DE TRENDING (Sazonalidade + Novos Termos)
// ============================================================================

const TRENDING_TOPICS = [
  { termo: 'limpeza pós obra', trend_score: 85 },
  { termo: 'higienização covid', trend_score: 75 },
  { termo: 'limpeza profunda quarentena', trend_score: 70 },
  { termo: 'cheiro de mofo chuva', trend_score: 90 },
  { termo: 'ácaro alergia', trend_score: 80 },
  { termo: 'pet friendly limpeza', trend_score: 75 },
  { termo: 'limpeza ecológica', trend_score: 65 },
  { termo: 'produtos naturais limpeza', trend_score: 70 },
  { termo: 'alergia poeira', trend_score: 85 },
  { termo: 'mofo inverno', trend_score: 88 },
  { termo: 'estofado molhado chuva', trend_score: 82 },
];

// ============================================================================
// PARTE 10 — PERGUNTAS REAIS DE USUÁRIOS (Question-based Keywords)
// ============================================================================

const PERGUNTAS_TEMPLATES = [
  'como limpar {objeto} sem molhar',
  '{objeto} pode estragar com limpeza',
  'quanto tempo demora secagem {objeto}',
  'pode usar {produto} em {objeto}',
  'como tirar {problema} de {objeto}',
  'limpeza de {objeto} é segura',
  'qual o melhor produto para limpar {objeto}',
  'como remover {mancha} do {objeto}',
  'dá para limpar {objeto} em casa',
  '{objeto} de {tecido} pode lavar',
  'como eliminar {cheiro} do {objeto}',
  'quanto custa limpeza de {objeto}',
  'limpeza profissional de {objeto} vale a pena',
  'como escolher empresa limpeza {objeto}',
  'impermeabilização de {objeto} dura quanto tempo',
  '{objeto} com mofo tem solução',
  'como secar {objeto} rápido',
  'limpeza de {objeto} estraga',
  'sofá de {tecido} como limpar',
  'colchão com {problema} como resolver',
];

// ============================================================================
// PARTE 11 — GAP DE CONCORRENTES (Keywords Subexploradas)
// ============================================================================

const COMPETITOR_GAPS = [
  // Keywords locais específicas pouco exploradas
  { pattern: 'limpeza de sofá no {bairro}', gap_score: 90 },
  { pattern: 'empresa limpeza estofados {bairro}', gap_score: 88 },
  { pattern: 'aluguel extratora {cidade}', gap_score: 85 },
  // Problemas específicos
  { pattern: 'tirar {mancha} de sofá {tecido}', gap_score: 92 },
  { pattern: 'como eliminar {cheiro} do colchão', gap_score: 87 },
  // Comparativos
  { pattern: 'limpeza profissional vs caseira {objeto}', gap_score: 78 },
  { pattern: 'vale a pena impermeabilizar {objeto}', gap_score: 82 },
  // Long tail específico
  { pattern: 'como tirar mancha de {mancha} do sofá de {tecido}', gap_score: 95 },
  { pattern: 'limpeza de carrinho de bebê {cidade}', gap_score: 88 },
];

// ============================================================================
// PARTE 12 — SCORE FINAL SEO COMPLETO
// ============================================================================

interface ScoreParams {
  keyword: string;
  funnel: string;
  hasLocation: boolean;
  hasProblem: boolean;
  isQuestion: boolean;
  hasCompetitorGap: boolean;
  trendScore?: number;
  gapScore?: number;
}

function calculateAdvancedScores(params: ScoreParams): {
  difficulty_score: number;
  opportunity_score: number;
  trend_score: number;
  competitor_gap_score: number;
} {
  const { keyword, funnel, hasLocation, hasProblem, isQuestion, hasCompetitorGap, trendScore = 50, gapScore = 50 } = params;
  const wordCount = keyword.split(' ').length;
  
  // DIFFICULTY SCORE (1-100, menor = mais fácil de ranquear)
  let difficulty = 50;
  
  // Long-tail reduz dificuldade
  if (wordCount >= 7) difficulty -= 25;
  else if (wordCount >= 5) difficulty -= 15;
  else if (wordCount >= 4) difficulty -= 8;
  
  // Local SEO reduz dificuldade
  if (hasLocation) difficulty -= 20;
  
  // Fundo de funil específico
  if (funnel === 'fundo') difficulty -= 10;
  
  // Problema específico
  if (hasProblem) difficulty -= 8;
  
  // Perguntas são menos competitivas
  if (isQuestion) difficulty -= 12;
  
  // Gap de concorrente = oportunidade
  if (hasCompetitorGap) difficulty -= 15;
  
  // OPPORTUNITY SCORE (1-100, maior = melhor oportunidade)
  let opportunity = 40;
  
  // Long-tail bonus
  opportunity += Math.min(wordCount * 6, 30);
  
  // Local SEO bonus (alta conversão)
  if (hasLocation) opportunity += 25;
  
  // Funil
  if (funnel === 'fundo') opportunity += 20; // Alta intenção de compra
  else if (funnel === 'meio') opportunity += 12; // Consideração
  
  // Problema específico = dor real
  if (hasProblem) opportunity += 10;
  
  // Perguntas = featured snippets
  if (isQuestion) opportunity += 8;
  
  // Intenção comercial
  const comercialTerms = ['preço', 'quanto custa', 'orçamento', 'contratar', 'agendar', 'empresa', 'profissional'];
  if (comercialTerms.some(t => keyword.includes(t))) opportunity += 15;
  
  // Trend bonus
  const trendBonus = Math.floor((trendScore - 50) / 5);
  opportunity += trendBonus;
  
  // Gap bonus
  const gapBonus = Math.floor((gapScore - 50) / 4);
  opportunity += gapBonus;
  
  return {
    difficulty_score: Math.max(5, Math.min(95, difficulty)),
    opportunity_score: Math.max(10, Math.min(98, opportunity)),
    trend_score: trendScore,
    competitor_gap_score: gapScore,
  };
}

// ============================================================================
// PARTE 4 + 7 — GERAÇÃO DE KEYWORDS COM EXPANSÃO LOCAL E LONG TAIL
// ============================================================================

function generateAllKeywords(servicosCluster: Record<string, Set<string>>): any[] {
  const keywords: any[] = [];
  const existingSet = new Set<string>();

  const addKw = (kw: any) => {
    const key = kw.keyword.toLowerCase().trim();
    if (!existingSet.has(key) && key.length > 10) {
      existingSet.add(key);
      keywords.push(kw);
    }
  };

  const clusters = Object.keys(OBJETOS);

  for (const cluster of clusters) {
    // Pular aluguel - tem geração própria específica
    if (cluster === 'aluguel') continue;
    
    const objetosVariacoes = OBJETOS[cluster] || ['estofado'];

    for (const objeto of objetosVariacoes.slice(0, 3)) {
      // ======= TOPO DE FUNIL - Manchas =======
      for (const mancha of PROBLEMAS.manchas.slice(0, 20)) {
        const kw1 = `como tirar mancha de ${mancha} do ${objeto}`;
        const kw2 = `remover ${mancha} do ${objeto}`;
        const kw3 = `${objeto} manchado de ${mancha} como limpar`;
        
        [kw1, kw2, kw3].forEach(kw => {
          const scores = calculateAdvancedScores({ 
            keyword: kw, funnel: 'topo', hasLocation: false, hasProblem: true, 
            isQuestion: kw.includes('como'), hasCompetitorGap: false 
          });
          addKw({ cluster, keyword: kw, funnel_stage: 'topo', intent: 'info', ...scores });
        });
      }

      // ======= TOPO - Cheiros =======
      for (const cheiro of PROBLEMAS.cheiros.slice(0, 12)) {
        const kw1 = `como tirar cheiro de ${cheiro} do ${objeto}`;
        const kw2 = `eliminar odor de ${cheiro} do ${objeto}`;
        const kw3 = `${objeto} com cheiro de ${cheiro} o que fazer`;
        
        [kw1, kw2, kw3].forEach(kw => {
          const scores = calculateAdvancedScores({ 
            keyword: kw, funnel: 'topo', hasLocation: false, hasProblem: true, 
            isQuestion: true, hasCompetitorGap: false 
          });
          addKw({ cluster, keyword: kw, funnel_stage: 'topo', intent: 'info', ...scores });
        });
      }

      // ======= TOPO - Tecidos =======
      for (const tecido of PROBLEMAS.tecidos.slice(0, 12)) {
        const kw1 = `como limpar ${objeto} de ${tecido}`;
        const kw2 = `${objeto} de ${tecido} pode lavar`;
        const kw3 = `limpeza de ${objeto} ${tecido}`;
        
        [kw1, kw2, kw3].forEach(kw => {
          const scores = calculateAdvancedScores({ 
            keyword: kw, funnel: 'topo', hasLocation: false, hasProblem: false, 
            isQuestion: kw.includes('como') || kw.includes('pode'), hasCompetitorGap: false 
          });
          addKw({ cluster, keyword: kw, funnel_stage: 'topo', intent: 'info', ...scores });
        });
      }

      // ======= TOPO - Condições =======
      for (const cond of PROBLEMAS.condicoes) {
        const kw1 = `${objeto} com ${cond} como limpar`;
        const kw2 = `como tirar ${cond} do ${objeto}`;
        const kw3 = `${objeto} ${cond} o que fazer`;
        
        [kw1, kw2, kw3].forEach(kw => {
          const scores = calculateAdvancedScores({ 
            keyword: kw, funnel: 'topo', hasLocation: false, hasProblem: true, 
            isQuestion: true, hasCompetitorGap: true, gapScore: 80 
          });
          addKw({ cluster, keyword: kw, funnel_stage: 'topo', intent: 'info', ...scores });
        });
      }

      // ======= TOPO - Produtos (pode usar X no Y) =======
      for (const produto of PROBLEMAS.produtos.slice(0, 10)) {
        const kw1 = `pode usar ${produto} no ${objeto}`;
        const kw2 = `${produto} para limpar ${objeto}`;
        const kw3 = `limpar ${objeto} com ${produto} é seguro`;
        
        [kw1, kw2, kw3].forEach(kw => {
          const scores = calculateAdvancedScores({ 
            keyword: kw, funnel: 'topo', hasLocation: false, hasProblem: false, 
            isQuestion: true, hasCompetitorGap: false 
          });
          addKw({ cluster, keyword: kw, funnel_stage: 'topo', intent: 'info', ...scores });
        });
      }

      // ======= TOPO - Templates Gerais =======
      const topoGeral = [
        `como limpar ${objeto} em casa`,
        `${objeto} com mofo o que fazer`,
        `quanto tempo demora para secar ${objeto}`,
        `como higienizar ${objeto}`,
        `${objeto} manchado como tirar`,
        `como limpar ${objeto} sem danificar`,
        `${objeto} encardido como resolver`,
        `como clarear ${objeto} amarelado`,
        `tirar pelo de animal do ${objeto}`,
        `limpeza caseira de ${objeto}`,
        `passo a passo limpeza de ${objeto}`,
        `${objeto} com ácaro como limpar`,
        `como tirar mancha antiga do ${objeto}`,
        `produtos para limpar ${objeto}`,
        `como secar ${objeto} mais rápido`,
        `${objeto} molhou o que fazer`,
        `como remover sujeira do ${objeto}`,
        `limpeza profunda ${objeto} em casa`,
        `dicas para limpar ${objeto}`,
        `${objeto} muito sujo como limpar`,
      ];

      for (const kw of topoGeral) {
        const scores = calculateAdvancedScores({ 
          keyword: kw, funnel: 'topo', hasLocation: false, hasProblem: kw.includes('mofo') || kw.includes('mancha'), 
          isQuestion: kw.includes('como'), hasCompetitorGap: false 
        });
        addKw({ cluster, keyword: kw, funnel_stage: 'topo', intent: 'info', ...scores });
      }

      // ======= MEIO DE FUNIL - Comparativos =======
      const meioTemplates = [
        `limpeza profissional vs caseira ${objeto}`,
        `vale a pena contratar limpeza de ${objeto}`,
        `vale a pena alugar extratora para ${objeto}`,
        `melhor produto para limpar ${objeto}`,
        `limpeza a seco ${objeto} funciona`,
        `impermeabilizar ${objeto} vale a pena`,
        `quanto custa limpar ${objeto}`,
        `preço limpeza de ${objeto}`,
        `limpeza profissional de ${objeto} compensa`,
        `como escolher empresa de limpeza de ${objeto}`,
        `impermeabilização de ${objeto} dura quanto tempo`,
        `limpeza e impermeabilização de ${objeto} junto`,
        `limpar ${objeto} sozinho ou contratar`,
        `vantagens limpeza profissional ${objeto}`,
        `desvantagens limpar ${objeto} em casa`,
        `orçamento limpeza de ${objeto}`,
        `contratar limpeza de ${objeto}`,
        `empresa especializada limpeza ${objeto}`,
        `serviço de higienização de ${objeto}`,
        `limpeza técnica de ${objeto}`,
      ];

      for (const kw of meioTemplates) {
        const scores = calculateAdvancedScores({ 
          keyword: kw, funnel: 'meio', hasLocation: false, hasProblem: false, 
          isQuestion: kw.includes('vale a pena'), hasCompetitorGap: true, gapScore: 75 
        });
        addKw({ cluster, keyword: kw, funnel_stage: 'meio', intent: 'comparativo', ...scores });
      }

      // ======= FUNDO DE FUNIL - Por Cidade =======
      for (const cidade of CIDADES) {
        const cidadeLower = cidade.toLowerCase();
        const cidadeAbrev = cidade === 'Belo Horizonte' ? 'bh' : cidadeLower.split(' ')[0];

        // Variações com sinônimos de ação
        for (const acao of ['limpeza', 'higienização', 'lavagem']) {
          const fundoCidade = [
            `${acao} de ${objeto} em ${cidadeLower}`,
            `${acao} de ${objeto} ${cidadeLower}`,
            `empresa de ${acao} de ${objeto} em ${cidadeLower}`,
            `${acao} de estofados em ${cidadeLower}`,
            `melhor empresa ${acao} ${objeto} ${cidadeLower}`,
          ];

          for (const kw of fundoCidade) {
            const scores = calculateAdvancedScores({ 
              keyword: kw, funnel: 'fundo', hasLocation: true, hasProblem: false, 
              isQuestion: false, hasCompetitorGap: true, gapScore: 85 
            });
            addKw({ cluster, keyword: kw, funnel_stage: 'fundo', intent: 'local', city: cidade, ...scores });
          }
        }

        // Variações comerciais
        const fundoComercial = [
          `quanto custa limpar ${objeto} em ${cidadeLower}`,
          `preço limpeza de ${objeto} ${cidadeLower}`,
          `orçamento limpeza ${objeto} ${cidadeLower}`,
          `contratar limpeza ${objeto} ${cidadeLower}`,
          `agendar limpeza de ${objeto} ${cidadeLower}`,
        ];

        for (const kw of fundoComercial) {
          const scores = calculateAdvancedScores({ 
            keyword: kw, funnel: 'fundo', hasLocation: true, hasProblem: false, 
            isQuestion: kw.includes('quanto'), hasCompetitorGap: true, gapScore: 88 
          });
          addKw({ cluster, keyword: kw, funnel_stage: 'fundo', intent: 'transacional', city: cidade, ...scores });
        }

        // Com abreviação (BH)
        if (cidadeAbrev !== cidadeLower) {
          const kwAbrev = `limpeza de ${objeto} ${cidadeAbrev}`;
          const scores = calculateAdvancedScores({ 
            keyword: kwAbrev, funnel: 'fundo', hasLocation: true, hasProblem: false, 
            isQuestion: false, hasCompetitorGap: true, gapScore: 90 
          });
          addKw({ cluster, keyword: kwAbrev, funnel_stage: 'fundo', intent: 'local', city: cidade, ...scores });
        }
      }

      // ======= FUNDO DE FUNIL - Por Bairro =======
      for (const [cidade, bairros] of Object.entries(BAIRROS)) {
        for (const bairro of bairros) {
          const bairroLower = bairro.toLowerCase();
          
          const fundoBairro = [
            `limpeza de ${objeto} no ${bairroLower}`,
            `limpeza de ${objeto} ${bairroLower}`,
            `empresa limpeza ${objeto} ${bairroLower}`,
            `higienização de ${objeto} ${bairroLower}`,
          ];

          for (const kw of fundoBairro) {
            const scores = calculateAdvancedScores({ 
              keyword: kw, funnel: 'fundo', hasLocation: true, hasProblem: false, 
              isQuestion: false, hasCompetitorGap: true, gapScore: 92 
            });
            addKw({ 
              cluster, keyword: kw, funnel_stage: 'fundo', intent: 'local', 
              city: cidade, bairro, ...scores 
            });
          }
        }
      }

      // ======= LONG TAIL ULTRA-ESPECÍFICO (Mancha + Tecido + Objeto) =======
      for (const mancha of PROBLEMAS.manchas.slice(0, 8)) {
        for (const tecido of PROBLEMAS.tecidos.slice(0, 6)) {
          const kwLongTail = `como tirar mancha de ${mancha} do ${objeto} de ${tecido}`;
          const scores = calculateAdvancedScores({ 
            keyword: kwLongTail, funnel: 'topo', hasLocation: false, hasProblem: true, 
            isQuestion: true, hasCompetitorGap: true, gapScore: 95 
          });
          addKw({ cluster, keyword: kwLongTail, funnel_stage: 'topo', intent: 'info', ...scores });
        }
      }
    }
  }

  // ======= ALUGUEL - Variações Base =======
  for (const varAluguel of VARIACOES_ALUGUEL_BASE) {
    const scores = calculateAdvancedScores({ 
      keyword: varAluguel, funnel: 'meio', hasLocation: false, hasProblem: false, 
      isQuestion: false, hasCompetitorGap: true, gapScore: 85 
    });
    addKw({ cluster: 'aluguel', keyword: varAluguel, funnel_stage: 'meio', intent: 'comparativo', ...scores });
  }

  // ======= ALUGUEL - Topo de Funil (Informativo) =======
  for (const kw of ALUGUEL_TOPO) {
    const scores = calculateAdvancedScores({ 
      keyword: kw, funnel: 'topo', hasLocation: false, hasProblem: false, 
      isQuestion: kw.includes('como') || kw.includes('quanto') || kw.includes('qual'), 
      hasCompetitorGap: true, gapScore: 75 
    });
    addKw({ cluster: 'aluguel', keyword: kw, funnel_stage: 'topo', intent: 'info', ...scores });
  }

  // ======= ALUGUEL - Meio de Funil (Comparativo/Preço) =======
  for (const kw of ALUGUEL_MEIO) {
    const scores = calculateAdvancedScores({ 
      keyword: kw, funnel: 'meio', hasLocation: false, hasProblem: false, 
      isQuestion: kw.includes('quanto') || kw.includes('vale'), 
      hasCompetitorGap: true, gapScore: 82 
    });
    addKw({ cluster: 'aluguel', keyword: kw, funnel_stage: 'meio', intent: 'comparativo', ...scores });
  }

  // ======= ALUGUEL - Por Cidade (Fundo de Funil) =======
  for (const cidade of CIDADES) {
    const cidadeLower = cidade.toLowerCase();
    const aluguelCidade = [
      `aluguel de extratora em ${cidadeLower}`,
      `alugar extratora em ${cidadeLower}`,
      `alugar extratora ${cidadeLower}`,
      `onde alugar extratora em ${cidadeLower}`,
      `locação de extratora em ${cidadeLower}`,
      `locação extratora ${cidadeLower}`,
      `máquina extratora aluguel ${cidadeLower}`,
      `máquina de limpar sofá para alugar em ${cidadeLower}`,
      `extratora para alugar em ${cidadeLower}`,
      `aluguel máquina limpeza sofá ${cidadeLower}`,
      `onde alugar máquina extratora ${cidadeLower}`,
    ];

    for (const kw of aluguelCidade) {
      const scores = calculateAdvancedScores({ 
        keyword: kw, funnel: 'fundo', hasLocation: true, hasProblem: false, 
        isQuestion: kw.includes('onde'), hasCompetitorGap: true, gapScore: 88 
      });
      addKw({ cluster: 'aluguel', keyword: kw, funnel_stage: 'fundo', intent: 'local', city: cidade, ...scores });
    }
  }

  // ======= ALUGUEL - Por Bairro (Fundo de Funil - Long Tail) =======
  for (const [cidade, bairros] of Object.entries(BAIRROS)) {
    for (const bairro of bairros) {
      const bairroLower = bairro.toLowerCase();
      const aluguelBairro = [
        `aluguel de extratora no ${bairroLower}`,
        `alugar extratora ${bairroLower}`,
        `locação de extratora no ${bairroLower}`,
        `máquina extratora para alugar ${bairroLower}`,
        `onde alugar extratora no ${bairroLower}`,
        `extratora para alugar no ${bairroLower}`,
        `aluguel máquina limpeza sofá ${bairroLower}`,
      ];

      for (const kw of aluguelBairro) {
        const scores = calculateAdvancedScores({ 
          keyword: kw, funnel: 'fundo', hasLocation: true, hasProblem: false, 
          isQuestion: kw.includes('onde'), hasCompetitorGap: true, gapScore: 92 
        });
        addKw({ 
          cluster: 'aluguel', keyword: kw, funnel_stage: 'fundo', 
          intent: 'local', city: cidade, bairro, ...scores 
        });
      }
    }
  }

  // ======= IMPERMEABILIZAÇÃO - Variações Completas =======
  for (const varImper of VARIACOES_IMPERMEABILIZACAO) {
    const scores = calculateAdvancedScores({ 
      keyword: varImper, funnel: 'meio', hasLocation: false, hasProblem: false, 
      isQuestion: false, hasCompetitorGap: true, gapScore: 80 
    });
    addKw({ cluster: 'sofa', keyword: varImper, funnel_stage: 'meio', intent: 'comparativo', ...scores });
  }

  // Impermeabilização por cidade
  for (const cidade of CIDADES) {
    const cidadeLower = cidade.toLowerCase();
    const imperCidade = [
      `impermeabilização de sofá em ${cidadeLower}`,
      `impermeabilizar estofado ${cidadeLower}`,
      `proteção de sofá ${cidadeLower}`,
    ];

    for (const kw of imperCidade) {
      const scores = calculateAdvancedScores({ 
        keyword: kw, funnel: 'fundo', hasLocation: true, hasProblem: false, 
        isQuestion: false, hasCompetitorGap: true, gapScore: 85 
      });
      addKw({ cluster: 'sofa', keyword: kw, funnel_stage: 'fundo', intent: 'local', city: cidade, ...scores });
    }
  }

  // ======= PERGUNTAS REAIS (Question-Based) =======
  const objetos = ['sofá', 'colchão', 'poltrona', 'tapete', 'estofado'];
  for (const objeto of objetos) {
    const perguntas = [
      `como limpar ${objeto} sem molhar`,
      `${objeto} pode estragar com limpeza`,
      `quanto tempo demora secagem ${objeto}`,
      `limpeza de ${objeto} é segura`,
      `qual o melhor produto para limpar ${objeto}`,
      `dá para limpar ${objeto} em casa`,
      `limpeza profissional de ${objeto} vale a pena`,
      `como escolher empresa limpeza ${objeto}`,
      `${objeto} com mofo tem solução`,
      `como secar ${objeto} rápido`,
      `limpeza de ${objeto} estraga`,
    ];

    for (const kw of perguntas) {
      const cluster = objeto === 'sofá' ? 'sofa' : objeto === 'colchão' ? 'colchao' : 'outros';
      const scores = calculateAdvancedScores({ 
        keyword: kw, funnel: 'topo', hasLocation: false, hasProblem: kw.includes('mofo'), 
        isQuestion: true, hasCompetitorGap: true, gapScore: 75 
      });
      addKw({ cluster, keyword: kw, funnel_stage: 'topo', intent: 'question', ...scores });
    }
  }

  // ======= TRENDING TOPICS =======
  for (const trend of TRENDING_TOPICS) {
    const scores = calculateAdvancedScores({ 
      keyword: trend.termo, funnel: 'topo', hasLocation: false, hasProblem: true, 
      isQuestion: false, hasCompetitorGap: false, trendScore: trend.trend_score 
    });
    addKw({ 
      cluster: 'outros', keyword: trend.termo, funnel_stage: 'topo', 
      intent: 'trending', ...scores 
    });
  }

  // ======= "PERTO DE MIM" KEYWORDS =======
  for (const objeto of ['sofá', 'colchão', 'estofados', 'poltrona']) {
    const pertoKws = [
      `limpeza de ${objeto} perto de mim`,
      `empresa limpeza ${objeto} perto`,
      `higienização de ${objeto} perto de mim`,
    ];

    for (const kw of pertoKws) {
      const cluster = objeto === 'sofá' ? 'sofa' : objeto === 'colchão' ? 'colchao' : 'outros';
      const scores = calculateAdvancedScores({ 
        keyword: kw, funnel: 'fundo', hasLocation: true, hasProblem: false, 
        isQuestion: false, hasCompetitorGap: true, gapScore: 88 
      });
      addKw({ cluster, keyword: kw, funnel_stage: 'fundo', intent: 'local', ...scores });
    }
  }

  return keywords;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('[blog-seed-keywords] 🚀 Iniciando SEO Intelligence System...');

    // Buscar serviços reais do banco
    const { data: servicos, error: servicosError } = await supabase
      .from('servicos')
      .select('subcategoria, item, preco_limpeza, preco_impermeabilizacao')
      .not('preco_limpeza', 'is', null);
    
    if (servicosError) {
      console.error('[blog-seed-keywords] Erro ao buscar serviços:', servicosError);
    }

    // Mapear serviços para clusters
    const servicosPorCluster: Record<string, Set<string>> = {
      sofa: new Set(), colchao: new Set(), poltrona: new Set(), cadeira: new Set(),
      tapete: new Set(), carro: new Set(), bebe: new Set(), aluguel: new Set(), outros: new Set(),
    };

    if (servicos) {
      for (const servico of servicos) {
        const cluster = CLUSTER_MAP[servico.subcategoria?.toUpperCase()] || 'outros';
        servicosPorCluster[cluster].add(servico.item);
      }
    }

    console.log('[blog-seed-keywords] 📊 Serviços mapeados:', 
      Object.entries(servicosPorCluster).map(([k, v]) => `${k}: ${v.size}`).join(', '));

    // Verificar keywords existentes
    const { data: existingKeywords } = await supabase
      .from('blog_keywords_bank')
      .select('keyword');
    
    const existingSet = new Set<string>();
    if (existingKeywords) {
      existingKeywords.forEach(k => existingSet.add(k.keyword.toLowerCase()));
    }
    console.log('[blog-seed-keywords] 📝 Keywords existentes:', existingSet.size);

    // Gerar todas as keywords
    const allKeywords = generateAllKeywords(servicosPorCluster);
    
    // Filtrar duplicatas existentes
    const newKeywords = allKeywords.filter(k => !existingSet.has(k.keyword.toLowerCase()));
    
    console.log('[blog-seed-keywords] ✨ Keywords geradas:', allKeywords.length);
    console.log('[blog-seed-keywords] 🆕 Keywords novas:', newKeywords.length);

    // Inserir em batches
    let inserted = 0;
    const batchSize = 500;
    for (let i = 0; i < newKeywords.length; i += batchSize) {
      const batch = newKeywords.slice(i, i + batchSize);
      const { error } = await supabase.from('blog_keywords_bank').insert(batch);
      if (error) {
        console.error('[blog-seed-keywords] ❌ Erro no batch:', i, error.message);
      } else {
        inserted += batch.length;
        console.log(`[blog-seed-keywords] ✅ Batch ${Math.floor(i/batchSize)+1}: ${batch.length} inseridas`);
      }
    }

    // Estatísticas finais
    const stats = {
      topo: newKeywords.filter(k => k.funnel_stage === 'topo').length,
      meio: newKeywords.filter(k => k.funnel_stage === 'meio').length,
      fundo: newKeywords.filter(k => k.funnel_stage === 'fundo').length,
      local: newKeywords.filter(k => k.city).length,
      bairros: newKeywords.filter(k => k.bairro).length,
      questions: newKeywords.filter(k => k.intent === 'question').length,
      trending: newKeywords.filter(k => k.intent === 'trending').length,
      highOpportunity: newKeywords.filter(k => k.opportunity_score >= 80).length,
      lowDifficulty: newKeywords.filter(k => k.difficulty_score <= 30).length,
    };

    console.log('[blog-seed-keywords] 📊 Estatísticas:', JSON.stringify(stats, null, 2));

    return new Response(JSON.stringify({ 
      success: true, 
      inserted, 
      total_generated: allKeywords.length,
      new_keywords: newKeywords.length,
      stats,
      message: `${inserted} keywords SEO geradas com sucesso!`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[blog-seed-keywords] ❌ Erro:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
