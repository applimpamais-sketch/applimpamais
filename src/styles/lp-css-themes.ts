import React from 'react';

/**
 * Theme IDs for Landing Pages
 * Uses underscore naming to match backend/database convention
 */
export type LPThemeId = 
  | 'midnight_pro' 
  | 'warm_sunset' 
  | 'nature_clean' 
  | 'royal_purple' 
  | 'ocean_deep' 
  | 'feminine_purple';

/**
 * CSS Custom Properties for theming
 * All colors are defined as raw values (no hsl() wrapper for flexibility)
 */
export interface LPThemeTokens {
  // Background colors
  '--lp-bg': string;
  '--lp-surface': string;
  '--lp-surface-hover': string;
  '--lp-surface-alt': string;
  
  // Text colors
  '--lp-text': string;
  '--lp-text-muted': string;
  '--lp-text-inverse': string;
  
  // Primary gradient colors
  '--lp-primary': string;
  '--lp-primary-end': string;
  '--lp-primary-contrast': string;
  
  // Accent colors
  '--lp-accent': string;
  '--lp-accent-hover': string;
  '--lp-accent-light': string;
  
  // Border colors
  '--lp-border': string;
  '--lp-border-hover': string;
  
  // Shadow/Glow
  '--lp-shadow': string;
  '--lp-glow': string;
  '--lp-shadow-cta': string;
  
  // Status colors
  '--lp-success': string;
  '--lp-warning': string;
}

/**
 * Theme metadata for UI display
 */
export interface LPThemeMeta {
  id: LPThemeId;
  name: string;
  description: string;
  idealFor: string;
}

/**
 * All theme definitions with CSS custom properties
 */
export const themes: Record<LPThemeId, LPThemeTokens> = {
  // ============================================
  // MIDNIGHT PRO - Black + Blue/Cyan
  // ============================================
  midnight_pro: {
    '--lp-bg': '#000000',
    '--lp-surface': '#0a0a0a',
    '--lp-surface-hover': '#1a1a1a',
    '--lp-surface-alt': '#0f0f0f',
    
    '--lp-text': '#ffffff',
    '--lp-text-muted': '#9ca3af',
    '--lp-text-inverse': '#000000',
    
    '--lp-primary': '#3b82f6',
    '--lp-primary-end': '#06b6d4',
    '--lp-primary-contrast': '#ffffff',
    
    '--lp-accent': '#22d3ee',
    '--lp-accent-hover': '#67e8f9',
    '--lp-accent-light': 'rgba(34, 211, 238, 0.2)',
    
    '--lp-border': '#27272a',
    '--lp-border-hover': 'rgba(59, 130, 246, 0.5)',
    
    '--lp-shadow': '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
    '--lp-glow': 'rgba(6, 182, 212, 0.3)',
    '--lp-shadow-cta': '0 20px 40px -10px rgba(6, 182, 212, 0.4)',
    
    '--lp-success': '#22c55e',
    '--lp-warning': '#ef4444',
  },

  // ============================================
  // WARM SUNSET - Black + Orange/Red
  // ============================================
  warm_sunset: {
    '--lp-bg': '#000000',
    '--lp-surface': '#0a0a0a',
    '--lp-surface-hover': '#1a1a1a',
    '--lp-surface-alt': '#0f0f0f',
    
    '--lp-text': '#ffffff',
    '--lp-text-muted': '#9ca3af',
    '--lp-text-inverse': '#000000',
    
    '--lp-primary': '#f97316',
    '--lp-primary-end': '#ef4444',
    '--lp-primary-contrast': '#ffffff',
    
    '--lp-accent': '#fb923c',
    '--lp-accent-hover': '#fdba74',
    '--lp-accent-light': 'rgba(251, 146, 60, 0.2)',
    
    '--lp-border': '#27272a',
    '--lp-border-hover': 'rgba(249, 115, 22, 0.5)',
    
    '--lp-shadow': '0 25px 50px -12px rgba(249, 115, 22, 0.25)',
    '--lp-glow': 'rgba(239, 68, 68, 0.3)',
    '--lp-shadow-cta': '0 20px 40px -10px rgba(249, 115, 22, 0.4)',
    
    '--lp-success': '#22c55e',
    '--lp-warning': '#fbbf24',
  },

  // ============================================
  // NATURE CLEAN - Dark + Green/Emerald
  // ============================================
  nature_clean: {
    '--lp-bg': '#030712',
    '--lp-surface': '#0a0a0a',
    '--lp-surface-hover': '#1a1a1a',
    '--lp-surface-alt': '#0f1611',
    
    '--lp-text': '#ffffff',
    '--lp-text-muted': '#9ca3af',
    '--lp-text-inverse': '#000000',
    
    '--lp-primary': '#22c55e',
    '--lp-primary-end': '#10b981',
    '--lp-primary-contrast': '#ffffff',
    
    '--lp-accent': '#4ade80',
    '--lp-accent-hover': '#86efac',
    '--lp-accent-light': 'rgba(74, 222, 128, 0.2)',
    
    '--lp-border': '#27272a',
    '--lp-border-hover': 'rgba(34, 197, 94, 0.5)',
    
    '--lp-shadow': '0 25px 50px -12px rgba(34, 197, 94, 0.25)',
    '--lp-glow': 'rgba(16, 185, 129, 0.3)',
    '--lp-shadow-cta': '0 20px 40px -10px rgba(34, 197, 94, 0.4)',
    
    '--lp-success': '#22c55e',
    '--lp-warning': '#f59e0b',
  },

  // ============================================
  // ROYAL PURPLE - Dark + Purple/Pink
  // ============================================
  royal_purple: {
    '--lp-bg': '#030712',
    '--lp-surface': '#0a0a0a',
    '--lp-surface-hover': '#1a1a1a',
    '--lp-surface-alt': '#0f0a14',
    
    '--lp-text': '#ffffff',
    '--lp-text-muted': '#9ca3af',
    '--lp-text-inverse': '#000000',
    
    '--lp-primary': '#a855f7',
    '--lp-primary-end': '#ec4899',
    '--lp-primary-contrast': '#ffffff',
    
    '--lp-accent': '#c084fc',
    '--lp-accent-hover': '#d8b4fe',
    '--lp-accent-light': 'rgba(192, 132, 252, 0.2)',
    
    '--lp-border': '#27272a',
    '--lp-border-hover': 'rgba(168, 85, 247, 0.5)',
    
    '--lp-shadow': '0 25px 50px -12px rgba(168, 85, 247, 0.25)',
    '--lp-glow': 'rgba(236, 72, 153, 0.3)',
    '--lp-shadow-cta': '0 20px 40px -10px rgba(168, 85, 247, 0.4)',
    
    '--lp-success': '#22c55e',
    '--lp-warning': '#f43f5e',
  },

  // ============================================
  // OCEAN DEEP - Slate + Teal/Cyan
  // ============================================
  ocean_deep: {
    '--lp-bg': '#020617',
    '--lp-surface': '#0f172a',
    '--lp-surface-hover': '#1e293b',
    '--lp-surface-alt': '#0c1220',
    
    '--lp-text': '#ffffff',
    '--lp-text-muted': '#94a3b8',
    '--lp-text-inverse': '#000000',
    
    '--lp-primary': '#14b8a6',
    '--lp-primary-end': '#06b6d4',
    '--lp-primary-contrast': '#ffffff',
    
    '--lp-accent': '#2dd4bf',
    '--lp-accent-hover': '#5eead4',
    '--lp-accent-light': 'rgba(45, 212, 191, 0.2)',
    
    '--lp-border': '#334155',
    '--lp-border-hover': 'rgba(20, 184, 166, 0.5)',
    
    '--lp-shadow': '0 25px 50px -12px rgba(20, 184, 166, 0.25)',
    '--lp-glow': 'rgba(6, 182, 212, 0.3)',
    '--lp-shadow-cta': '0 20px 40px -10px rgba(20, 184, 166, 0.4)',
    
    '--lp-success': '#22c55e',
    '--lp-warning': '#f59e0b',
  },

  // ============================================
  // FEMININE PURPLE - Original 12D colors
  // ============================================
  feminine_purple: {
    '--lp-bg': '#1a1a2e',
    '--lp-surface': '#16213e',
    '--lp-surface-hover': '#1f2937',
    '--lp-surface-alt': '#1e1e3f',
    
    '--lp-text': '#ffffff',
    '--lp-text-muted': '#d1d5db',
    '--lp-text-inverse': '#000000',
    
    '--lp-primary': '#9F56CB',
    '--lp-primary-end': '#F988E7',
    '--lp-primary-contrast': '#ffffff',
    
    '--lp-accent': '#f472b6',
    '--lp-accent-hover': '#f9a8d4',
    '--lp-accent-light': 'rgba(244, 114, 182, 0.2)',
    
    '--lp-border': '#4c1d95',
    '--lp-border-hover': 'rgba(159, 86, 203, 0.5)',
    
    '--lp-shadow': '0 25px 50px -12px rgba(159, 86, 203, 0.25)',
    '--lp-glow': 'rgba(249, 136, 231, 0.3)',
    '--lp-shadow-cta': '0 20px 40px -10px rgba(159, 86, 203, 0.4)',
    
    '--lp-success': '#22c55e',
    '--lp-warning': '#f472b6',
  },
};

/**
 * Theme metadata for UI selectors
 */
export const themesMeta: LPThemeMeta[] = [
  {
    id: 'midnight_pro',
    name: 'Midnight Pro',
    description: 'Tecnológico e futurista',
    idealFor: 'Serviços premium, tecnologia',
  },
  {
    id: 'warm_sunset',
    name: 'Warm Sunset',
    description: 'Urgência e energia',
    idealFor: 'Promoções, vendas rápidas',
  },
  {
    id: 'nature_clean',
    name: 'Nature Clean',
    description: 'Orgânico e natural',
    idealFor: 'Limpeza ecológica, saúde',
  },
  {
    id: 'royal_purple',
    name: 'Royal Purple',
    description: 'Luxo e exclusividade',
    idealFor: 'Serviços VIP, alto padrão',
  },
  {
    id: 'ocean_deep',
    name: 'Ocean Deep',
    description: 'Confiança e profundidade',
    idealFor: 'Serviços tradicionais',
  },
  {
    id: 'feminine_purple',
    name: 'Feminine Purple',
    description: 'Delicado e empoderador',
    idealFor: 'Produtos femininos, coaches',
  },
];

/**
 * Get theme tokens by ID with fallback
 */
export const getThemeTokens = (themeId?: LPThemeId | string): LPThemeTokens => {
  if (themeId && themeId in themes) {
    return themes[themeId as LPThemeId];
  }
  return themes.midnight_pro;
};

/**
 * Convert theme tokens to React CSSProperties for inline styles
 */
export const getThemeStyle = (themeId?: LPThemeId | string): React.CSSProperties => {
  const tokens = getThemeTokens(themeId);
  return tokens as unknown as React.CSSProperties;
};

/**
 * Get theme metadata by ID
 */
export const getThemeMeta = (themeId?: LPThemeId | string): LPThemeMeta => {
  const meta = themesMeta.find(t => t.id === themeId);
  return meta || themesMeta[0];
};

/**
 * Map legacy theme IDs (from lp-themes.ts) to new IDs
 */
export const legacyThemeMap: Record<string, LPThemeId> = {
  'midnight': 'midnight_pro',
  'sunset': 'warm_sunset',
  'nature': 'nature_clean',
  'royal': 'royal_purple',
  'ocean': 'ocean_deep',
  'feminine': 'feminine_purple',
};

/**
 * Resolve theme ID from legacy or new format
 */
export const resolveThemeId = (themeId?: string): LPThemeId => {
  if (!themeId) return 'midnight_pro';
  if (themeId in themes) return themeId as LPThemeId;
  if (themeId in legacyThemeMap) return legacyThemeMap[themeId];
  return 'midnight_pro';
};
