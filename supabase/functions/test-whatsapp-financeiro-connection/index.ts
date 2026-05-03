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
    const ULTRAMSG_FINANCEIRO_INSTANCE_ID = Deno.env.get('ULTRAMSG_FINANCEIRO_INSTANCE_ID');
    const ULTRAMSG_FINANCEIRO_TOKEN = Deno.env.get('ULTRAMSG_FINANCEIRO_TOKEN');

    if (!ULTRAMSG_FINANCEIRO_INSTANCE_ID || !ULTRAMSG_FINANCEIRO_TOKEN) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Bot financeiro não configurado. Configure ULTRAMSG_FINANCEIRO_INSTANCE_ID e ULTRAMSG_FINANCEIRO_TOKEN.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar status da instância do UltraMsg
    const response = await fetch(
      `https://api.ultramsg.com/${ULTRAMSG_FINANCEIRO_INSTANCE_ID}/instance/status?token=${ULTRAMSG_FINANCEIRO_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`Erro ao conectar com UltraMsg: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('Status do bot financeiro UltraMsg:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: data.status,
        substatus: data.substatus,
        message: 'Conexão com bot financeiro verificada com sucesso!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro ao testar conexão do bot financeiro:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao testar conexão do bot financeiro';
    
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
