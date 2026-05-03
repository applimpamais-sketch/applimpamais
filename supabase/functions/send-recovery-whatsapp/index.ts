import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ULTRAMSG_INSTANCE_ID = Deno.env.get('ULTRAMSG_INSTANCE_ID');
const ULTRAMSG_TOKEN = Deno.env.get('ULTRAMSG_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  telefone: string;
  mensagem: string;
  carrinhoId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telefone, mensagem, carrinhoId }: RequestBody = await req.json();

    console.log('📱 Enviando WhatsApp de recuperação para:', telefone);
    console.log('Carrinho ID:', carrinhoId);

    // Validar inputs
    if (!telefone || !mensagem) {
      throw new Error('Telefone e mensagem são obrigatórios');
    }

    if (!ULTRAMSG_INSTANCE_ID || !ULTRAMSG_TOKEN) {
      throw new Error('Credenciais do WhatsApp não configuradas');
    }

    // Limpar telefone (remover caracteres não numéricos)
    const telefoneLimpo = telefone.replace(/\D/g, '');
    
    // Adicionar código do país se não tiver
    const telefoneCompleto = telefoneLimpo.startsWith('55') 
      ? telefoneLimpo 
      : `55${telefoneLimpo}`;

    console.log('Telefone formatado:', telefoneCompleto);

    // Enviar mensagem via UltraMsg API
    const ultramsgUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`;
    
    const ultramsgResponse = await fetch(ultramsgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: ULTRAMSG_TOKEN,
        to: telefoneCompleto,
        body: mensagem,
      }),
    });

    const ultramsgData = await ultramsgResponse.json();

    console.log('Resposta UltraMsg:', ultramsgData);

    if (!ultramsgResponse.ok) {
      console.error('Erro ao enviar WhatsApp:', ultramsgData);
      throw new Error(`Erro ao enviar WhatsApp: ${JSON.stringify(ultramsgData)}`);
    }

    console.log('✅ WhatsApp enviado com sucesso!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'WhatsApp enviado com sucesso',
        carrinhoId,
        ultramsgResponse: ultramsgData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erro:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
