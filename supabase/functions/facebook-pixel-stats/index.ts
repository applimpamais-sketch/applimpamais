import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PixelEvent {
  id: string;
  eventType: 'PageView' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';
  timestamp: string;
  value?: number;
  productName?: string;
}

interface PixelStats {
  pageViews: number;
  addToCart: number;
  initiateCheckout: number;
  purchases: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  totalRevenue: number;
}

interface PixelTrendData {
  date: string;
  PageView: number;
  AddToCart: number;
  InitiateCheckout: number;
  Purchase: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { period = '7d' } = await req.json().catch(() => ({ period: '7d' }));

    // Calcular timestamps baseado no período
    const endTime = new Date();
    let startTime: Date;

    switch (period) {
      case '24h':
        startTime = new Date(endTime.getTime() - (24 * 60 * 60 * 1000));
        break;
      case '30d':
        startTime = new Date(endTime.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case '7d':
      default:
        startTime = new Date(endTime.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
    }

    console.log(`Buscando eventos locais para período: ${period}`);
    console.log(`Start: ${startTime.toISOString()}`);
    console.log(`End: ${endTime.toISOString()}`);

    // Buscar eventos do banco local
    const { data: events, error: eventsError } = await supabaseClient
      .from('pixel_events')
      .select('*')
      .gte('event_time', startTime.toISOString())
      .lte('event_time', endTime.toISOString())
      .order('event_time', { ascending: false });

    if (eventsError) {
      console.error('Erro ao buscar eventos:', eventsError);
      return new Response(
        JSON.stringify({
          error: 'Erro ao buscar eventos do banco',
          details: eventsError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Total de eventos encontrados: ${events?.length || 0}`);

    // Processar eventos e calcular estatísticas
    const eventCounts: Record<string, { count: number; value: number }> = {
      'PageView': { count: 0, value: 0 },
      'ViewContent': { count: 0, value: 0 },
      'AddToCart': { count: 0, value: 0 },
      'InitiateCheckout': { count: 0, value: 0 },
      'Purchase': { count: 0, value: 0 },
    };

    events?.forEach((event: any) => {
      if (eventCounts[event.event_type]) {
        eventCounts[event.event_type].count++;
        eventCounts[event.event_type].value += event.value || 0;
      }
    });

    // Calcular estatísticas
    const stats: PixelStats = {
      pageViews: eventCounts['PageView'].count + eventCounts['ViewContent'].count,
      addToCart: eventCounts['AddToCart'].count,
      initiateCheckout: eventCounts['InitiateCheckout'].count,
      purchases: eventCounts['Purchase'].count,
      totalRevenue: eventCounts['Purchase'].value,
      conversionRate: eventCounts['PageView'].count > 0 
        ? ((eventCounts['Purchase'].count / eventCounts['PageView'].count) * 100)
        : 0,
      cartAbandonmentRate: eventCounts['AddToCart'].count > 0
        ? (((eventCounts['AddToCart'].count - eventCounts['Purchase'].count) / eventCounts['AddToCart'].count) * 100)
        : 0,
    };

    // Gerar dados de tendência agregados por dia
    const trendData: PixelTrendData[] = [];
    const daysInPeriod = period === '24h' ? 1 : period === '7d' ? 7 : 30;
    
    for (let i = 0; i < daysInPeriod; i++) {
      const dayStart = new Date(endTime.getTime() - (i * 24 * 60 * 60 * 1000));
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000));
      
      const dayEvents = events?.filter((e: any) => {
        const eventTime = new Date(e.event_time);
        return eventTime >= dayStart && eventTime < dayEnd;
      }) || [];

      const dayCounts = {
        PageView: 0,
        AddToCart: 0,
        InitiateCheckout: 0,
        Purchase: 0,
      };

      dayEvents.forEach((event: any) => {
        if (dayCounts[event.event_type as keyof typeof dayCounts] !== undefined) {
          dayCounts[event.event_type as keyof typeof dayCounts]++;
        }
      });

      trendData.unshift({
        date: dayStart.toISOString().split('T')[0],
        ...dayCounts,
      });
    }

    // Preparar últimos eventos para exibição
    const recentEvents = (events?.slice(0, 50) || []).map((event: any) => ({
      id: event.id,
      type: event.event_type as 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase',
      timestamp: event.event_time,
      value: event.value,
      product: event.content_name,
    }));

    const result = {
      stats,
      trendData,
      events: recentEvents,
      lastUpdate: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao processar request:', error);
    return new Response(
      JSON.stringify({
        error: 'Erro interno ao processar dados',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
