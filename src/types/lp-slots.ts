import { z } from 'zod';

// ============================================
// Schema de Copy por Slots para LP-12D
// ============================================

export const LP12DCopySchema = z.object({
  // HERO SECTION
  hero: z.object({
    badge: z.string().optional(),
    title: z.string(),
    subtitle: z.string(),
    cta: z.object({
      primaryLabel: z.string(),
      secondaryLabel: z.string().optional(),
    }),
  }),
  
  // STORY/PROBLEM SECTION
  story: z.object({
    title: z.string(),
    paragraphs: z.array(z.string()),
    highlight: z.string().optional(),
  }),
  
  // SOLUTION/BENEFITS GARDEN
  garden: z.object({
    title: z.string(),
    subtitle: z.string(),
    bulletsLeft: z.array(z.string()),
    bulletsRight: z.array(z.string()),
  }),
  
  // MARQUEE TEXT
  marquee: z.object({
    text: z.string(),
  }).optional(),
  
  // TESTIMONIALS
  testimonials: z.object({
    title: z.string(),
    items: z.array(z.object({
      name: z.string(),
      text: z.string(),
      role: z.string().optional(),
    })),
  }),
  
  // TARGET AUDIENCE (FOR YOU / NOT FOR YOU)
  targetAudience: z.object({
    title: z.string(),
    forYou: z.object({
      title: z.string(),
      items: z.array(z.string()),
    }),
    notForYou: z.object({
      title: z.string(),
      items: z.array(z.string()),
    }),
  }),
  
  // PRICING
  pricing: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    priceText: z.string(),
    originalPrice: z.string().optional(),
    installmentsText: z.string().optional(),
    ctaLabel: z.string(),
    guarantee: z.object({
      title: z.string(),
      text: z.string(),
      days: z.string(),
    }).optional(),
  }),
  
  // BIO / SPECIALIST
  bio: z.object({
    name: z.string(),
    role: z.string().optional(),
    paragraphs: z.array(z.string()),
    credentials: z.array(z.string()).optional(),
  }),
  
  // FAQ
  faq: z.object({
    title: z.string(),
    items: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })),
  }),
  
  // FOOTER
  footer: z.object({
    smallPrint: z.string(),
    copyright: z.string().optional(),
  }),
  
  // META SEO
  meta: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export type LP12DCopy = z.infer<typeof LP12DCopySchema>;

// ============================================
// Schema de Copy por Slots para LP-TEODORO
// ============================================

export const LPTeodoroCopySchema = z.object({
  // HERO
  hero: z.object({
    badge: z.string().optional(),
    title: z.string(),
    subtitle: z.string(),
    cta: z.object({
      primaryLabel: z.string(),
      secondaryLabel: z.string().optional(),
    }),
  }),
  
  // ABOUT PROBLEM
  aboutProblem: z.object({
    title: z.string(),
    paragraphs: z.array(z.string()),
    highlight: z.string().optional(),
  }),
  
  // TARGET PROFILES
  profiles: z.object({
    items: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
  }),
  
  // PAIN POINTS AND SOLUTIONS
  painPoints: z.object({
    items: z.array(z.object({
      title: z.string(),
      problem: z.string(),
      solution: z.string(),
    })),
  }),
  
  // BENEFITS / DIFFERENTIALS
  benefits: z.object({
    items: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
  }),
  
  // SPECIALIST / COMPANY
  specialist: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    paragraphs: z.array(z.string()),
    credentials: z.array(z.string()).optional(),
  }),
  
  // PRICING
  pricing: z.object({
    title: z.string().optional(),
    priceText: z.string(),
    originalPrice: z.string().optional(),
    ctaLabel: z.string(),
    guarantee: z.object({
      title: z.string(),
      text: z.string(),
      days: z.string(),
    }).optional(),
  }),
  
  // TESTIMONIALS
  testimonials: z.object({
    title: z.string(),
    enabled: z.boolean().optional(),
  }),
  
  // FAQ
  faq: z.object({
    items: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })),
  }),
  
  // FINAL CTA
  finalCta: z.object({
    headline: z.string(),
    ctaLabel: z.string(),
    subtext: z.string().optional(),
  }),
  
  // META SEO
  meta: z.object({
    title: z.string(),
    description: z.string(),
  }),
  
  // EXTRAS
  extras: z.object({
    urgencyText: z.string().optional(),
    socialProofText: z.string().optional(),
  }).optional(),
});

export type LPTeodoroCopy = z.infer<typeof LPTeodoroCopySchema>;

// ============================================
// Type Mapping for Templates
// ============================================

export type TemplateSlots = {
  'lp-12d': LP12DCopy;
  'lp-teodoro': LPTeodoroCopy;
};

export type TemplateType = keyof TemplateSlots;

// Helper to check if copy is new slot-based format
export function isSlotBasedCopy(copy: unknown): copy is LP12DCopy | LPTeodoroCopy {
  return typeof copy === 'object' && copy !== null && 'hero' in copy;
}

// Default fallback copy for LP-12D
export const defaultLP12DCopy: LP12DCopy = {
  hero: {
    badge: 'Vagas Limitadas',
    title: 'Transforme seu ambiente hoje',
    subtitle: 'Serviço profissional com resultados garantidos',
    cta: {
      primaryLabel: 'Quero Saber Mais',
    },
  },
  story: {
    title: 'O problema que você conhece bem',
    paragraphs: [
      'Você já tentou resolver sozinho mas o resultado nunca é o que espera.',
      'A verdade é que sem as técnicas certas, o problema só se acumula.',
    ],
    highlight: 'Mas existe uma solução.',
  },
  garden: {
    title: 'O que você vai receber',
    subtitle: 'Benefícios exclusivos',
    bulletsLeft: [
      'Resultado profissional garantido',
      'Técnicas de ponta',
      'Atendimento personalizado',
    ],
    bulletsRight: [
      'Produtos de qualidade',
      'Suporte completo',
      'Satisfação garantida',
    ],
  },
  marquee: {
    text: 'Serviço Profissional',
  },
  testimonials: {
    title: 'O que nossos clientes dizem',
    items: [
      { name: 'Maria S.', text: 'Superou minhas expectativas!' },
      { name: 'João P.', text: 'Recomendo a todos.' },
      { name: 'Ana L.', text: 'Profissionais excelentes.' },
    ],
  },
  targetAudience: {
    title: 'Este serviço é para você?',
    forYou: {
      title: 'É para você se:',
      items: [
        'Busca qualidade e profissionalismo',
        'Valoriza resultados duradouros',
        'Quer praticidade',
      ],
    },
    notForYou: {
      title: 'NÃO é para você se:',
      items: [
        'Busca apenas o menor preço',
        'Não valoriza qualidade',
      ],
    },
  },
  pricing: {
    title: 'Investimento',
    priceText: 'Consulte',
    ctaLabel: 'Quero Contratar',
    guarantee: {
      title: 'Garantia Total',
      text: 'Satisfação garantida ou seu dinheiro de volta',
      days: '7 dias',
    },
  },
  bio: {
    name: 'Especialista',
    paragraphs: [
      'Com anos de experiência no mercado, oferecemos o melhor serviço da região.',
    ],
    credentials: [
      'Mais de 1000 clientes atendidos',
      'Equipe certificada',
    ],
  },
  faq: {
    title: 'Perguntas Frequentes',
    items: [
      { q: 'Como funciona o serviço?', a: 'Agende online e nós cuidamos de tudo.' },
      { q: 'Qual a garantia?', a: '7 dias de garantia total.' },
    ],
  },
  footer: {
    smallPrint: 'Todos os direitos reservados.',
  },
  meta: {
    title: 'Serviço Profissional',
    description: 'Transforme seu ambiente com nosso serviço profissional.',
  },
};
