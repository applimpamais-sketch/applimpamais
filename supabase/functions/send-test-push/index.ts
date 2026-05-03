const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Enviando notificação de teste...');

    // Chamar a função de envio de push existente com dados de teste
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          tipo: 'test',
          agendamento: {
            nome_cliente: 'Teste do Sistema',
            valor_total: 0,
            data_agendamento: new Date().toISOString()
          }
        })
      }
    );

    const responseData = await response.json();
    console.log('📊 Resposta da função send-push-notification:', responseData);

    if (!response.ok) {
      console.error('❌ Erro na resposta:', response.status, response.statusText);
      throw new Error(`Failed to send test notification: ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    console.log('✅ Notificação de teste enviada com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notificação de teste enviada com sucesso!',
        details: responseData
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de teste:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro ao enviar notificação de teste',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
