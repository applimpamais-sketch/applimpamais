import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "../_shared/rateLimiter.ts";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ResendInviteRequest {
  tenant_id: string;
}

const getPlanoLabel = (plano: string) => {
  switch (plano) {
    case 'starter': return 'Starter';
    case 'professional': return 'Professional';
    case 'enterprise': return 'Enterprise';
    default: return plano;
  }
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightResponse(req);
  }

  try {
    // 🔒 SECURITY: Rate limiting - 3 requisições por minuto por IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 3, windowMs: 60000 });
    
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

    const { tenant_id }: ResendInviteRequest = await req.json();
    
    if (!tenant_id) {
      return new Response(
        JSON.stringify({ success: false, error: "tenant_id é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[resend-tenant-invite] Reenviando convite para tenant: ${tenant_id}`);

    // 1. Buscar dados do tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('saas_tenants')
      .select('*')
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      console.error(`[resend-tenant-invite] Tenant não encontrado:`, tenantError);
      return new Response(
        JSON.stringify({ success: false, error: "Tenant não encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verificar se tenant está em status válido para reenvio
    if (!['trial', 'ativo'].includes(tenant.status)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Não é possível reenviar convite para tenant com status "${tenant.status}"` 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const email = tenant.email_contato;
    const nome = tenant.responsavel_nome;
    const nome_empresa = tenant.nome_fantasia || tenant.nome_empresa;
    const plano = tenant.plano;

    console.log(`[resend-tenant-invite] Email: ${email}, Nome: ${nome}, Empresa: ${nome_empresa}`);

    // 2. Gerar novo Magic Link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        data: {
          nome_completo: nome,
          tenant_id: tenant_id,
        },
        redirectTo: `${origin || SITE_DOMAIN}/auth`
      }
    });

    if (linkError || !linkData) {
      console.error(`[resend-tenant-invite] Erro ao gerar magic link:`, linkError);
      throw linkError || new Error('Falha ao gerar magic link');
    }

    const magicLink = linkData.properties?.action_link;

    if (!magicLink) {
      throw new Error('Falha ao gerar magic link válido');
    }

    console.log(`[resend-tenant-invite] Novo magic link gerado com sucesso`);

    // 3. Enviar email de reenvio de convite
    const emailResponse = await resend.emails.send({
      from: "RC Limpa Mais <convite@notificacao.rclimpamais.com.br>",
      to: [email],
      subject: "🔑 Seu novo link de acesso está aqui!",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Novo Link de Acesso</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Novo Link de Acesso 🔑</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Olá <strong>${nome}</strong>,
                      </p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Geramos um novo link de acesso para sua conta da empresa <strong>${nome_empresa}</strong>.
                      </p>
                      
                      <!-- Plano Card -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #7c3aed;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="width: 50px; vertical-align: top;">
                                  <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 50%; text-align: center; line-height: 44px; font-size: 20px;">
                                    👑
                                  </div>
                                </td>
                                <td style="vertical-align: top; padding-left: 15px;">
                                  <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: 600;">Seu Plano</p>
                                  <p style="color: #1f2937; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">${getPlanoLabel(plano)}</p>
                                  <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">Acesso administrativo completo</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Info Card -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                        <tr>
                          <td style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; border-left: 4px solid #10b981;">
                            <p style="color: #065f46; font-size: 14px; margin: 0; line-height: 1.6;">
                              ✅ Este é um <strong>novo link</strong> gerado a seu pedido. O link anterior foi invalidado.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding: 10px 0 30px 0;">
                            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                              🔐 Acessar Minha Conta
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Warning -->
                      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                          ⚠️ <strong>Importante:</strong> Este link é válido por <strong>1 hora</strong> e só pode ser usado uma vez.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                        Esta é uma mensagem automática. Por favor, não responda a este email.
                      </p>
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Todos os direitos reservados
                      </p>
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

    console.log("[resend-tenant-invite] Email reenviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Convite reenviado com sucesso",
      email: email
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("[resend-tenant-invite] Erro:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Erro ao reenviar convite"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
