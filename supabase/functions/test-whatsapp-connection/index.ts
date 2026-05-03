import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ULTRAMSG_INSTANCE_ID = Deno.env.get('ULTRAMSG_INSTANCE_ID');
    const ULTRAMSG_TOKEN = Deno.env.get('ULTRAMSG_TOKEN');

    if (!ULTRAMSG_INSTANCE_ID || !ULTRAMSG_TOKEN) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Credenciais do UltraMsg não configuradas. Verifique as secrets ULTRAMSG_INSTANCE_ID e ULTRAMSG_TOKEN.',
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('🧪 Testando conexão com UltraMsg...');

    // Testar conexão com UltraMsg API
    const testUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/instance/status?token=${ULTRAMSG_TOKEN}`;
    
    const startTime = Date.now();
    const response = await fetch(testUrl, {
      method: 'GET',
    });
    const latency = Date.now() - startTime;

    const responseData = await response.json();

    console.log('📊 Resposta completa do UltraMsg:', JSON.stringify(responseData, null, 2));
    console.log(`⏱️ Latência: ${latency}ms`);

    if (response.ok) {
      // Função para extrair status de diferentes formatos de resposta
      const extractStatus = (data: any) => {
        // Tentar diferentes caminhos possíveis
        const statusObj = 
          data.status?.accountStatus || 
          data.accountStatus || 
          data.status;
        
        if (typeof statusObj === 'string') {
          return { status: statusObj, substatus: '' };
        }
        
        if (typeof statusObj === 'object' && statusObj !== null) {
          return {
            status: statusObj.status || 'unknown',
            substatus: statusObj.substatus || ''
          };
        }
        
        return { status: 'unknown', substatus: '' };
      };

      const { status: currentStatus, substatus } = extractStatus(responseData);
      
      console.log('🔍 Status extraído:', currentStatus);
      console.log('🔍 Substatus:', substatus);

      // Verificar se está autenticado
      const isActive = currentStatus === 'authenticated';

      // Criar mensagem formatada
      const statusMessage = isActive 
        ? `✅ Conexão OK! Instância ativa${substatus ? ` (${substatus})` : ''}. Latência: ${latency}ms`
        : `⚠️ Instância não autenticada. Status: ${currentStatus}${substatus ? ` (${substatus})` : ''}`;

      return new Response(
        JSON.stringify({
          success: true,
          message: statusMessage,
          data: {
            status: currentStatus,
            substatus: substatus,
            latency: `${latency}ms`,
            instanceId: ULTRAMSG_INSTANCE_ID,
            isActive,
            rawResponse: responseData,
          },
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: `❌ Erro ao conectar: ${responseData.error || 'Verifique suas credenciais'}`,
          data: {
            error: responseData,
            latency: `${latency}ms`,
          },
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
  } catch (error: any) {
    console.error('❌ Erro ao testar conexão:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro ao testar conexão: ${error.message}`,
        error: error.toString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
