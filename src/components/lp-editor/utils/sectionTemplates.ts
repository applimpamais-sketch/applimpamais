import type { LPSection, LPRow, LPColumn, LPElement } from '@/types/lp-document';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
};

// Default element creators
export const createHeadingElement = (text = 'Título', level: 'h1' | 'h2' | 'h3' | 'h4' = 'h2'): LPElement => ({
  id: generateId(),
  type: 'heading',
  visible: true,
  props: { text, level, useGradient: false },
  style: { textAlign: 'left' },
});

export const createTextElement = (content = 'Texto aqui...'): LPElement => ({
  id: generateId(),
  type: 'text',
  visible: true,
  props: { content },
  style: { textAlign: 'left' },
});

export const createImageElement = (src = '', alt = 'Imagem'): LPElement => ({
  id: generateId(),
  type: 'image',
  visible: true,
  props: { src, alt, objectFit: 'cover', rounded: 'lg' },
});

export const createButtonElement = (label = 'Clique Aqui', variant: 'primary' | 'secondary' | 'outline' = 'primary'): LPElement => ({
  id: generateId(),
  type: 'button',
  visible: true,
  props: { label, variant, size: 'lg' },
});

export const createSpacerElement = (height: 'sm' | 'md' | 'lg' | 'xl' = 'md'): LPElement => ({
  id: generateId(),
  type: 'spacer',
  visible: true,
  props: { height },
});

export const createBadgeElement = (badgeText = 'Novo'): LPElement => ({
  id: generateId(),
  type: 'badge',
  visible: true,
  props: { badgeText },
});

export const createListElement = (items: string[] = ['Item 1', 'Item 2', 'Item 3'], listIcon: 'check' | 'x' | 'arrow' | 'bullet' = 'check'): LPElement => ({
  id: generateId(),
  type: 'list',
  visible: true,
  props: { items, listIcon },
});

export const createVideoElement = (videoUrl = ''): LPElement => ({
  id: generateId(),
  type: 'video',
  visible: true,
  props: { videoUrl, poster: '' },
});

export const createFaqElement = (): LPElement => ({
  id: generateId(),
  type: 'faq-accordion',
  visible: true,
  props: {
    faqItems: [
      { q: 'Pergunta 1?', a: 'Resposta 1...' },
      { q: 'Pergunta 2?', a: 'Resposta 2...' },
    ],
  },
});

export const createTestimonialElement = (): LPElement => ({
  id: generateId(),
  type: 'testimonial-card',
  visible: true,
  props: {
    testimonial: {
      name: 'Maria Silva',
      text: 'Depoimento incrível sobre o serviço...',
      role: 'Cliente',
    },
  },
});

// Section templates library
export type SectionTemplateKey = 
  | 'hero-2-col'
  | 'hero-video-centered'
  | 'problem'
  | 'benefits-grid'
  | 'solution-preview'
  | 'timeline-days'
  | 'bonus-grid'
  | 'testimonials-grid'
  | 'testimonials-6-grid'
  | 'pricing-single'
  | 'pricing-complete'
  | 'bio-horizontal'
  | 'cta-centered'
  | 'cta-middle'
  | 'marquee-animated'
  | 'faq-accordion'
  | 'footer-simple'
  | 'custom-empty';

export const sectionLibrary: Record<SectionTemplateKey, Omit<LPSection, 'id'>> = {
  // Hero 2 columns
  'hero-2-col': {
    type: 'hero',
    name: 'Hero',
    visible: true,
    style: { paddingY: 'xl', background: 'transparent' },
    rows: [{
      id: '',
      columns: [
        {
          id: '',
          width: 6,
          elements: [
            createBadgeElement('✨ Novo'),
            createHeadingElement('Título Principal da Página', 'h1'),
            createTextElement('Subtítulo persuasivo que explica o valor do seu serviço em poucas palavras.'),
            createButtonElement('QUERO COMEÇAR', 'primary'),
          ],
          style: { textAlign: 'left' },
        },
        {
          id: '',
          width: 6,
          elements: [
            createImageElement('', 'Hero Image'),
          ],
        },
      ],
      style: { gap: 'lg', alignItems: 'center' },
    }],
  },

  // Problem section
  'problem': {
    type: 'problem',
    name: 'Problema',
    visible: true,
    style: { paddingY: 'lg', background: 'transparent' },
    rows: [{
      id: '',
      columns: [{
        id: '',
        width: 12,
        elements: [
          createHeadingElement('Você já se sentiu assim?', 'h2'),
          createTextElement('Descreva o problema que seu público enfrenta. Use linguagem empática e mostre que você entende a dor deles.'),
          createListElement([
            'Problema ou frustração 1',
            'Problema ou frustração 2',
            'Problema ou frustração 3',
          ]),
        ],
        style: { textAlign: 'center' },
      }],
    }],
  },

  // Solution / Benefits
  'benefits-grid': {
    type: 'benefits',
    name: 'Benefícios',
    visible: true,
    style: { paddingY: 'lg', background: 'transparent' },
    rows: [{
      id: '',
      columns: [
        {
          id: '',
          width: 6,
          elements: [
            createListElement([
              'Benefício 1',
              'Benefício 2',
              'Benefício 3',
            ]),
          ],
        },
        {
          id: '',
          width: 6,
          elements: [
            createListElement([
              'Benefício 4',
              'Benefício 5',
              'Benefício 6',
            ]),
          ],
        },
      ],
      style: { gap: 'lg' },
    }],
  },

  // Testimonials
  'testimonials-grid': {
    type: 'testimonials',
    name: 'Depoimentos',
    visible: true,
    style: { paddingY: 'lg', background: 'transparent' },
    rows: [{
      id: '',
      columns: [{
        id: '',
        width: 12,
        elements: [
          createHeadingElement('O que dizem nossos clientes', 'h2'),
        ],
        style: { textAlign: 'center' },
      }],
    }, {
      id: '',
      columns: [
        {
          id: '',
          width: 4,
          elements: [createTestimonialElement()],
        },
        {
          id: '',
          width: 4,
          elements: [createTestimonialElement()],
        },
        {
          id: '',
          width: 4,
          elements: [createTestimonialElement()],
        },
      ],
      style: { gap: 'md' },
    }],
  },

  // Pricing
  'pricing-single': {
    type: 'pricing',
    name: 'Preço',
    visible: true,
    style: { paddingY: 'xl', background: 'transparent' },
    rows: [{
      id: '',
      columns: [{
        id: '',
        width: 12,
        elements: [
          createHeadingElement('Investimento', 'h2'),
          {
            id: generateId(),
            type: 'pricing-card',
            visible: true,
            props: {
              price: 'R$ 297',
              originalPrice: 'R$ 497',
              features: ['Acesso vitalício', 'Suporte por 30 dias', 'Certificado'],
            },
          },
          createButtonElement('GARANTIR MINHA VAGA', 'primary'),
        ],
        style: { textAlign: 'center' },
      }],
    }],
  },

  // FAQ
  'faq-accordion': {
    type: 'faq',
    name: 'FAQ',
    visible: true,
    style: { paddingY: 'lg', background: 'transparent' },
    rows: [{
      id: '',
      columns: [{
        id: '',
        width: 12,
        elements: [
          createHeadingElement('Perguntas Frequentes', 'h2'),
          createFaqElement(),
        ],
        style: { textAlign: 'center' },
      }],
    }],
  },

  // Bio
  'bio-horizontal': {
    type: 'bio',
    name: 'Sobre',
    visible: true,
    style: { paddingY: 'lg', background: 'transparent' },
    rows: [{
      id: '',
      columns: [
        {
          id: '',
          width: 4,
          elements: [
            createImageElement('', 'Foto do especialista'),
          ],
        },
        {
          id: '',
          width: 8,
          elements: [
            createHeadingElement('Sobre o Especialista', 'h2'),
            {
              id: generateId(),
              type: 'bio-card',
              visible: true,
              props: {
                name: 'Nome do Especialista',
                role: 'Título / Profissão',
                description: 'Breve biografia explicando sua experiência e credenciais...',
              },
            },
          ],
        },
      ],
      style: { gap: 'lg', alignItems: 'center' },
    }],
  },

  // CTA Final
  'cta-centered': {
    type: 'cta-final',
    name: 'CTA Final',
    visible: true,
    style: { paddingY: 'xl', background: 'transparent' },
    rows: [{
      id: '',
      columns: [{
        id: '',
        width: 12,
        elements: [
          createHeadingElement('Pronto para Transformar sua Vida?', 'h2'),
          createTextElement('Última chance de garantir sua vaga com condições especiais.'),
          createButtonElement('SIM, QUERO COMEÇAR AGORA', 'primary'),
        ],
        style: { textAlign: 'center' },
      }],
    }],
  },

  // Footer
  'footer-simple': {
    type: 'footer',
    name: 'Rodapé',
    visible: true,
    style: { paddingY: 'md', background: 'transparent' },
    rows: [{
      id: '',
      columns: [{
        id: '',
        width: 12,
        elements: [
          createTextElement('© 2024 Todos os direitos reservados. Termos de Uso | Política de Privacidade'),
        ],
        style: { textAlign: 'center' },
      }],
    }],
  },

  // Custom / Empty
  'custom-empty': {
    type: 'custom',
    name: 'Seção Personalizada',
    visible: true,
    style: { paddingY: 'lg', background: 'transparent' },
    rows: [{
      id: '',
      columns: [{
        id: '',
        width: 12,
        elements: [],
      }],
    }],
  },

  // =========================================================
  // NOVOS TEMPLATES LP-12D
  // =========================================================

  // Hero com vídeo centralizado
  'hero-video-centered': {
    type: 'hero',
    name: 'Hero com Vídeo',
    visible: true,
    style: { paddingY: 'xl', background: 'transparent' },
    rows: [
      {
        id: '',
        columns: [{
          id: '',
          width: 12,
          elements: [
            createBadgeElement('🔥 VAGAS LIMITADAS'),
            createHeadingElement('Título Principal da Página', 'h1'),
            createTextElement('Subtítulo persuasivo explicando a transformação'),
          ],
          style: { textAlign: 'center' },
        }],
      },
      {
        id: '',
        columns: [{
          id: '',
          width: 12,
          elements: [
            createVideoElement(''),
          ],
          style: { textAlign: 'center' },
        }],
        style: { gap: 'lg' },
      },
      {
        id: '',
        columns: [{
          id: '',
          width: 12,
          elements: [
            createButtonElement('QUERO PARTICIPAR', 'primary'),
          ],
          style: { textAlign: 'center' },
        }],
      },
    ],
  },

  // Solution Preview
  'solution-preview': {
    type: 'solution',
    name: 'O Que Você Vai Aprender',
    visible: true,
    style: { paddingY: 'xl', background: 'transparent' },
    rows: [
      {
        id: '',
        columns: [{
          id: '',
          width: 12,
          elements: [
            createHeadingElement('O Que Você Vai Aprender', 'h2'),
          ],
          style: { textAlign: 'center' },
        }],
      },
      {
        id: '',
        columns: [
          {
            id: '',
            width: 5,
            elements: [createImageElement('', 'Preview')],
          },
          {
            id: '',
            width: 7,
            elements: [
              createListElement([
                'Módulo 1: Fundamentos',
                'Módulo 2: Estratégias',
                'Módulo 3: Aplicação',
                'Módulo 4: Resultados',
              ]),
            ],
          },
        ],
        style: { gap: 'lg', alignItems: 'center' },
      },
    ],
  },

  // Timeline de Dias
  'timeline-days': {
    type: 'benefits',
    name: 'Cronograma/Dias',
    visible: true,
    style: { paddingY: 'xl', background: 'transparent' },
    rows: [
      {
        id: '',
        columns: [{
          id: '',
          width: 12,
          elements: [
            createHeadingElement('Sua Jornada de Transformação', 'h2'),
          ],
          style: { textAlign: 'center' },
        }],
      },
      {
        id: '',
        columns: [
          { id: '', width: 4, elements: [createImageElement('', 'Dia 1')] },
          { id: '', width: 8, elements: [
            createBadgeElement('DIA 01'),
            createHeadingElement('Preparação', 'h3'),
            createTextElement('Descrição do que acontece neste dia'),
          ]},
        ],
        style: { gap: 'lg', alignItems: 'center' },
      },
      {
        id: '',
        columns: [
          { id: '', width: 4, elements: [createImageElement('', 'Dia 2')] },
          { id: '', width: 8, elements: [
            createBadgeElement('DIA 02'),
            createHeadingElement('Ação', 'h3'),
            createTextElement('Descrição do que acontece neste dia'),
          ]},
        ],
        style: { gap: 'lg', alignItems: 'center' },
      },
    ],
  },

  // Grid de Bônus
  'bonus-grid': {
    type: 'benefits',
    name: 'Bônus',
    visible: true,
    style: { paddingY: 'xl', background: 'transparent' },
    rows: [
      {
        id: '',
        columns: [{
          id: '',
          width: 12,
          elements: [
            createHeadingElement('🎁 Bônus Especiais', 'h2'),
          ],
          style: { textAlign: 'center' },
        }],
      },
      {
        id: '',
        columns: [
          {
            id: '',
            width: 4,
            elements: [
              createImageElement('', 'Bônus 1'),
              createHeadingElement('Bônus 1', 'h4'),
              createTextElement('Descrição do bônus'),
            ],
            style: { textAlign: 'center' },
          },
          {
            id: '',
            width: 4,
            elements: [
              createImageElement('', 'Bônus 2'),
              createHeadingElement('Bônus 2', 'h4'),
              createTextElement('Descrição do bônus'),
            ],
            style: { textAlign: 'center' },
          },
          {
            id: '',
            width: 4,
            elements: [
              createImageElement('', 'Bônus 3'),
              createHeadingElement('Bônus 3', 'h4'),
              createTextElement('Descrição do bônus'),
            ],
            style: { textAlign: 'center' },
          },
        ],
        style: { gap: 'lg' },
      },
    ],
  },

  // CTA Intermediário
  'cta-middle': {
    type: 'cta-final',
    name: 'CTA Intermediário',
    visible: true,
    style: { paddingY: 'lg', background: 'transparent' },
    rows: [{
      id: '',
      columns: [{
        id: '',
        width: 12,
        elements: [
          createButtonElement('GARANTIR MINHA VAGA', 'primary'),
        ],
        style: { textAlign: 'center' },
      }],
    }],
  },

  // Marquee Animado
  'marquee-animated': {
    type: 'marquee',
    name: 'Marquee',
    visible: true,
    style: { paddingY: 'sm', background: 'transparent' },
    rows: [{
      id: '',
      columns: [{
        id: '',
        width: 12,
        elements: [
          createTextElement('⭐ RESULTADOS COMPROVADOS ⭐ MÉTODO EXCLUSIVO ⭐ SUPORTE COMPLETO ⭐'),
        ],
        style: { textAlign: 'center' },
      }],
    }],
  },

  // Testimonials 6 Grid (3x2)
  'testimonials-6-grid': {
    type: 'testimonials',
    name: 'Depoimentos 3x2',
    visible: true,
    style: { paddingY: 'xl', background: 'transparent' },
    rows: [
      {
        id: '',
        columns: [{
          id: '',
          width: 12,
          elements: [createHeadingElement('O Que Dizem Nossos Alunos', 'h2')],
          style: { textAlign: 'center' },
        }],
      },
      {
        id: '',
        columns: [
          { id: '', width: 4, elements: [createTestimonialElement()] },
          { id: '', width: 4, elements: [createTestimonialElement()] },
          { id: '', width: 4, elements: [createTestimonialElement()] },
        ],
        style: { gap: 'md' },
      },
      {
        id: '',
        columns: [
          { id: '', width: 4, elements: [createTestimonialElement()] },
          { id: '', width: 4, elements: [createTestimonialElement()] },
          { id: '', width: 4, elements: [createTestimonialElement()] },
        ],
        style: { gap: 'md' },
      },
    ],
  },

  // Pricing Completo com Mockup
  'pricing-complete': {
    type: 'pricing',
    name: 'Preço Completo',
    visible: true,
    style: { paddingY: 'xl', background: 'transparent' },
    rows: [
      {
        id: '',
        columns: [{
          id: '',
          width: 12,
          elements: [createHeadingElement('Investimento', 'h2')],
          style: { textAlign: 'center' },
        }],
      },
      {
        id: '',
        columns: [
          {
            id: '',
            width: 5,
            elements: [createImageElement('', 'Mockup do produto')],
          },
          {
            id: '',
            width: 7,
            elements: [
              createListElement([
                '✅ Acesso completo',
                '✅ Bônus 1',
                '✅ Bônus 2',
                '✅ Suporte',
              ]),
              {
                id: generateId(),
                type: 'pricing-card',
                visible: true,
                props: {
                  price: 'R$ 297',
                  originalPrice: 'R$ 997',
                  features: ['Pagamento único', '7 dias de garantia'],
                },
              },
              createButtonElement('QUERO COMEÇAR AGORA', 'primary'),
            ],
          },
        ],
        style: { gap: 'lg', alignItems: 'center' },
      },
    ],
  },
};

// Get section with generated IDs
export const createSectionFromTemplate = (templateKey: string): LPSection | null => {
  const template = sectionLibrary[templateKey];
  if (!template) return null;

  const section: LPSection = {
    ...template,
    id: generateId(),
    rows: template.rows.map(row => ({
      ...row,
      id: generateId(),
      columns: row.columns.map(col => ({
        ...col,
        id: generateId(),
        elements: col.elements.map(el => ({
          ...el,
          id: generateId(),
        })),
      })),
    })),
  };

  return section;
};

// Section type labels
export const sectionTypeLabels: Record<string, string> = {
  hero: 'Hero',
  problem: 'Problema',
  solution: 'Solução',
  benefits: 'Benefícios',
  testimonials: 'Depoimentos',
  'target-audience': 'Público-alvo',
  pricing: 'Preço',
  bio: 'Bio',
  faq: 'FAQ',
  'cta-final': 'CTA Final',
  footer: 'Rodapé',
  marquee: 'Marquee',
  custom: 'Personalizado',
};

// Element type labels
export const elementTypeLabels: Record<string, string> = {
  heading: 'Título',
  text: 'Texto',
  image: 'Imagem',
  button: 'Botão',
  list: 'Lista',
  'faq-accordion': 'FAQ',
  'testimonial-card': 'Depoimento',
  'pricing-card': 'Preço',
  'bio-card': 'Bio',
  icon: 'Ícone',
  spacer: 'Espaço',
  divider: 'Divisor',
  video: 'Vídeo',
  countdown: 'Contador',
  badge: 'Badge',
};
