/**
 * Constantes centralizadas da aplicação
 */

export const WHATSAPP_BOT = {
  numero: '553194678382',
  waLink: (texto?: string) => 
    `https://wa.me/553194678382${texto ? `?text=${encodeURIComponent(texto)}` : ''}`
};

export const SITE_DOMAIN = 'https://rclimpamais.com.br';
