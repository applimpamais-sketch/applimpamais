/**
 * Sistema de Temas Dinâmicos para Landing Pages
 * Permite variação visual entre diferentes LPs
 */

export type LPTheme = 'midnight' | 'sunset' | 'nature' | 'royal' | 'ocean' | 'feminine';

export interface ThemeColors {
  // Nome e descrição
  name: string;
  description: string;
  idealFor: string;
  
  // Backgrounds
  bgPrimary: string;
  bgSection: string;
  bgCard: string;
  bgCardHover: string;
  
  // Gradientes (classes Tailwind)
  gradientPrimary: string;
  gradientHeadline: string;
  gradientButton: string;
  gradientIcon: string;
  gradientCta: string;
  
  // Cores de acento
  accent: string;
  accentHover: string;
  accentLight: string;
  
  // Cores de destaque
  price: string;
  urgency: string;
  urgencyBg: string;
  success: string;
  successBg: string;
  
  // Bordas
  border: string;
  borderHover: string;
  borderHighlight: string;
  
  // Texto
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Glow/Shadow
  glowColor: string;
  shadowCta: string;
  
  // Animação style
  animationStyle: 'slide' | 'scale' | 'fade' | 'elegant' | 'wave';
}

export const themes: Record<LPTheme, ThemeColors> = {
  // ============================================
  // MIDNIGHT PRO - Preto + Azul/Cyan (Atual)
  // ============================================
  midnight: {
    name: 'Midnight Pro',
    description: 'Tecnológico e futurista',
    idealFor: 'Serviços premium',
    
    bgPrimary: 'bg-black',
    bgSection: 'bg-gray-950',
    bgCard: 'bg-black/40',
    bgCardHover: 'hover:border-blue-500/50',
    
    gradientPrimary: 'from-blue-500 to-cyan-500',
    gradientHeadline: 'from-white via-blue-400 to-cyan-400',
    gradientButton: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    gradientIcon: 'from-blue-500 to-cyan-400',
    gradientCta: 'from-blue-600 via-blue-500 to-cyan-500',
    
    accent: 'text-cyan-400',
    accentHover: 'hover:text-cyan-300',
    accentLight: 'text-cyan-400/50',
    
    price: 'from-green-400 to-cyan-400',
    urgency: 'text-red-400',
    urgencyBg: 'bg-red-500/10 border-red-500/30',
    success: 'text-cyan-400',
    successBg: 'bg-cyan-500/20',
    
    border: 'border-gray-800',
    borderHover: 'border-blue-500/50',
    borderHighlight: 'border-blue-500/50 ring-2 ring-blue-500/20',
    
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    
    glowColor: 'shadow-cyan-500/30',
    shadowCta: 'shadow-cyan-500/30 hover:shadow-cyan-500/50',
    
    animationStyle: 'slide',
  },
  
  // ============================================
  // WARM SUNSET - Preto + Laranja/Vermelho
  // ============================================
  sunset: {
    name: 'Warm Sunset',
    description: 'Urgência e energia',
    idealFor: 'Promoções',
    
    bgPrimary: 'bg-black',
    bgSection: 'bg-gray-950',
    bgCard: 'bg-black/40',
    bgCardHover: 'hover:border-orange-500/50',
    
    gradientPrimary: 'from-orange-500 to-red-500',
    gradientHeadline: 'from-white via-orange-400 to-red-400',
    gradientButton: 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
    gradientIcon: 'from-orange-500 to-red-400',
    gradientCta: 'from-orange-600 via-red-500 to-rose-500',
    
    accent: 'text-orange-400',
    accentHover: 'hover:text-orange-300',
    accentLight: 'text-orange-400/50',
    
    price: 'from-yellow-400 to-orange-400',
    urgency: 'text-red-400',
    urgencyBg: 'bg-red-500/10 border-red-500/30',
    success: 'text-orange-400',
    successBg: 'bg-orange-500/20',
    
    border: 'border-gray-800',
    borderHover: 'border-orange-500/50',
    borderHighlight: 'border-orange-500/50 ring-2 ring-orange-500/20',
    
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    
    glowColor: 'shadow-orange-500/30',
    shadowCta: 'shadow-orange-500/30 hover:shadow-orange-500/50',
    
    animationStyle: 'scale',
  },
  
  // ============================================
  // NATURE CLEAN - Verde escuro + Esmeralda
  // ============================================
  nature: {
    name: 'Nature Clean',
    description: 'Orgânico e natural',
    idealFor: 'Limpeza ecológica',
    
    bgPrimary: 'bg-gray-950',
    bgSection: 'bg-black',
    bgCard: 'bg-gray-950/60',
    bgCardHover: 'hover:border-emerald-500/50',
    
    gradientPrimary: 'from-green-500 to-emerald-500',
    gradientHeadline: 'from-white via-green-400 to-emerald-400',
    gradientButton: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    gradientIcon: 'from-green-500 to-emerald-400',
    gradientCta: 'from-green-600 via-emerald-500 to-teal-500',
    
    accent: 'text-emerald-400',
    accentHover: 'hover:text-emerald-300',
    accentLight: 'text-emerald-400/50',
    
    price: 'from-green-400 to-emerald-400',
    urgency: 'text-amber-400',
    urgencyBg: 'bg-amber-500/10 border-amber-500/30',
    success: 'text-emerald-400',
    successBg: 'bg-emerald-500/20',
    
    border: 'border-gray-800',
    borderHover: 'border-emerald-500/50',
    borderHighlight: 'border-emerald-500/50 ring-2 ring-emerald-500/20',
    
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    
    glowColor: 'shadow-emerald-500/30',
    shadowCta: 'shadow-emerald-500/30 hover:shadow-emerald-500/50',
    
    animationStyle: 'fade',
  },
  
  // ============================================
  // ROYAL PURPLE - Roxo + Violeta/Rosa
  // ============================================
  royal: {
    name: 'Royal Purple',
    description: 'Luxo e exclusividade',
    idealFor: 'Serviços VIP',
    
    bgPrimary: 'bg-gray-950',
    bgSection: 'bg-black',
    bgCard: 'bg-gray-950/60',
    bgCardHover: 'hover:border-purple-500/50',
    
    gradientPrimary: 'from-purple-500 to-pink-500',
    gradientHeadline: 'from-white via-purple-400 to-pink-400',
    gradientButton: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    gradientIcon: 'from-purple-500 to-pink-400',
    gradientCta: 'from-purple-600 via-violet-500 to-pink-500',
    
    accent: 'text-purple-400',
    accentHover: 'hover:text-purple-300',
    accentLight: 'text-purple-400/50',
    
    price: 'from-purple-400 to-pink-400',
    urgency: 'text-rose-400',
    urgencyBg: 'bg-rose-500/10 border-rose-500/30',
    success: 'text-purple-400',
    successBg: 'bg-purple-500/20',
    
    border: 'border-gray-800',
    borderHover: 'border-purple-500/50',
    borderHighlight: 'border-purple-500/50 ring-2 ring-purple-500/20',
    
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    
    glowColor: 'shadow-purple-500/30',
    shadowCta: 'shadow-purple-500/30 hover:shadow-purple-500/50',
    
    animationStyle: 'elegant',
  },
  
  // ============================================
  // OCEAN DEEP - Azul escuro + Teal/Turquesa
  // ============================================
  ocean: {
    name: 'Ocean Deep',
    description: 'Confiança e profundidade',
    idealFor: 'Serviços tradicionais',
    
    bgPrimary: 'bg-slate-950',
    bgSection: 'bg-slate-900',
    bgCard: 'bg-slate-950/60',
    bgCardHover: 'hover:border-teal-500/50',
    
    gradientPrimary: 'from-teal-500 to-cyan-500',
    gradientHeadline: 'from-white via-teal-400 to-cyan-400',
    gradientButton: 'from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600',
    gradientIcon: 'from-teal-500 to-cyan-400',
    gradientCta: 'from-teal-600 via-teal-500 to-cyan-500',
    
    accent: 'text-teal-400',
    accentHover: 'hover:text-teal-300',
    accentLight: 'text-teal-400/50',
    
    price: 'from-teal-400 to-cyan-400',
    urgency: 'text-amber-400',
    urgencyBg: 'bg-amber-500/10 border-amber-500/30',
    success: 'text-teal-400',
    successBg: 'bg-teal-500/20',
    
    border: 'border-slate-800',
    borderHover: 'border-teal-500/50',
    borderHighlight: 'border-teal-500/50 ring-2 ring-teal-500/20',
    
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    
    glowColor: 'shadow-teal-500/30',
    shadowCta: 'shadow-teal-500/30 hover:shadow-teal-500/50',
    
    animationStyle: 'wave',
  },
  
  // ============================================
  // FEMININE - Roxo/Rosa Gradiente (Catia Regiely 12D)
  // ============================================
  feminine: {
    name: 'Feminine Purple',
    description: 'Delicado e empoderador',
    idealFor: 'Produtos femininos, coaches',
    
    bgPrimary: 'bg-[#1a1a2e]',
    bgSection: 'bg-[#16213e]/80',
    bgCard: 'bg-white/5 backdrop-blur-lg',
    bgCardHover: 'hover:border-pink-500/50',
    
    gradientPrimary: 'from-[#9F56CB] to-[#F988E7]',
    gradientHeadline: 'from-white via-purple-300 to-pink-300',
    gradientButton: 'from-[#9F56CB] to-[#F988E7] hover:from-[#8A4AB5] hover:to-[#E77DD6]',
    gradientIcon: 'from-[#9F56CB] to-[#F988E7]',
    gradientCta: 'from-[#9F56CB] via-[#B86FD9] to-[#F988E7]',
    
    accent: 'text-pink-400',
    accentHover: 'hover:text-pink-300',
    accentLight: 'text-pink-400/50',
    
    price: 'from-pink-400 to-purple-400',
    urgency: 'text-pink-400',
    urgencyBg: 'bg-pink-500/10 border-pink-500/30',
    success: 'text-pink-400',
    successBg: 'bg-pink-500/20',
    
    border: 'border-purple-800/30',
    borderHover: 'border-pink-500/50',
    borderHighlight: 'border-pink-500/50 ring-2 ring-pink-500/20',
    
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    
    glowColor: 'shadow-pink-500/30',
    shadowCta: 'shadow-pink-500/30 hover:shadow-pink-500/50',
    
    animationStyle: 'elegant',
  },
};

/**
 * Helper para obter classes de tema com fallback
 */
export const getTheme = (themeId?: LPTheme | string): ThemeColors => {
  if (themeId && themeId in themes) {
    return themes[themeId as LPTheme];
  }
  return themes.midnight; // Default
};

/**
 * Animation variants para framer-motion baseados no tema
 */
export const getAnimationVariants = (themeId?: LPTheme | string) => {
  const theme = getTheme(themeId);
  
  const baseVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };
  
  switch (theme.animationStyle) {
    case 'slide':
      return {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      };
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
      };
    case 'fade':
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8 } },
      };
    case 'elegant':
      return {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7 } },
      };
    case 'wave':
      return {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
      };
    default:
      return baseVariants;
  }
};

/**
 * Lista de temas para seletor
 */
export const themesList = Object.entries(themes).map(([id, theme]) => ({
  id: id as LPTheme,
  name: theme.name,
  description: theme.description,
  idealFor: theme.idealFor,
  gradientPrimary: theme.gradientPrimary,
}));
