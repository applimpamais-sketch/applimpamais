import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "../_shared/rateLimiter.ts";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const INVITES_FROM_EMAIL = Deno.env.get("INVITES_FROM_EMAIL") ?? "Limpamais <convite@notificacao.rclimpamais.com.br>";

interface InviteEmailRequest {
  name: string;
  email: string;
  magicLink: string;
  role: 'admin' | 'operador' | 'visualizador' | 'tecnico';
  tenantId?: string;
}

interface TenantBranding {
  nome_fantasia: string | null;
  nome_empresa: string;
  logo_url: string | null;
}

const getRoleDetails = (role: string) => {
  switch (role) {
    case 'admin':
      return {
        name: 'Administrador',
        description: 'Acesso total ao sistema, incluindo gerenciamento de equipe',
      };
    case 'operador':
      return {
        name: 'Operador',
        description: 'Gerenciar agendamentos, cupons e visualizar relatórios',
      };
    case 'visualizador':
      return {
        name: 'Visualizador',
        description: 'Apenas visualização de dados e relatórios',
      };
    case 'tecnico':
      return {
        name: 'Técnico',
        description: 'Visualizar e gerenciar serviços atribuídos',
      };
    default:
      return {
        name: role,
        description: 'Permissões personalizadas',
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightResponse(req);
  }

  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 5, windowMs: 60000 });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.resetAt);
    }

    const { name, email, magicLink, role, tenantId }: InviteEmailRequest = await req.json();
    const roleDetails = getRoleDetails(role);

    let tenantBranding: TenantBranding | null = null;

    if (tenantId && tenantId !== '00000000-0000-0000-0000-000000000001') {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.4");
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: tenant } = await supabase
          .from('saas_tenants')
          .select('nome_fantasia, nome_empresa, logo_url')
          .eq('id', tenantId)
          .single();

        if (tenant) {
          tenantBranding = tenant as TenantBranding;
        }
      }
    }

    const companyName = tenantBranding?.nome_fantasia || tenantBranding?.nome_empresa || 'Limpamais';
    const logoUrl = tenantBranding?.logo_url || `${SITE_DOMAIN}/icon-192x192.png`;

    await resend.emails.send({
      from: INVITES_FROM_EMAIL,
      to: [email],
      subject: `🎉 Você foi convidado para ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Convite ${companyName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                      <img src="${logoUrl}" alt="${companyName}" style="height: 60px; width: auto; margin-bottom: 20px;" />
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Bem-vindo à Equipe! 🎉</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Olá <strong>${name}</strong>,
                      </p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Você foi convidado para fazer parte da equipe <strong>${companyName}</strong>.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #0f766e;">
                            <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: 600;">Sua Função</p>
                            <p style="color: #1f2937; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">${roleDetails.name}</p>
                            <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">${roleDetails.description}</p>
                          </td>
                        </tr>
                      </table>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding: 10px 0 30px 0;">
                            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              🔐 Acessar Sistema Agora
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
      message: "Email de convite enviado com sucesso",
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("[send-team-invite] Erro ao enviar email:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Erro desconhecido ao enviar email",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
