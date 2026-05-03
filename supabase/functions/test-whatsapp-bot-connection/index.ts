import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ULTRAMSG_BOT_INSTANCE_ID = Deno.env.get('ULTRAMSG_BOT_INSTANCE_ID');
    const ULTRAMSG_BOT_TOKEN = Deno.env.get('ULTRAMSG_BOT_TOKEN');

    if (!ULTRAMSG_BOT_INSTANCE_ID || !ULTRAMSG_BOT_TOKEN) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Bot não configurado. Configure ULTRAMSG_BOT_INSTANCE_ID e ULTRAMSG_BOT_TOKEN nos secrets.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Testando conexão UltraMSG Bot...');
    
    // Verificar status da instância do UltraMsg
    const startTime = Date.now();
    const response = await fetch(
      `https://api.ultramsg.com/${ULTRAMSG_BOT_INSTANCE_ID}/instance/status?token=${ULTRAMSG_BOT_TOKEN}`
    );
    const latency = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Erro ao conectar com UltraMsg: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Status do bot UltraMsg:', JSON.stringify(data));
    console.log(`⏱️ Latência: ${latency}ms`);

    // Extrair status corretamente da resposta aninhada
    const accountStatus = data.status?.accountStatus || data.accountStatus || data;
    const currentStatus = accountStatus?.status || accountStatus;
    const currentSubstatus = accountStatus?.substatus || '';
    
    const isConnected = currentStatus === 'authenticated' && currentSubstatus === 'connected';

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: currentStatus,
        substatus: currentSubstatus,
        connected: isConnected,
        latency: `${latency}ms`,
        instanceId: ULTRAMSG_BOT_INSTANCE_ID,
        message: isConnected 
          ? '✅ Bot conectado e funcionando!' 
          : `⚠️ Bot não está totalmente conectado. Status: ${currentStatus} (${currentSubstatus})`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro ao testar conexão do bot:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao testar conexão do bot';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
