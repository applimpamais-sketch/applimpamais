import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = requestCounts.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 60) {
    return false;
  }
  
  limit.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('x-api-key');
    const validApiKey = Deno.env.get('BOT_API_KEY');
    
    if (!apiKey || apiKey !== validApiKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API Key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse query params
    const url = new URL(req.url);
    const diasFuturos = parseInt(url.searchParams.get('dias') || '60', 10);

    const hoje = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + diasFuturos);

    const { data, error } = await supabase
      .from('calendario_disponibilidade')
      .select('*')
      .gte('data', hoje.toISOString().split('T')[0])
      .lte('data', dataFim.toISOString().split('T')[0])
      .gt('vagas_disponiveis', 0)
      .order('data', { ascending: true });

    if (error) {
      console.error('Error fetching disponibilidade:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch availability' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ API: Retornadas ${data.length} datas disponíveis`);

    return new Response(
      JSON.stringify({
        success: true,
        count: data.length,
        data: data,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-disponibilidade-api:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
