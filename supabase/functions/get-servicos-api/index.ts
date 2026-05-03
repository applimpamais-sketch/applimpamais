import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { HttpError } from '../_shared/auth.ts';
import { resolvePublicTenant } from '../_shared/publicTenant.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-tenant-id',
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
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const tenant = await resolvePublicTenant(supabase, req);
    const url = new URL(req.url);
    const categoria = url.searchParams.get('categoria');
    const subcategoria = url.searchParams.get('subcategoria');

    let query = supabase
      .from('servicos')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('categoria', { ascending: true })
      .order('subcategoria', { ascending: true })
      .order('item', { ascending: true });

    if (categoria) {
      query = query.ilike('categoria', categoria);
    }
    if (subcategoria) {
      query = query.ilike('subcategoria', subcategoria);
    }

    const { data, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch services' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: data.length,
        tenant_id: tenant.id,
        data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in get-servicos-api:', error);
    const status = error instanceof HttpError ? error.status : 500;

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
