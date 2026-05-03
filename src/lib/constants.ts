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
