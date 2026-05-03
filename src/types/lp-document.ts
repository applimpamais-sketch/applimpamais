import { z } from 'zod';
import type { LPThemeId } from '@/styles/lp-css-themes';

// ============================================================================
// ELEMENT TYPES
// ============================================================================

export type ElementType =
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'list'
  | 'faq-accordion'
  | 'testimonial-card'
  | 'pricing-card'
  | 'bio-card'
  | 'icon'
  | 'spacer'
  | 'divider'
  | 'video'
  | 'countdown'
  | 'badge';

export type SectionType =
  | 'hero'
  | 'problem'
  | 'solution'
  | 'benefits'
  | 'testimonials'
  | 'target-audience'
  | 'pricing'
  | 'bio'
  | 'faq'
  | 'cta-final'
  | 'footer'
  | 'marquee'
  | 'custom';

// ============================================================================
// ELEMENT PROPS
// ============================================================================

export interface ElementProps {
  // Heading
  text?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  useGradient?: boolean;

  // Text
  content?: string;

  // Image
  src?: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  rounded?: 'none' | 'md' | 'lg' | 'xl' | 'full';

  // Button
  label?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;

  // List
  items?: string[];
  listIcon?: 'check' | 'x' | 'arrow' | 'bullet';

  // FAQ
  faqItems?: { q: string; a: string }[];

  // Testimonial
  testimonial?: {
    name: string;
    text: string;
    role?: string;
    avatar?: string;
  };

  // Pricing
  price?: string;
  originalPrice?: string;
  features?: string[];

  // Bio
  name?: string;
  role?: string;
  description?: string;
  photo?: string;

  // Spacer
  height?: 'sm' | 'md' | 'lg' | 'xl';

  // Video
  videoUrl?: string;
  poster?: string;

  // Countdown
  targetDate?: string;

  // Badge
  badgeText?: string;
}

// ============================================================================
// ELEMENT STYLE
// ============================================================================

export interface ElementStyle {
  color?: string;
  fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  marginTop?: string;
  marginBottom?: string;
  backgroundColor?: string;
  borderRadius?: string;
  className?: string;
}

// ============================================================================
// ELEMENT
// ============================================================================

export interface LPElement {
  id: string;
  type: ElementType;
  visible: boolean;
  props: ElementProps;
  style?: ElementStyle;
  responsiveOverrides?: {
    mobile?: Partial<ElementProps & ElementStyle>;
  };
}

// ============================================================================
// COLUMN
// ============================================================================

export type ColumnWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface LPColumn {
  id: string;
  width: ColumnWidth;
  elements: LPElement[];
  style?: {
    padding?: string;
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'start' | 'center' | 'end';
  };
}

// ============================================================================
// ROW
// ============================================================================

export interface LPRow {
  id: string;
  columns: LPColumn[];
  style?: {
    gap?: 'sm' | 'md' | 'lg';
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    reverseOnMobile?: boolean;
  };
}

// ============================================================================
// SECTION
// ============================================================================

export interface SectionStyle {
  background?: string;
  backgroundImage?: string;
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export interface LPSection {
  id: string;
  type: SectionType;
  name?: string;
  visible: boolean;
  style: SectionStyle;
  themeOverrides?: Record<string, string>;
  rows: LPRow[];
}

// ============================================================================
// DOCUMENT
// ============================================================================

export interface LandingPageDocument {
  template_id: 'lp-12d' | 'lp-teodoro' | 'custom';
  theme_id: LPThemeId;

  meta: {
    title: string;
    description: string;
    favicon?: string;
  };

  settings: {
    animations_enabled: boolean;
    mobile_stack_columns: boolean;
    cta_destination: 'whatsapp' | 'checkout' | 'formulario';
    whatsapp_number?: string;
  };

  sections: LPSection[];

  assets?: {
    custom_css?: string;
    scripts?: string[];
  };
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const ElementPropsSchema = z.object({
  text: z.string().optional(),
  level: z.enum(['h1', 'h2', 'h3', 'h4']).optional(),
  useGradient: z.boolean().optional(),
  content: z.string().optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
  objectFit: z.enum(['cover', 'contain', 'fill']).optional(),
  rounded: z.enum(['none', 'md', 'lg', 'xl', 'full']).optional(),
  label: z.string().optional(),
  href: z.string().optional(),
  variant: z.enum(['primary', 'secondary', 'outline']).optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
  icon: z.string().optional(),
  items: z.array(z.string()).optional(),
  listIcon: z.enum(['check', 'x', 'arrow', 'bullet']).optional(),
  faqItems: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  testimonial: z.object({
    name: z.string(),
    text: z.string(),
    role: z.string().optional(),
    avatar: z.string().optional(),
  }).optional(),
  price: z.string().optional(),
  originalPrice: z.string().optional(),
  features: z.array(z.string()).optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
  photo: z.string().optional(),
  height: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
  videoUrl: z.string().optional(),
  poster: z.string().optional(),
  targetDate: z.string().optional(),
  badgeText: z.string().optional(),
}).passthrough();

export const LPElementSchema = z.object({
  id: z.string(),
  type: z.string(),
  visible: z.boolean(),
  props: ElementPropsSchema,
  style: z.record(z.any()).optional(),
  responsiveOverrides: z.object({
    mobile: z.record(z.any()).optional(),
  }).optional(),
});

export const LPColumnSchema = z.object({
  id: z.string(),
  width: z.number().min(1).max(12),
  elements: z.array(LPElementSchema),
  style: z.record(z.any()).optional(),
});

export const LPRowSchema = z.object({
  id: z.string(),
  columns: z.array(LPColumnSchema),
  style: z.record(z.any()).optional(),
});

export const LPSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  visible: z.boolean(),
  style: z.record(z.any()),
  themeOverrides: z.record(z.string()).optional(),
  rows: z.array(LPRowSchema),
});

export const LandingPageDocumentSchema = z.object({
  template_id: z.enum(['lp-12d', 'lp-teodoro', 'custom']),
  theme_id: z.string(),
  meta: z.object({
    title: z.string(),
    description: z.string(),
    favicon: z.string().optional(),
  }),
  settings: z.object({
    animations_enabled: z.boolean(),
    mobile_stack_columns: z.boolean(),
    cta_destination: z.enum(['whatsapp', 'checkout', 'formulario']),
    whatsapp_number: z.string().optional(),
  }),
  sections: z.array(LPSectionSchema),
  assets: z.object({
    custom_css: z.string().optional(),
    scripts: z.array(z.string()).optional(),
  }).optional(),
});

// ============================================================================
// HELPER TYPES
// ============================================================================

export type SelectionType = 'section' | 'row' | 'column' | 'element';

export interface EditorSelection {
  id: string | null;
  type: SelectionType | null;
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const createDefaultDocument = (): LandingPageDocument => ({
  template_id: 'custom',
  theme_id: 'midnight_pro',
  meta: {
    title: 'Nova Landing Page',
    description: '',
  },
  settings: {
    animations_enabled: true,
    mobile_stack_columns: true,
    cta_destination: 'whatsapp',
  },
  sections: [],
});

export const generateId = (): string => {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
};
