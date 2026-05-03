import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "../_shared/rateLimiter.ts";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

interface CreateMemberRequest {
  email: string;
  nome_completo: string;
  role: 'admin' | 'operador' | 'visualizador';
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightResponse(req);
  }

  try {
    // 🔒 SECURITY: Rate limiting - 10 requisições por minuto por IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 10, windowMs: 60000 });
    
    if (!rateLimit.allowed) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${clientIp}`);
      return createRateLimitResponse(rateLimit.resetAt);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, nome_completo, role }: CreateMemberRequest = await req.json();
    
    console.log(`[create-team-member] Criando usuário: ${email} com role: ${role}`);
    console.log(`[create-team-member] Client IP: ${clientIp}, Remaining requests: ${rateLimit.remaining}`);

    // 🔒 SECURITY: Gerar Magic Link ao invés de senha temporária
    const redirectTo = `${Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '')}/auth/v1/verify`;
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        data: {
          nome_completo
        },
        redirectTo: `${req.headers.get('origin') || SITE_DOMAIN}/auth`
      }
    });

    if (linkError || !linkData) {
      console.error(`[create-team-member] Erro ao gerar magic link:`, linkError);
      throw linkError || new Error('Falha ao gerar magic link');
    }

    // Extrair informações do link gerado
    const magicLink = linkData.properties?.action_link || linkData.properties?.hashed_token;

    if (!magicLink) {
      throw new Error('Falha ao gerar magic link válido');
    }

    // Como estamos usando generateLink, o usuário já foi criado pelo Supabase
    // Precisamos buscar o user_id do email para criar a role
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error(`[create-team-member] Erro ao listar usuários:`, listError);
      throw listError;
    }

    const createdUser = users?.users?.find(u => u.email === email);
    
    if (!createdUser) {
      throw new Error('Usuário criado mas não encontrado');
    }

    console.log(`[create-team-member] Usuário encontrado com ID: ${createdUser.id}`);

    // Aguardar trigger criar profile
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Inserir role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: createdUser.id,
        role: role
      });

    if (roleError) {
      console.error(`[create-team-member] Erro ao criar role:`, roleError);
      throw roleError;
    }

    console.log(`[create-team-member] Role '${role}' atribuído com sucesso`);
    console.log(`[create-team-member] Magic link gerado com sucesso`);

    return new Response(JSON.stringify({ 
      success: true,
      userId: createdUser.id,
      magicLink: magicLink
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("[create-team-member] Erro:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Erro ao criar membro"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);