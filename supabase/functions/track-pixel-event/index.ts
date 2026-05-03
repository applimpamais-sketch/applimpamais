import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { checkRateLimit, getClientIp, createRateLimitResponse } from '../_shared/rateLimiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PixelEventRequest {
  event_type: 'PageView' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'ViewContent';
  event_data: {
    value?: number;
    content_name?: string;
    content_type?: string;
    content_category?: string;
    contents?: any[];
    num_items?: number;
    order_id?: string;
    currency?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  session_id?: string;
  page_url?: string;
  referrer?: string;
  gclid?: string | null;
  fbclid?: string | null;
  landing_page?: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting: 20 requests por minuto por IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, { maxRequests: 20, windowMs: 60000 });
  
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetAt);
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const requestBody: PixelEventRequest = await req.json();
    const { event_type, event_data, session_id, page_url, referrer, gclid, fbclid, landing_page } = requestBody;

    // Validação básica
    if (!event_type || !['PageView', 'AddToCart', 'InitiateCheckout', 'Purchase', 'ViewContent'].includes(event_type)) {
      return new Response(
        JSON.stringify({ error: 'Tipo de evento inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extrair metadados do request
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';

    // Detectar device type e browser básico
    const deviceType = /mobile/i.test(userAgent) ? 'mobile' : /tablet/i.test(userAgent) ? 'tablet' : 'desktop';
    const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                    userAgent.includes('Firefox') ? 'Firefox' : 
                    userAgent.includes('Safari') ? 'Safari' : 
                    userAgent.includes('Edge') ? 'Edge' : 'Other';

    // Preparar dados para inserção
    const pixelEvent = {
      event_type,
      session_id,
      user_agent: userAgent,
      page_url,
      referrer,
      value: event_data.value,
      currency: event_data.currency || 'BRL',
      content_name: event_data.content_name,
      content_type: event_data.content_type,
      contents: event_data.contents,
      num_items: event_data.num_items,
      order_id: event_data.order_id,
      device_type: deviceType,
      browser,
      ip_address: ipAddress,
      event_time: new Date().toISOString(),
      // Attribution fields
      gclid: gclid || null,
      fbclid: fbclid || null,
      landing_page: landing_page || null,
      utm_source: event_data.utm_source || null,
      utm_medium: event_data.utm_medium || null,
      utm_campaign: event_data.utm_campaign || null,
      utm_content: event_data.utm_content || null,
      utm_term: event_data.utm_term || null,
    };

    // Inserir no banco
    const { data, error } = await supabaseClient
      .from('pixel_events')
      .insert(pixelEvent)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar evento:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar evento', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Evento ${event_type} salvo com sucesso:`, data.id);

    return new Response(
      JSON.stringify({ success: true, event_id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no processamento:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
