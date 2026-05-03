import { 
  LandingPageDocument, 
  LPSection, 
  LPRow, 
  LPColumn, 
  LPElement, 
  ElementType,
  SectionType,
  generateId 
} from '@/types/lp-document';
import type { LPThemeId } from '@/styles/lp-css-themes';
import { createLP12DDocument } from './template12DFull';

// ============================================================================
// TYPES FOR LEGACY DATA
// ============================================================================

interface LegacyConfig {
  servico?: {
    id?: string;
    categoria?: string;
    subcategoria?: string;
    preco_limpeza?: number | null;
  };
  precos?: {
    estrategia?: 'sem_preco' | 'com_preco' | 'promocional';
    precoOriginal?: number;
    precoFinal?: number;
    descontoPercent?: number;
  };
  destino_cta?: 'whatsapp' | 'checkout' | 'formulario';
  elementos?: {
    timer?: boolean;
    depoimentos?: boolean;
    garantia?: boolean;
    urgencia?: boolean;
    prova_social?: boolean;
    antesDepois?: boolean;
  };
  theme?: string;
}

interface LegacyCopy {
  headline?: string;
  subheadline?: string;
  badge_urgencia?: string;
  sobre_titulo?: string;
  sobre_texto?: string;
  sobre_destaque?: string;
  perfis_ideais?: Array<{ titulo: string; descricao: string }>;
  dores?: Array<{ titulo: string; problema: string; solucao: string }>;
  beneficios?: string[] | Array<{ titulo: string; descricao: string }>;
  especialista_titulo?: string;
  especialista_subtitulo?: string;
  especialista_texto?: string;
  especialista_credenciais?: string[];
  garantia_titulo?: string;
  garantia_texto?: string;
  garantia_prazo?: string;
  faqs?: Array<{ pergunta: string; resposta: string }>;
  headline_final?: string;
  cta_text?: string;
  cta_subtext?: string;
  urgencia_text?: string;
  prova_social_text?: string;
  meta_title?: string;
  meta_description?: string;
}

interface LegacyLandingPage {
  id: string;
  nome: string;
  slug?: string;
  template_tipo?: 'lp-12d' | 'lp-teodoro' | string;
  config?: LegacyConfig | null;
  copy_gerada?: LegacyCopy | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map legacy theme to new theme ID
 */
function mapThemeId(legacyTheme?: string): LPThemeId {
  const themeMap: Record<string, LPThemeId> = {
    'midnight': 'midnight_pro',
    'feminine': 'feminine_purple',
    'masculine': 'ocean_deep',
    'clean': 'nature_clean',
    'vibrant': 'warm_sunset',
    'nature': 'nature_clean',
    'luxury': 'royal_purple',
  };
  
  return themeMap[legacyTheme || 'midnight'] || 'midnight_pro';
}

/**
 * Create a heading element
 */
function createHeading(text: string, level: 'h1' | 'h2' | 'h3' | 'h4' = 'h2', useGradient = false): LPElement {
  return {
    id: generateId(),
    type: 'heading',
    visible: true,
    props: { text, level, useGradient },
    style: { textAlign: 'center' },
  };
}

/**
 * Create a text element
 */
function createText(content: string, align: 'left' | 'center' | 'right' = 'center'): LPElement {
  return {
    id: generateId(),
    type: 'text',
    visible: true,
    props: { content },
    style: { textAlign: align },
  };
}

/**
 * Create a button element
 */
function createButton(label: string, variant: 'primary' | 'secondary' | 'outline' = 'primary', size: 'sm' | 'md' | 'lg' = 'lg'): LPElement {
  return {
    id: generateId(),
    type: 'button',
    visible: true,
    props: { label, variant, size },
  };
}

/**
 * Create an image element
 */
function createImage(src: string, alt: string = ''): LPElement {
  return {
    id: generateId(),
    type: 'image',
    visible: true,
    props: { src, alt, objectFit: 'cover', rounded: 'xl' },
  };
}

/**
 * Create a badge element
 */
function createBadge(text: string): LPElement {
  return {
    id: generateId(),
    type: 'badge',
    visible: true,
    props: { badgeText: text },
  };
}

/**
 * Create a list element
 */
function createList(items: string[], icon: 'check' | 'x' | 'arrow' | 'bullet' = 'check'): LPElement {
  return {
    id: generateId(),
    type: 'list',
    visible: true,
    props: { items, listIcon: icon },
  };
}

/**
 * Create a spacer element
 */
function createSpacer(height: 'sm' | 'md' | 'lg' | 'xl' = 'md'): LPElement {
  return {
    id: generateId(),
    type: 'spacer',
    visible: true,
    props: { height },
  };
}

/**
 * Create a single column row
 */
function createSingleColumnRow(elements: LPElement[]): LPRow {
  return {
    id: generateId(),
    columns: [{
      id: generateId(),
      width: 12,
      elements,
      style: { textAlign: 'center' },
    }],
    style: { gap: 'md', alignItems: 'center' },
  };
}

/**
 * Create a two-column row
 */
function createTwoColumnRow(leftElements: LPElement[], rightElements: LPElement[], leftWidth: 6 | 5 | 7 = 6): LPRow {
  const rightWidth = (12 - leftWidth) as 6 | 5 | 7;
  return {
    id: generateId(),
    columns: [
      {
        id: generateId(),
        width: leftWidth,
        elements: leftElements,
        style: { textAlign: 'left', verticalAlign: 'center' },
      },
      {
        id: generateId(),
        width: rightWidth,
        elements: rightElements,
        style: { textAlign: 'center', verticalAlign: 'center' },
      },
    ],
    style: { gap: 'lg', alignItems: 'center', reverseOnMobile: true },
  };
}

// ============================================================================
// SECTION BUILDERS
// ============================================================================

function buildHeroSection(copy: LegacyCopy, config: LegacyConfig): LPSection {
  const elements: LPElement[] = [];
  
  // Badge
  if (copy.badge_urgencia) {
    elements.push(createBadge(copy.badge_urgencia));
  }
  
  // Headline
  elements.push(createHeading(copy.headline || 'Título Principal', 'h1', true));
  
  // Subheadline
  if (copy.subheadline) {
    elements.push(createText(copy.subheadline, 'center'));
  }
  
  // Spacer
  elements.push(createSpacer('md'));
  
  // CTA Button
  elements.push(createButton(copy.cta_text || 'Saiba Mais', 'primary', 'lg'));
  
  // CTA Subtext
  if (copy.cta_subtext) {
    elements.push(createText(copy.cta_subtext, 'center'));
  }

  return {
    id: generateId(),
    type: 'hero',
    name: 'Hero',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'lg' },
    rows: [createSingleColumnRow(elements)],
  };
}

function buildProblemSection(copy: LegacyCopy): LPSection | null {
  if (!copy.sobre_titulo && !copy.sobre_texto) return null;
  
  const elements: LPElement[] = [];
  
  // Title
  if (copy.sobre_titulo) {
    elements.push(createHeading(copy.sobre_titulo, 'h2', false));
  }
  
  // Text
  if (copy.sobre_texto) {
    elements.push(createText(copy.sobre_texto, 'center'));
  }
  
  // Highlight
  if (copy.sobre_destaque) {
    elements.push(createSpacer('sm'));
    elements.push(createText(`**${copy.sobre_destaque}**`, 'center'));
  }

  return {
    id: generateId(),
    type: 'problem',
    name: 'Problema',
    visible: true,
    style: { paddingY: 'lg', maxWidth: 'lg' },
    rows: [createSingleColumnRow(elements)],
  };
}

function buildTargetAudienceSection(copy: LegacyCopy): LPSection | null {
  if (!copy.perfis_ideais || copy.perfis_ideais.length === 0) return null;
  
  const elements: LPElement[] = [
    createHeading('Para Quem é Ideal?', 'h2', false),
    createSpacer('md'),
  ];
  
  // Convert profiles to list items
  const items = copy.perfis_ideais.map(p => `${p.titulo}: ${p.descricao}`);
  elements.push(createList(items, 'check'));

  return {
    id: generateId(),
    type: 'target-audience',
    name: 'Público-Alvo',
    visible: true,
    style: { paddingY: 'lg', maxWidth: 'lg' },
    rows: [createSingleColumnRow(elements)],
  };
}

function buildSolutionSection(copy: LegacyCopy): LPSection | null {
  if (!copy.dores || copy.dores.length === 0) return null;
  
  const elements: LPElement[] = [
    createHeading('A Solução', 'h2', true),
    createSpacer('md'),
  ];
  
  // Add pain/solution items as list
  const solutionItems = copy.dores.map(d => d.solucao).filter(Boolean);
  if (solutionItems.length > 0) {
    elements.push(createList(solutionItems, 'arrow'));
  }

  return {
    id: generateId(),
    type: 'solution',
    name: 'Solução',
    visible: true,
    style: { paddingY: 'lg', maxWidth: 'lg' },
    rows: [createSingleColumnRow(elements)],
  };
}

function buildBenefitsSection(copy: LegacyCopy): LPSection | null {
  if (!copy.beneficios || copy.beneficios.length === 0) return null;
  
  const elements: LPElement[] = [
    createHeading('Benefícios', 'h2', false),
    createSpacer('md'),
  ];
  
  // Convert beneficios to list
  const items = copy.beneficios.map(b => 
    typeof b === 'string' ? b : (b.titulo || b.descricao)
  );
  elements.push(createList(items, 'check'));
  
  // CTA
  elements.push(createSpacer('md'));
  elements.push(createButton(copy.cta_text || 'Quero Garantir', 'primary', 'lg'));

  return {
    id: generateId(),
    type: 'benefits',
    name: 'Benefícios',
    visible: true,
    style: { paddingY: 'lg', maxWidth: 'lg' },
    rows: [createSingleColumnRow(elements)],
  };
}

function buildTestimonialsSection(): LPSection {
  // Create placeholder testimonial cards
  const testimonial1: LPElement = {
    id: generateId(),
    type: 'testimonial-card',
    visible: true,
    props: {
      testimonial: {
        name: 'Cliente 1',
        text: 'Excelente serviço! Recomendo para todos.',
        role: 'Empresário',
      },
    },
  };
  
  const testimonial2: LPElement = {
    id: generateId(),
    type: 'testimonial-card',
    visible: true,
    props: {
      testimonial: {
        name: 'Cliente 2',
        text: 'Superou todas as minhas expectativas.',
        role: 'Profissional',
      },
    },
  };
  
  const testimonial3: LPElement = {
    id: generateId(),
    type: 'testimonial-card',
    visible: true,
    props: {
      testimonial: {
        name: 'Cliente 3',
        text: 'Transformou minha vida!',
        role: 'Empreendedora',
      },
    },
  };

  return {
    id: generateId(),
    type: 'testimonials',
    name: 'Depoimentos',
    visible: true,
    style: { paddingY: 'lg', maxWidth: 'xl' },
    rows: [
      createSingleColumnRow([createHeading('O Que Nossos Clientes Dizem', 'h2', false)]),
      {
        id: generateId(),
        columns: [
          { id: generateId(), width: 4, elements: [testimonial1] },
          { id: generateId(), width: 4, elements: [testimonial2] },
          { id: generateId(), width: 4, elements: [testimonial3] },
        ],
        style: { gap: 'lg', alignItems: 'stretch' },
      },
    ],
  };
}

function buildPricingSection(copy: LegacyCopy, config: LegacyConfig): LPSection | null {
  const precos = config.precos;
  if (precos?.estrategia === 'sem_preco') return null;
  
  const pricingElement: LPElement = {
    id: generateId(),
    type: 'pricing-card',
    visible: true,
    props: {
      price: precos?.precoFinal ? `R$ ${precos.precoFinal}` : undefined,
      originalPrice: precos?.estrategia === 'promocional' && precos?.precoOriginal 
        ? `R$ ${precos.precoOriginal}` 
        : undefined,
      features: typeof copy.beneficios?.[0] === 'string' 
        ? (copy.beneficios as string[]).slice(0, 5) 
        : copy.beneficios?.slice(0, 5).map(b => (b as { titulo: string }).titulo),
    },
  };

  return {
    id: generateId(),
    type: 'pricing',
    name: 'Preço',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'md' },
    rows: [
      createSingleColumnRow([
        createHeading('Investimento', 'h2', true),
        createSpacer('md'),
        pricingElement,
        createSpacer('md'),
        createButton(copy.cta_text || 'Quero Garantir Agora', 'primary', 'lg'),
      ]),
    ],
  };
}

function buildBioSection(copy: LegacyCopy): LPSection | null {
  if (!copy.especialista_titulo && !copy.especialista_texto) return null;
  
  const bioElement: LPElement = {
    id: generateId(),
    type: 'bio-card',
    visible: true,
    props: {
      name: copy.especialista_titulo,
      role: copy.especialista_subtitulo,
      description: copy.especialista_texto,
      photo: '', // Placeholder
    },
  };
  
  const credentialsElement = copy.especialista_credenciais && copy.especialista_credenciais.length > 0
    ? createList(copy.especialista_credenciais, 'check')
    : null;

  const elements: LPElement[] = [bioElement];
  if (credentialsElement) {
    elements.push(createSpacer('md'));
    elements.push(credentialsElement);
  }

  return {
    id: generateId(),
    type: 'bio',
    name: 'Sobre',
    visible: true,
    style: { paddingY: 'lg', maxWidth: 'lg' },
    rows: [createSingleColumnRow(elements)],
  };
}

function buildFaqSection(copy: LegacyCopy): LPSection | null {
  if (!copy.faqs || copy.faqs.length === 0) return null;
  
  const faqElement: LPElement = {
    id: generateId(),
    type: 'faq-accordion',
    visible: true,
    props: {
      faqItems: copy.faqs.map(f => ({
        q: f.pergunta,
        a: f.resposta,
      })),
    },
  };

  return {
    id: generateId(),
    type: 'faq',
    name: 'FAQ',
    visible: true,
    style: { paddingY: 'lg', maxWidth: 'lg' },
    rows: [
      createSingleColumnRow([
        createHeading('Perguntas Frequentes', 'h2', false),
        createSpacer('md'),
        faqElement,
      ]),
    ],
  };
}

function buildFinalCtaSection(copy: LegacyCopy): LPSection {
  return {
    id: generateId(),
    type: 'cta-final',
    name: 'CTA Final',
    visible: true,
    style: { paddingY: 'xl', maxWidth: 'lg' },
    rows: [
      createSingleColumnRow([
        createHeading(copy.headline_final || 'Pronto para Começar?', 'h2', true),
        createSpacer('md'),
        createButton(copy.cta_text || 'Quero Começar Agora', 'primary', 'lg'),
        createSpacer('sm'),
        createText(copy.cta_subtext || 'Garantia de satisfação', 'center'),
      ]),
    ],
  };
}

function buildFooterSection(nome: string): LPSection {
  return {
    id: generateId(),
    type: 'footer',
    name: 'Rodapé',
    visible: true,
    style: { paddingY: 'md', maxWidth: 'full' },
    rows: [
      createSingleColumnRow([
        createText(`© ${new Date().getFullYear()} ${nome}. Todos os direitos reservados.`, 'center'),
      ]),
    ],
  };
}

// ============================================================================
// MAIN IMPORTER
// ============================================================================

/**
 * Import a legacy landing page (lp-12d or lp-teodoro format) into the new document format
 */
export function importFromLegacy(data: LegacyLandingPage): LandingPageDocument {
  const copy = data.copy_gerada || {};
  const config = data.config || {};
  const elementos = config.elementos || {};
  
  // Determine template ID
  const templateId = data.template_tipo === 'lp-teodoro' 
    ? 'lp-teodoro' 
    : data.template_tipo === 'lp-12d' 
      ? 'lp-12d' 
      : 'custom';
  
  // If template is lp-12d and no copy was generated, use the full template with placeholders
  const hasCopyContent = copy.headline || copy.sobre_texto || (copy.beneficios && copy.beneficios.length > 0);
  if (templateId === 'lp-12d' && !hasCopyContent) {
    const fullDoc = createLP12DDocument();
    fullDoc.meta.title = data.nome || fullDoc.meta.title;
    return fullDoc;
  }
  
  // Build sections from legacy data
  const sections: LPSection[] = [];
  
  // 1. Hero (always)
  sections.push(buildHeroSection(copy, config));
  
  // 2. Problem/About
  const problemSection = buildProblemSection(copy);
  if (problemSection) sections.push(problemSection);
  
  // 3. Target Audience
  const targetSection = buildTargetAudienceSection(copy);
  if (targetSection) sections.push(targetSection);
  
  // 4. Solution (from dores)
  const solutionSection = buildSolutionSection(copy);
  if (solutionSection) sections.push(solutionSection);
  
  // 5. Benefits
  const benefitsSection = buildBenefitsSection(copy);
  if (benefitsSection) sections.push(benefitsSection);
  
  // 6. Testimonials (if enabled)
  if (elementos.depoimentos !== false) {
    sections.push(buildTestimonialsSection());
  }
  
  // 7. Pricing
  const pricingSection = buildPricingSection(copy, config);
  if (pricingSection) sections.push(pricingSection);
  
  // 8. Bio/Specialist
  const bioSection = buildBioSection(copy);
  if (bioSection) sections.push(bioSection);
  
  // 9. FAQ
  const faqSection = buildFaqSection(copy);
  if (faqSection) sections.push(faqSection);
  
  // 10. Final CTA
  sections.push(buildFinalCtaSection(copy));
  
  // 11. Footer
  sections.push(buildFooterSection(data.nome));
  
  // Build document
  const document: LandingPageDocument = {
    template_id: templateId as 'lp-12d' | 'lp-teodoro' | 'custom',
    theme_id: mapThemeId(config.theme),
    meta: {
      title: copy.meta_title || data.nome,
      description: copy.meta_description || copy.subheadline || '',
    },
    settings: {
      animations_enabled: true,
      mobile_stack_columns: true,
      cta_destination: (config.destino_cta as 'whatsapp' | 'checkout' | 'formulario') || 'whatsapp',
      whatsapp_number: undefined,
    },
    sections,
  };
  
  return document;
}

/**
 * Check if the config already contains the new document format
 */
export function isNewDocumentFormat(config: unknown): config is LandingPageDocument {
  if (!config || typeof config !== 'object') return false;
  const doc = config as Record<string, unknown>;
  return (
    Array.isArray(doc.sections) &&
    typeof doc.theme_id === 'string' &&
    typeof doc.meta === 'object'
  );
}

/**
 * Get or convert a landing page config to the new format
 */
export function getOrConvertDocument(landingPage: LegacyLandingPage): LandingPageDocument {
  // Check if config is already in new format
  if (landingPage.config && isNewDocumentFormat(landingPage.config)) {
    return landingPage.config as unknown as LandingPageDocument;
  }
  
  // Convert from legacy format
  return importFromLegacy(landingPage);
}
