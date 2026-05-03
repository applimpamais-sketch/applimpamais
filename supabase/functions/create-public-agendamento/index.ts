import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// CORS headers inline
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Rate limiter inline simples
const requestCounts = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const timestamps = requestCounts.get(ip) || [];
  const recent = timestamps.filter(t => now - t < windowMs);
  
  if (recent.length >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: recent[0] + windowMs };
  }
  
  recent.push(now);
  requestCounts.set(ip, recent);
  return { allowed: true, remaining: maxRequests - recent.length, resetAt: now + windowMs };
}

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
         req.headers.get('x-real-ip') || 'unknown';
}

// Schema Zod com regex corrigido
const itemCarrinhoSchema = z.object({
  id: z.string().max(100).optional(),
  name: z.string().max(200).optional(),
  nome: z.string().max(200).optional(),
  subcategoria: z.string().max(100).optional(),
  tamanho: z.string().max(50).optional(),
  quantity: z.number().int().min(1).max(100).optional(),
  quantidade: z.number().int().min(1).max(100).optional(),
  price: z.number().min(0).max(100000).optional(),
  preco: z.number().min(0).max(100000).optional(),
  serviceType: z.string().max(50).optional(),
  tipoServico: z.string().max(50).optional(),
}).passthrough();

const agendamentoSchema = z.object({
  nome_cliente: z.string()
    .min(3, "Nome muito curto")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s'\-.]+$/, "Nome inválido"),
  telefone: z.string()
    .regex(/^[0-9]{10,11}$/, "Telefone inválido"),
  endereco: z.string()
    .min(5, "Endereço muito curto")
    .max(200, "Endereço muito longo"),
  bairro: z.string().max(100).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  cep: z.string().regex(/^[0-9]{8}$/, "CEP inválido").optional().nullable(),
  data_agendamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  horario: z.string().max(50).optional().nullable(),
  itens_carrinho: z.array(itemCarrinhoSchema).min(1).max(50),
  valor_total: z.number().positive().max(1000000),
  cupom_codigo: z.string().max(50).optional().nullable(),
  cupom_desconto_percentual: z.number().min(0).max(100).optional().nullable(),
  valor_desconto: z.number().min(0).max(100000).optional().default(0),
  valor_frete: z.number().min(0).max(10000).optional().default(0),
  parceiro_codigo: z.string().max(50).optional().nullable(),
  canal_origem: z.string().max(50).optional().nullable(),
  forma_pagamento: z.enum(['cartao', 'pix', 'dinheiro']).optional().nullable(),
});

function sanitizeString(str: string): string {
  return str.replace(/<[^>]+>/g, '').replace(/[<>]/g, '').trim();
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp);
    
    if (!rateLimit.allowed) {
      console.warn(`⚠️ [${requestId}] Rate limit exceeded: ${clientIp}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Muitas requisições. Aguarde 1 minuto.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(`❌ [${requestId}] Missing env vars`);
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração do servidor ausente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();
    
    // Validação Zod
    let validatedData;
    try {
      validatedData = agendamentoSchema.parse(body);
    } catch (validationError) {
      console.error(`❌ [${requestId}] Validation error:`, validationError);
      const errors = validationError instanceof z.ZodError ? validationError.errors : [];
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados inválidos',
          details: errors.map(e => `${e.path.join('.')}: ${e.message}`),
          request_id: requestId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitizar dados
    const sanitizedData = {
      ...validatedData,
      nome_cliente: sanitizeString(validatedData.nome_cliente),
      endereco: sanitizeString(validatedData.endereco),
      bairro: validatedData.bairro ? sanitizeString(validatedData.bairro) : null,
      cidade: validatedData.cidade ? sanitizeString(validatedData.cidade) : null,
    };

    // Resolver tenant_id correto (buscar tenant ativo)
    const { data: tenantData } = await supabase
      .from('saas_tenants')
      .select('id')
      .eq('status', 'ativo')
      .neq('id', '00000000-0000-0000-0000-000000000001')
      .limit(1)
      .single();

    const tenantId = tenantData?.id;
    
    console.log(`📝 [${requestId}] Criando agendamento:`, {
      nome: sanitizedData.nome_cliente,
      telefone: sanitizedData.telefone,
      data: sanitizedData.data_agendamento,
      valor: sanitizedData.valor_total,
      cupom: sanitizedData.cupom_codigo,
      forma_pagamento: sanitizedData.forma_pagamento,
      tenant_id: tenantId,
    });

    // Validar cupom se existir
    if (sanitizedData.cupom_codigo) {
      const { data: cupomData, error: cupomError } = await supabase
        .from('cupons_desconto')
        .select('id, uso_atual, uso_maximo, status')
        .eq('codigo', sanitizedData.cupom_codigo)
        .single();

      if (cupomError || !cupomData || cupomData.status !== 'ativo') {
        console.warn(`⚠️ [${requestId}] Cupom inválido: ${sanitizedData.cupom_codigo}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Cupom inválido ou expirado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (cupomData.uso_maximo && cupomData.uso_atual >= cupomData.uso_maximo) {
        console.warn(`⚠️ [${requestId}] Cupom esgotado: ${sanitizedData.cupom_codigo}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Cupom esgotado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Incrementar uso do cupom
      await supabase.rpc('increment_cupom_uso', { cupom_id: cupomData.id });
    }

    // Inserir agendamento com tenant_id e forma_pagamento
    const { data, error } = await supabase
      .from("agendamentos")
      .insert([{
        ...sanitizedData,
        parceiro_codigo: sanitizedData.parceiro_codigo || null,
        canal_origem: sanitizedData.canal_origem || null,
        forma_pagamento: sanitizedData.forma_pagamento || null,
        tenant_id: tenantId,
        origem: "site",
        status: "pendente",
      }])
      .select()
      .single();

    if (error) {
      console.error(`❌ [${requestId}] Insert error:`, error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao criar agendamento',
          hint: error.hint,
          request_id: requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Registrar histórico de criação
    await supabase.from('historico_agendamentos').insert({
      agendamento_id: data.id,
      tipo_alteracao: 'agendamento_criado',
      valor_novo: 'Criado pelo cliente via site',
      tenant_id: tenantId,
    });

    console.log(`✅ [${requestId}] Agendamento criado: ${data.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        agendamento: { ...data, orderCode: data.order_code },
        request_id: requestId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`❌ [${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno',
        details: error instanceof Error ? error.message : String(error),
        request_id: requestId
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
