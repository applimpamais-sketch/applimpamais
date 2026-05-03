import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { HttpError } from '../_shared/auth.ts';
import { resolvePublicTenant } from '../_shared/publicTenant.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const requestCounts = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const timestamps = requestCounts.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

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
  nome_cliente: z.string().min(3).max(100).regex(/^[a-zA-ZÀ-ÿ\s'\-.]+$/),
  telefone: z.string().regex(/^[0-9]{10,11}$/),
  endereco: z.string().min(5).max(200),
  bairro: z.string().max(100).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  cep: z.string().regex(/^[0-9]{8}$/).optional().nullable(),
  data_agendamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
  tenant_id: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
});

function sanitizeString(str: string): string {
  return str.replace(/<[^>]+>/g, '').replace(/[<>]/g, '').trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ success: false, error: 'Muitas requisições. Aguarde 1 minuto.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new HttpError(500, 'Configuração do servidor ausente');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();

    const validatedData = agendamentoSchema.parse(body);
    const sanitizedData = {
      ...validatedData,
      nome_cliente: sanitizeString(validatedData.nome_cliente),
      endereco: sanitizeString(validatedData.endereco),
      bairro: validatedData.bairro ? sanitizeString(validatedData.bairro) : null,
      cidade: validatedData.cidade ? sanitizeString(validatedData.cidade) : null,
    };

    const tenant = await resolvePublicTenant(supabase, req, body);
    const tenantId = tenant.id;

    if (sanitizedData.cupom_codigo) {
      const { data: cupomData, error: cupomError } = await supabase
        .from('cupons_desconto')
        .select('id, uso_atual, uso_maximo, status')
        .eq('codigo', sanitizedData.cupom_codigo)
        .eq('tenant_id', tenantId)
        .single();

      if (cupomError || !cupomData || cupomData.status !== 'ativo') {
        return new Response(
          JSON.stringify({ success: false, error: 'Cupom inválido ou expirado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      if (cupomData.uso_maximo && cupomData.uso_atual >= cupomData.uso_maximo) {
        return new Response(
          JSON.stringify({ success: false, error: 'Cupom esgotado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      await supabase.rpc('increment_cupom_uso', { cupom_id: cupomData.id });
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .insert([{
        ...sanitizedData,
        parceiro_codigo: sanitizedData.parceiro_codigo || null,
        canal_origem: sanitizedData.canal_origem || null,
        forma_pagamento: sanitizedData.forma_pagamento || null,
        tenant_id: tenantId,
        origem: 'site',
        status: 'pendente',
      }])
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erro ao criar agendamento',
          hint: error.hint,
          request_id: requestId,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    await supabase.from('historico_agendamentos').insert({
      agendamento_id: data.id,
      tipo_alteracao: 'agendamento_criado',
      valor_novo: 'Criado pelo cliente via site',
      tenant_id: tenantId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        agendamento: { ...data, orderCode: data.order_code },
        request_id: requestId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error(`[create-public-agendamento] Error ${requestId}:`, error);
    const status = error instanceof HttpError ? error.status : error instanceof z.ZodError ? 400 : 500;

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof z.ZodError ? 'Dados inválidos' : 'Erro interno',
        details: error instanceof z.ZodError
          ? error.errors.map((entry) => `${entry.path.join('.')}: ${entry.message}`)
          : error instanceof Error ? error.message : String(error),
        request_id: requestId,
      }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
