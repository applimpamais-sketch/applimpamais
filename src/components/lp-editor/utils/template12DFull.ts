import type { LandingPageDocument, LPSection, LPRow, LPColumn, LPElement } from '@/types/lp-document';

// Generate unique ID
const generateId = (): string => {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// ELEMENT CREATORS
// ============================================================================

const createElement = (
  type: LPElement['type'],
  props: LPElement['props'],
  style?: LPElement['style']
): LPElement => ({
  id: generateId(),
  type,
  visible: true,
  props,
  style,
});

// ============================================================================
// SECTION 1: HERO WITH VIDEO
// ============================================================================
function createHero12D(): LPSection {
  return {
    id: generateId(),
    type: 'hero',
    name: 'Hero',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'lg' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('badge', { badgeText: '🔥 VAGAS LIMITADAS' }),
              createElement('heading', { 
                text: 'Título Principal que Captura Atenção', 
                level: 'h1', 
                useGradient: true 
              }, { textAlign: 'center' }),
              createElement('text', { 
                content: 'Subtítulo persuasivo que explica a transformação que você oferece em uma frase impactante.' 
              }, { textAlign: 'center' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('video', { videoUrl: '', poster: '' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
        style: { gap: 'lg' },
      },
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('button', { 
                label: 'QUERO PARTICIPAR AGORA', 
                variant: 'primary', 
                size: 'lg' 
              }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
    ],
  };
}

// ============================================================================
// SECTION 2: STORY / PROBLEMA EMOCIONAL
// ============================================================================
function createStorySection(): LPSection {
  return {
    id: generateId(),
    type: 'problem',
    name: 'História/Problema',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'md' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('heading', { 
                text: 'Você já se sentiu assim?', 
                level: 'h2' 
              }, { textAlign: 'center' }),
              createElement('text', { 
                content: 'Descreva aqui a dor do seu público. Use linguagem empática que faça a pessoa se identificar. Fale sobre frustrações, tentativas que não funcionaram, e o sentimento de estar preso em um ciclo sem saída.' 
              }, { textAlign: 'center' }),
              createElement('spacer', { height: 'md' }),
              createElement('text', { 
                content: '"Eu tentei de tudo, mas nada parecia funcionar..."' 
              }, { textAlign: 'center', fontWeight: 'semibold' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
    ],
  };
}

// ============================================================================
// SECTION 3: SOLUTION PREVIEW (O que você vai aprender)
// ============================================================================
function createSolutionPreview(): LPSection {
  return {
    id: generateId(),
    type: 'solution',
    name: 'O Que Você Vai Aprender',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'lg' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('heading', { 
                text: 'O Que Você Vai Aprender', 
                level: 'h2' 
              }, { textAlign: 'center' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 5,
            elements: [
              createElement('image', { src: '', alt: 'Preview do conteúdo', rounded: 'xl' }),
            ],
          },
          {
            id: generateId(),
            width: 7,
            elements: [
              createElement('list', { 
                items: [
                  'Módulo 1: Fundamentos essenciais',
                  'Módulo 2: Estratégias avançadas',
                  'Módulo 3: Aplicação prática',
                  'Módulo 4: Resultados acelerados',
                  'Módulo 5: Manutenção do sucesso',
                ],
                listIcon: 'check',
              }),
            ],
          },
        ],
        style: { gap: 'lg', alignItems: 'center' },
      },
    ],
  };
}

// ============================================================================
// SECTION 4: TIMELINE DOS DIAS/MÓDULOS
// ============================================================================
function createTimelineSection(): LPSection {
  const days = [
    { day: 'DIA 01', title: 'Preparação', desc: 'Descrição do que acontece neste dia' },
    { day: 'DIA 02', title: 'Ação', desc: 'Descrição do que acontece neste dia' },
    { day: 'DIA 03', title: 'Evolução', desc: 'Descrição do que acontece neste dia' },
    { day: 'DIA 04', title: 'Consolidação', desc: 'Descrição do que acontece neste dia' },
    { day: 'DIA 05', title: 'Transformação', desc: 'Descrição do que acontece neste dia' },
  ];

  return {
    id: generateId(),
    type: 'benefits',
    name: 'Cronograma',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'xl' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('heading', { 
                text: 'Sua Jornada de Transformação', 
                level: 'h2' 
              }, { textAlign: 'center' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
      ...days.map((item, index) => ({
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 4 as const,
            elements: [
              createElement('image', { src: '', alt: `Imagem ${item.day}`, rounded: 'lg' }),
            ],
          },
          {
            id: generateId(),
            width: 8 as const,
            elements: [
              createElement('badge', { badgeText: item.day }),
              createElement('heading', { text: item.title, level: 'h3' }),
              createElement('text', { content: item.desc }),
            ],
          },
        ],
        style: { gap: 'lg' as const, alignItems: 'center' as const, reverseOnMobile: index % 2 === 1 },
      })),
    ],
  };
}

// ============================================================================
// SECTION 5: BÔNUS ESPECIAIS
// ============================================================================
function createBonusSection(): LPSection {
  return {
    id: generateId(),
    type: 'benefits',
    name: 'Bônus',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'lg' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('heading', { 
                text: '🎁 Bônus Especiais', 
                level: 'h2' 
              }, { textAlign: 'center' }),
              createElement('text', { 
                content: 'Além de todo o conteúdo, você ainda recebe:' 
              }, { textAlign: 'center' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 4,
            elements: [
              createElement('image', { src: '', alt: 'Bônus 1', rounded: 'lg' }),
              createElement('heading', { text: 'Bônus 1', level: 'h4' }),
              createElement('text', { content: 'Descrição do bônus e seu valor' }),
            ],
            style: { textAlign: 'center' },
          },
          {
            id: generateId(),
            width: 4,
            elements: [
              createElement('image', { src: '', alt: 'Bônus 2', rounded: 'lg' }),
              createElement('heading', { text: 'Bônus 2', level: 'h4' }),
              createElement('text', { content: 'Descrição do bônus e seu valor' }),
            ],
            style: { textAlign: 'center' },
          },
          {
            id: generateId(),
            width: 4,
            elements: [
              createElement('image', { src: '', alt: 'Bônus 3', rounded: 'lg' }),
              createElement('heading', { text: 'Bônus 3', level: 'h4' }),
              createElement('text', { content: 'Descrição do bônus e seu valor' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
        style: { gap: 'lg' },
      },
    ],
  };
}

// ============================================================================
// SECTION 6: CTA INTERMEDIÁRIO
// ============================================================================
function createCtaMiddle(): LPSection {
  return {
    id: generateId(),
    type: 'cta-final',
    name: 'CTA Intermediário',
    visible: true,
    style: { paddingY: 'lg', maxWidth: 'md' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('button', { 
                label: 'QUERO GARANTIR MINHA VAGA', 
                variant: 'primary', 
                size: 'lg' 
              }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
    ],
  };
}

// ============================================================================
// SECTION 7: MARQUEE
// ============================================================================
function createMarqueeSection(): LPSection {
  return {
    id: generateId(),
    type: 'marquee',
    name: 'Marquee',
    visible: true,
    style: { paddingY: 'sm', maxWidth: 'full' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('text', { 
                content: '⭐ TRANSFORMAÇÃO GARANTIDA ⭐ RESULTADOS COMPROVADOS ⭐ MÉTODO EXCLUSIVO ⭐ SUPORTE COMPLETO ⭐' 
              }, { textAlign: 'center', fontWeight: 'bold' }),
            ],
          },
        ],
      },
    ],
  };
}

// ============================================================================
// SECTION 8: BIO / ESPECIALISTA
// ============================================================================
function createBioSection(): LPSection {
  return {
    id: generateId(),
    type: 'bio',
    name: 'Especialista',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'lg' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('heading', { 
                text: 'Quem Vai Te Guiar', 
                level: 'h2' 
              }, { textAlign: 'center' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 4,
            elements: [
              createElement('image', { src: '', alt: 'Foto do especialista', rounded: 'xl' }),
            ],
          },
          {
            id: generateId(),
            width: 8,
            elements: [
              createElement('bio-card', { 
                name: 'Nome do Especialista',
                role: 'Título Profissional',
                description: 'Breve biografia explicando sua experiência, credenciais e por que você é a pessoa certa para guiar essa transformação. Mencione resultados, anos de experiência, número de alunos transformados, etc.',
              }),
              createElement('button', { 
                label: 'QUERO APRENDER COM VOCÊ', 
                variant: 'primary', 
                size: 'lg' 
              }),
            ],
          },
        ],
        style: { gap: 'lg', alignItems: 'center' },
      },
    ],
  };
}

// ============================================================================
// SECTION 9: TESTIMONIALS GRID 3x2
// ============================================================================
function createTestimonialsGrid(): LPSection {
  const createTestimonial = (name: string) => createElement('testimonial-card', {
    testimonial: {
      name,
      text: 'Depoimento inspirador sobre os resultados obtidos...',
      role: 'Resultado obtido',
      avatar: '',
    },
  });

  return {
    id: generateId(),
    type: 'testimonials',
    name: 'Depoimentos',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'xl' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('heading', { 
                text: 'O Que Dizem Nossos Alunos', 
                level: 'h2' 
              }, { textAlign: 'center' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
      {
        id: generateId(),
        columns: [
          { id: generateId(), width: 4, elements: [createTestimonial('Maria S.')] },
          { id: generateId(), width: 4, elements: [createTestimonial('João P.')] },
          { id: generateId(), width: 4, elements: [createTestimonial('Ana L.')] },
        ],
        style: { gap: 'md' },
      },
      {
        id: generateId(),
        columns: [
          { id: generateId(), width: 4, elements: [createTestimonial('Carlos M.')] },
          { id: generateId(), width: 4, elements: [createTestimonial('Fernanda R.')] },
          { id: generateId(), width: 4, elements: [createTestimonial('Pedro A.')] },
        ],
        style: { gap: 'md' },
      },
    ],
  };
}

// ============================================================================
// SECTION 10: PRICING COMPLETO
// ============================================================================
function createPricingSection(): LPSection {
  return {
    id: generateId(),
    type: 'pricing',
    name: 'Investimento',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'md' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('heading', { 
                text: 'Investimento', 
                level: 'h2' 
              }, { textAlign: 'center' }),
              createElement('text', { 
                content: 'Tudo o que você vai receber:' 
              }, { textAlign: 'center' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 5,
            elements: [
              createElement('image', { src: '', alt: 'Mockup do produto', rounded: 'xl' }),
            ],
          },
          {
            id: generateId(),
            width: 7,
            elements: [
              createElement('list', { 
                items: [
                  '✅ Acesso completo ao método',
                  '✅ Bônus 1 (valor R$ XX)',
                  '✅ Bônus 2 (valor R$ XX)',
                  '✅ Bônus 3 (valor R$ XX)',
                  '✅ Suporte exclusivo',
                  '✅ Acesso vitalício',
                ],
                listIcon: 'check',
              }),
              createElement('pricing-card', { 
                price: 'R$ 297',
                originalPrice: 'R$ 997',
                features: ['Pagamento único', '7 dias de garantia', 'Acesso imediato'],
              }),
              createElement('button', { 
                label: 'SIM, QUERO COMEÇAR AGORA', 
                variant: 'primary', 
                size: 'lg' 
              }),
            ],
          },
        ],
        style: { gap: 'lg', alignItems: 'center' },
      },
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('text', { 
                content: '🔒 Compra 100% segura. Seus dados estão protegidos.' 
              }, { textAlign: 'center' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
    ],
  };
}

// ============================================================================
// SECTION 11: FAQ
// ============================================================================
function createFaqSection(): LPSection {
  return {
    id: generateId(),
    type: 'faq',
    name: 'FAQ',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'md' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('heading', { 
                text: 'Perguntas Frequentes', 
                level: 'h2' 
              }, { textAlign: 'center' }),
              createElement('faq-accordion', { 
                faqItems: [
                  { q: 'Para quem é esse método?', a: 'Este método é para qualquer pessoa que deseja...' },
                  { q: 'Quanto tempo leva para ver resultados?', a: 'Os primeiros resultados podem ser vistos em...' },
                  { q: 'E se eu não gostar?', a: 'Você tem 7 dias de garantia incondicional...' },
                  { q: 'Como funciona o acesso?', a: 'Após a confirmação do pagamento, você recebe...' },
                  { q: 'Preciso de experiência prévia?', a: 'Não! O método foi desenvolvido para iniciantes...' },
                ],
              }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
    ],
  };
}

// ============================================================================
// SECTION 12: FOOTER
// ============================================================================
function createFooterSection(): LPSection {
  return {
    id: generateId(),
    type: 'footer',
    name: 'Rodapé',
    visible: true,
    style: { paddingY: 'md', maxWidth: 'lg' },
    rows: [
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            width: 12,
            elements: [
              createElement('text', { 
                content: '© 2024 Todos os direitos reservados.' 
              }, { textAlign: 'center' }),
              createElement('text', { 
                content: 'Termos de Uso | Política de Privacidade' 
              }, { textAlign: 'center' }),
            ],
            style: { textAlign: 'center' },
          },
        ],
      },
    ],
  };
}

// ============================================================================
// DOCUMENT GENERATOR
// ============================================================================
export function createLP12DDocument(): LandingPageDocument {
  return {
    template_id: 'lp-12d',
    theme_id: 'feminine_purple',
    meta: {
      title: 'Landing Page - Desafio 12D',
      description: 'Template de alta conversão estilo feminino',
    },
    settings: {
      animations_enabled: true,
      mobile_stack_columns: true,
      cta_destination: 'whatsapp',
    },
    sections: [
      createHero12D(),
      createStorySection(),
      createSolutionPreview(),
      createTimelineSection(),
      createBonusSection(),
      createCtaMiddle(),
      createMarqueeSection(),
      createBioSection(),
      createTestimonialsGrid(),
      createPricingSection(),
      createFaqSection(),
      createFooterSection(),
    ],
  };
}

// Export section creators individually for the section library
export {
  createHero12D,
  createStorySection,
  createSolutionPreview,
  createTimelineSection,
  createBonusSection,
  createCtaMiddle,
  createMarqueeSection,
  createBioSection,
  createTestimonialsGrid,
  createPricingSection,
  createFaqSection,
  createFooterSection,
};
