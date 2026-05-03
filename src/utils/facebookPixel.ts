import { supabase } from '@/integrations/supabase/client';
import { getOrCreateLiveSessionId } from '@/utils/liveSession';
import { getAttributionParams } from '@/utils/attribution';

// Declare fbq globally
declare global {
  interface Window {
    fbq?: (action: string, eventName: string, data?: any) => void;
  }
}

// Função auxiliar para obter session_id (unificado com useSessionTracking)
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  return getOrCreateLiveSessionId();
};

// Legacy re-exports for backward compatibility
export { getAttributionParams as getUtmParams } from '@/utils/attribution';
export { persistAttributionParams as persistUtmParams } from '@/utils/attribution';

// Função auxiliar para enviar evento para backend local
const trackLocalEvent = async (eventType: string, eventData: any) => {
  try {
    const sessionId = getSessionId();
    const attribution = getAttributionParams();

    await supabase.functions.invoke('track-pixel-event', {
      body: {
        event_type: eventType,
        event_data: {
          ...eventData,
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
          utm_campaign: attribution.utm_campaign,
          utm_content: attribution.utm_content,
          utm_term: attribution.utm_term,
        },
        session_id: sessionId,
        page_url: window.location.href,
        referrer: attribution.referrer || document.referrer || '',
        // NEW: gclid, fbclid, landing_page sent as top-level fields
        gclid: attribution.gclid || null,
        fbclid: attribution.fbclid || null,
        landing_page: attribution.landing_page || null,
      },
      headers: {
        'x-session-id': sessionId,
      },
    });
  } catch (error) {
    console.error('Erro ao salvar evento local:', error);
  }
};

// SPA PageView — disparar em mudanças de rota
export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
  trackLocalEvent('PageView', {
    page_url: window.location.href,
    page_path: window.location.pathname,
  });
};

export const trackAddToCart = (item: { id: string; name: string; price: number; quantity: number }) => {
  const eventData = {
    content_ids: [item.id],
    content_name: item.name,
    content_type: 'product',
    value: item.price * item.quantity,
    currency: 'BRL',
    num_items: item.quantity,
  };

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', eventData);
  }

  trackLocalEvent('AddToCart', eventData);
};

export const trackInitiateCheckout = (items: any[], total: number) => {
  const eventData = {
    content_ids: items.map(item => item.id),
    content_type: 'product',
    contents: items.map(item => ({
      id: item.id,
      quantity: item.quantity,
    })),
    value: total,
    currency: 'BRL',
    num_items: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
  };

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', eventData);
  }

  trackLocalEvent('InitiateCheckout', eventData);
};

export const trackPurchase = (orderCode: string, total: number, items: any[]) => {
  const attribution = getAttributionParams();

  const eventData = {
    content_ids: items.map(item => item.id),
    content_type: 'product',
    contents: items.map(item => ({
      id: item.id,
      quantity: item.quantity,
    })),
    value: total,
    currency: 'BRL',
    num_items: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    order_id: orderCode,
  };

  if (typeof window !== 'undefined' && window.fbq) {
    // FIX #3: Include fbclid in Meta Pixel Purchase for click-to-conversion matching
    window.fbq('track', 'Purchase', {
      ...eventData,
      ...(attribution.fbclid ? { fbclid: attribution.fbclid } : {}),
    });
  }

  trackLocalEvent('Purchase', eventData);
};

export const trackViewContent = (category: 'services' | 'rental', contentName: string) => {
  const attribution = getAttributionParams();

  const eventData = {
    content_name: contentName,
    content_category: category,
    content_type: 'category',
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    utm_term: attribution.utm_term,
  };

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', eventData);
  }

  trackLocalEvent('ViewContent', eventData);
};
