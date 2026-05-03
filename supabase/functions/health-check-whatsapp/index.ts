import { createClient } from "npm:@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const results: any[] = [];

  // Check both instances in parallel
  const checks = [
    {
      type: 'bot',
      instanceId: Deno.env.get('ULTRAMSG_BOT_INSTANCE_ID'),
      token: Deno.env.get('ULTRAMSG_BOT_TOKEN'),
    },
    {
      type: 'financeiro',
      instanceId: Deno.env.get('ULTRAMSG_INSTANCE_ID'),
      token: Deno.env.get('ULTRAMSG_TOKEN'),
    },
  ];

  const promises = checks.map(async (check) => {
    if (!check.instanceId || !check.token) {
      return {
        instance_type: check.type,
        instance_id: null,
        status: 'not_configured',
        substatus: null,
        latency_ms: 0,
        is_healthy: false,
        error_message: 'Credenciais não configuradas',
      };
    }

    try {
      const startTime = Date.now();
      const response = await fetch(
        `https://api.ultramsg.com/${check.instanceId}/instance/status?token=${check.token}`
      );
      const latency = Date.now() - startTime;

      if (!response.ok) {
        return {
          instance_type: check.type,
          instance_id: check.instanceId,
          status: 'error',
          substatus: null,
          latency_ms: latency,
          is_healthy: false,
          error_message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const accountStatus = data.status?.accountStatus || data.accountStatus || data;
      const currentStatus = accountStatus?.status || accountStatus;
      const currentSubstatus = accountStatus?.substatus || '';
      const isHealthy = currentStatus === 'authenticated' && currentSubstatus === 'connected';

      return {
        instance_type: check.type,
        instance_id: check.instanceId,
        status: currentStatus,
        substatus: currentSubstatus,
        latency_ms: latency,
        is_healthy: isHealthy,
        error_message: null,
      };
    } catch (error) {
      return {
        instance_type: check.type,
        instance_id: check.instanceId,
        status: 'error',
        substatus: null,
        latency_ms: 0,
        is_healthy: false,
        error_message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  });

  const checkResults = await Promise.all(promises);

  // Insert results into DB
  const { error: insertError } = await supabase
    .from('whatsapp_health_checks')
    .insert(checkResults);

  if (insertError) {
    console.error('Erro ao salvar health check:', insertError);
  }

  // Cleanup: remove records older than 7 days
  await supabase
    .from('whatsapp_health_checks')
    .delete()
    .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  console.log('🏥 Health check concluído:', JSON.stringify(checkResults.map(r => ({
    type: r.instance_type,
    healthy: r.is_healthy,
    status: r.status,
  }))));

  return new Response(
    JSON.stringify({ success: true, checks: checkResults }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
