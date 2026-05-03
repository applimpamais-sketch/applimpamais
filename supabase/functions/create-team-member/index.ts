import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "../_shared/rateLimiter.ts";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";
import { HttpError, requireTenantAdmin } from "../_shared/auth.ts";

interface CreateMemberRequest {
  email: string;
  nome_completo: string;
  role: "admin" | "operador" | "visualizador";
  tenant_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightResponse(req);
  }

  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 10, windowMs: 60000 });

    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return createRateLimitResponse(rateLimit.resetAt);
    }

    const payload: CreateMemberRequest = await req.json();
    const { email, nome_completo, role, tenant_id } = payload;
    const { adminClient: supabaseAdmin, effectiveTenantId } = await requireTenantAdmin(req, tenant_id);

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        data: {
          nome_completo,
          tenant_id: effectiveTenantId,
        },
        redirectTo: `${origin || SITE_DOMAIN}/auth`,
      },
    });

    if (linkError || !linkData) {
      throw linkError || new Error("Falha ao gerar magic link");
    }

    const magicLink = linkData.properties?.action_link || linkData.properties?.hashed_token;
    const createdUserId = linkData.user?.id;

    if (!magicLink || !createdUserId) {
      throw new Error("Falha ao gerar convite válido");
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        tenant_id: effectiveTenantId,
        nome_completo,
      })
      .eq("id", createdUserId);

    if (profileError) {
      throw profileError;
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: createdUserId,
        role,
        tenant_id: effectiveTenantId,
      });

    if (roleError) {
      throw roleError;
    }

    return new Response(JSON.stringify({
      success: true,
      userId: createdUserId,
      tenantId: effectiveTenantId,
      magicLink,
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
    const status = error instanceof HttpError ? error.status : 500;

    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Erro ao criar membro",
    }), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
