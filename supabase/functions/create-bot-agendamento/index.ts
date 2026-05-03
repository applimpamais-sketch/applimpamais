import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = requestCounts.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 30) { // More restrictive for POST
    return false;
  }
  
  limit.count++;
  return true;
}

// Schema de validação
const agendamentoBotSchema = z.object({
  nome_cliente: z.string().min(3),
  telefone: z.string().min(10),
  email: z.string().email().optional(),
  endereco: z.string().min(5),
  bairro: z.string().min(2),
  cidade: z.string().min(2),
  cep: z.string().optional(),
  data_agendamento: z.string(), // ISO date
  horario: z.string().optional(),
  itens_carrinho: z.array(z.object({
    id: z.string(),
    name: z.string(),
    details: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1),
  valor_total: z.number().positive(),
  observacoes: z.string().optional(),
  conversa_id: z.string().uuid().optional(),
});

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

    // Parse and validate body
    const body = await req.json();
    const validatedData = agendamentoBotSchema.parse(body);

    // Gerar order_code único
    const orderCode = `BOT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Criar agendamento
    const { data: agendamento, error: insertError } = await supabase
      .from('agendamentos')
      .insert({
        nome_cliente: validatedData.nome_cliente,
        telefone: validatedData.telefone,
        endereco: validatedData.endereco,
        bairro: validatedData.bairro,
        cidade: validatedData.cidade,
        cep: validatedData.cep || null,
        data_agendamento: validatedData.data_agendamento,
        horario: validatedData.horario || null,
        itens_carrinho: validatedData.itens_carrinho,
        valor_total: validatedData.valor_total,
        status: 'pendente',
        origem: 'whatsapp_bot',
        order_code: orderCode,
        criado_manualmente: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating agendamento:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create appointment', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Se tem conversa_id, criar registro em agendamentos_bot
    if (validatedData.conversa_id) {
      await supabase
        .from('agendamentos_bot')
        .insert({
          agendamento_id: agendamento.id,
          conversa_id: validatedData.conversa_id,
          nome_cliente: validatedData.nome_cliente,
          telefone: validatedData.telefone,
          endereco_completo: validatedData.endereco,
          bairro: validatedData.bairro,
          cidade: validatedData.cidade,
          cep: validatedData.cep || null,
          data_desejada: validatedData.data_agendamento,
          horario_desejado: validatedData.horario || null,
          itens_selecionados: validatedData.itens_carrinho,
          valor_total: validatedData.valor_total,
          status: 'confirmado',
        });
    }

    console.log(`✅ Agendamento criado via bot: ${orderCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        agendamento: {
          id: agendamento.id,
          order_code: orderCode,
          nome_cliente: validatedData.nome_cliente,
          data_agendamento: validatedData.data_agendamento,
          valor_total: validatedData.valor_total,
          status: 'pendente',
        },
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.error('Error in create-bot-agendamento:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
