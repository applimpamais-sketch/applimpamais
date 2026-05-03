/**
 * Constantes centralizadas da aplicação.
 */

const DEFAULT_SITE_DOMAIN = 'https://app.limpamais.com';
const configuredSiteDomain = import.meta.env.VITE_PUBLIC_SITE_URL || DEFAULT_SITE_DOMAIN;

export const WHATSAPP_BOT = {
  numero: import.meta.env.VITE_PUBLIC_WHATSAPP_NUMBER || '',
  waLink: (texto?: string) => {
    const numero = import.meta.env.VITE_PUBLIC_WHATSAPP_NUMBER || '';
    return numero
      ? `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`
      : configuredSiteDomain;
  },
};

export const SITE_DOMAIN = configuredSiteDomain.replace(/\/$/, '');

export const PLATFORM_NAME = import.meta.env.VITE_PUBLIC_PLATFORM_NAME || 'Limpamais';
export const SUPPORT_EMAIL = import.meta.env.VITE_PUBLIC_SUPPORT_EMAIL || 'suporte@limpamais.com';
export const SUPPORT_PHONE = import.meta.env.VITE_PUBLIC_SUPPORT_PHONE || '';
export const SUPPORT_PHONE_DIGITS = SUPPORT_PHONE.replace(/\D/g, '');

