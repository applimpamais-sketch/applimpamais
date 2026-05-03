import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "../_shared/rateLimiter.ts";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";
import { HttpError, requireSuperAdmin } from "../_shared/auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const INVITES_FROM_EMAIL = Deno.env.get("INVITES_FROM_EMAIL") ?? "Limpamais <convite@notificacao.rclimpamais.com.br>";

interface CreateTenantAdminRequest {
  tenant_id: string;
  email: string;
  nome: string;
  nome_empresa: string;
  plano: string;
}

const getPlanoLabel = (plano: string) => {
  switch (plano) {
    case "starter": return "Starter";
    case "professional": return "Professional";
    case "enterprise": return "Enterprise";
    default: return plano;
  }
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightResponse(req);
  }

  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 5, windowMs: 60000 });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    const { adminClient: supabaseAdmin } = await requireSuperAdmin(req);
    const { tenant_id, email, nome, nome_empresa, plano }: CreateTenantAdminRequest = await req.json();

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        data: {
          nome_completo: nome,
          tenant_id,
        },
        redirectTo: `${origin || SITE_DOMAIN}/auth`,
      },
    });

    if (linkError || !linkData) {
      throw linkError || new Error("Falha ao gerar magic link");
    }

    const magicLink = linkData.properties?.action_link;
    const userId = linkData.user?.id;

    if (!magicLink || !userId) {
      throw new Error("Falha ao gerar convite válido");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { error: tenantUpdateError } = await supabaseAdmin
      .from("saas_tenants")
      .update({ responsavel_user_id: userId })
      .eq("id", tenant_id);

    if (tenantUpdateError) {
      throw tenantUpdateError;
    }

    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        tenant_id,
        nome_completo: nome,
      })
      .eq("id", userId);

    if (profileUpdateError) {
      console.error("[create-tenant-admin] Erro ao atualizar profile:", profileUpdateError);
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "admin",
        tenant_id,
      });

    if (roleError) {
      console.error("[create-tenant-admin] Erro ao criar role:", roleError);
    }

    await resend.emails.send({
      from: INVITES_FROM_EMAIL,
      to: [email],
      subject: "🎉 Bem-vindo à Limpamais - Seu acesso está pronto!",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo à Limpamais</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Bem-vindo à Limpamais! 🎉</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Olá <strong>${nome}</strong>,
                      </p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Sua empresa <strong>${nome_empresa}</strong> foi cadastrada com sucesso na nossa plataforma.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #0f766e;">
                            <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: 600;">Seu Plano</p>
                            <p style="color: #1f2937; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">${getPlanoLabel(plano)}</p>
                            <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">Acesso administrativo completo</p>
                          </td>
                        </tr>
                      </table>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding: 10px 0 30px 0;">
                            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              🔐 Acessar Minha Conta
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px;">
                        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                          ⚠️ <strong>Importante:</strong> Este link é válido por <strong>1 hora</strong> e só pode ser usado uma vez.
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return new Response(JSON.stringify({
      success: true,
      userId,
      message: "Admin criado e email enviado com sucesso",
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("[create-tenant-admin] Erro:", error);
    const status = error instanceof HttpError ? error.status : 500;

    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Erro ao criar admin do tenant",
    }), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
