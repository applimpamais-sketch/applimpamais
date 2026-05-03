/**
 * Landing Page Color Palette
 * Tema: Preto + Azul Vibrante + Cyan
 */

export const landingColors = {
  // Backgrounds
  primary: '#000000',           // Preto puro
  surface: '#0a0a0a',           // Preto suave
  surfaceElevated: '#1a1a1a',   // Cards/elevados
  
  // Azul Principal (RC Limpa Mais)
  blue: {
    50: '#E6F2FF',
    100: '#BAE0FF',
    200: '#7CC4FA',
    300: '#47A3F3',
    400: '#2186EB',
    500: '#074FD5',  // Principal - Azul vibrante
    600: '#0040B0',
    700: '#00338A',
    800: '#002664',
    900: '#001A3E',
  },
  
  // Cyan/Turquesa (Acento)
  cyan: {
    300: '#67E8F9',
    400: '#22D3EE',  // Acento principal
    500: '#06B6D4',
    600: '#0891B2',
  },
  
  // Texto
  text: {
    primary: '#FFFFFF',      // Branco puro
    secondary: '#A0A0A0',    // Cinza médio
    muted: '#6B7280',        // Cinza escuro
    accent: '#22D3EE',       // Cyan para destaques
  },
  
  // Bordas
  border: {
    default: '#1F2937',      // Cinza muito escuro
    hover: '#374151',        // Cinza escuro
    accent: '#074FD5',       // Azul vibrante
  },
  
  // Estados
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Gradientes
  gradients: {
    primary: 'linear-gradient(135deg, #074FD5 0%, #22D3EE 100%)',
    hero: 'linear-gradient(90deg, #FFFFFF 0%, #47A3F3 50%, #22D3EE 100%)',
    card: 'linear-gradient(135deg, rgba(7,79,213,0.1) 0%, rgba(34,211,238,0.05) 100%)',
    spotlight: 'radial-gradient(circle, rgba(7,79,213,0.2) 0%, transparent 70%)',
  }
};

/**
 * Utilitários Tailwind customizados para a landing page
 */
export const landingClasses = {
  // Títulos com gradiente
  headlineGradient: 'bg-gradient-to-r from-white via-blue-400 to-cyan-400 bg-clip-text text-transparent',
  
  // Cards com glow
  glowCard: 'bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-blue-500/50 transition-all duration-300',
  glowCardHighlighted: 'border-blue-500/50 ring-2 ring-blue-500/20 shadow-[0_0_50px_rgba(7,79,213,0.15)]',
  
  // Botões
  buttonPrimary: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0',
  buttonSecondary: 'bg-white/5 hover:bg-white/10 text-white border border-gray-700 hover:border-blue-500/50',
  
  // Ícones
  iconCyan: 'text-cyan-400',
  iconGradient: 'bg-gradient-to-br from-blue-500 to-cyan-400',
  
  // Backgrounds
  bgBlack: 'bg-black',
  bgGray: 'bg-gray-950',
  
  // Links
  linkDefault: 'text-gray-400 hover:text-cyan-400 transition-colors',
};

/**
 * Configuração de cores para seções específicas
 */
export const sectionColors = {
  hero: {
    bg: landingColors.primary,
    grid: 'hsl(210 100% 50% / 0.1)',
    spotlight: 'rgba(7, 79, 213, 0.2)',
  },
  
  painPoints: {
    bg: landingColors.surfaceElevated,
    glowColor: landingColors.blue[500],
  },
  
  features: {
    bg: landingColors.primary,
    iconGradient: landingColors.gradients.primary,
  },
  
  pricing: {
    bg: landingColors.primary,
    cardBg: 'rgba(0, 0, 0, 0.4)',
    highlightBorder: landingColors.blue[500],
  },
  
  cta: {
    bg: landingColors.gradients.primary,
    inputBorder: landingColors.border.default,
    inputFocus: landingColors.blue[500],
  },
  
  footer: {
    bg: landingColors.surfaceElevated,
    linkColor: landingColors.text.secondary,
    linkHover: landingColors.cyan[400],
  },
};
