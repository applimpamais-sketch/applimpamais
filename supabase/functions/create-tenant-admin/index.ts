import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "../_shared/rateLimiter.ts";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface CreateTenantAdminRequest {
  tenant_id: string;
  email: string;
  nome: string;
  nome_empresa: string;
  plano: string;
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
    // 🔒 SECURITY: Rate limiting - 5 requisições por minuto por IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, { maxRequests: 5, windowMs: 60000 });
    
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

    const { tenant_id, email, nome, nome_empresa, plano }: CreateTenantAdminRequest = await req.json();
    
    console.log(`[create-tenant-admin] Criando admin para tenant: ${tenant_id}`);
    console.log(`[create-tenant-admin] Email: ${email}, Nome: ${nome}`);
    console.log(`[create-tenant-admin] Client IP: ${clientIp}, Remaining: ${rateLimit.remaining}`);

    // 1. Gerar Magic Link para o responsável
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
      console.error(`[create-tenant-admin] Erro ao gerar magic link:`, linkError);
      throw linkError || new Error('Falha ao gerar magic link');
    }

    const magicLink = linkData.properties?.action_link;
    const userId = linkData.user?.id;

    if (!magicLink || !userId) {
      throw new Error('Falha ao gerar magic link válido');
    }

    console.log(`[create-tenant-admin] Usuário criado com ID: ${userId}`);

    // 2. Aguardar trigger criar profile (aumentado para garantir)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Atualizar saas_tenants com responsavel_user_id
    const { error: tenantUpdateError } = await supabaseAdmin
      .from('saas_tenants')
      .update({ responsavel_user_id: userId })
      .eq('id', tenant_id);

    if (tenantUpdateError) {
      console.error(`[create-tenant-admin] Erro ao atualizar tenant:`, tenantUpdateError);
      throw tenantUpdateError;
    }

    console.log(`[create-tenant-admin] Tenant atualizado com responsavel_user_id`);

    // 4. Atualizar profile com tenant_id
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        tenant_id: tenant_id,
        nome_completo: nome
      })
      .eq('id', userId);

    if (profileUpdateError) {
      console.error(`[create-tenant-admin] Erro ao atualizar profile:`, profileUpdateError);
      // Não é crítico, continuar
    } else {
      console.log(`[create-tenant-admin] Profile atualizado com tenant_id`);
    }

    // 5. Atribuir role 'admin' ao usuário COM tenant_id explícito
    // CRÍTICO: Passar tenant_id explicitamente pois service_role não tem sessão de usuário
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin',
        tenant_id: tenant_id
      });

    if (roleError) {
      console.error(`[create-tenant-admin] Erro ao criar role:`, roleError);
      // Não é crítico, continuar
    } else {
      console.log(`[create-tenant-admin] Role 'admin' atribuído com sucesso`);
    }

    // 6. Enviar email de boas-vindas
    const emailResponse = await resend.emails.send({
      from: "RC Limpa Mais <convite@notificacao.rclimpamais.com.br>",
      to: [email],
      subject: "🎉 Bem-vindo à Plataforma - Seu acesso está pronto!",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo à Plataforma</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Bem-vindo à Plataforma! 🎉</h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Olá <strong>${nome}</strong>,
                      </p>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Sua empresa <strong>${nome_empresa}</strong> foi cadastrada com sucesso na nossa plataforma!
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
                      
                      <!-- Steps Card -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                        <tr>
                          <td style="background-color: #f9fafb; border-radius: 12px; padding: 25px;">
                            <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 20px 0;">🚀 Próximos Passos</p>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding-bottom: 15px;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="width: 32px; height: 32px; background-color: #7c3aed; border-radius: 50%; text-align: center; color: #ffffff; font-weight: 600; font-size: 14px; line-height: 32px;">1</td>
                                      <td style="padding-left: 12px; color: #374151; font-size: 14px;">Clique no botão abaixo para acessar</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 15px;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="width: 32px; height: 32px; background-color: #7c3aed; border-radius: 50%; text-align: center; color: #ffffff; font-weight: 600; font-size: 14px; line-height: 32px;">2</td>
                                      <td style="padding-left: 12px; color: #374151; font-size: 14px;">Configure sua senha no primeiro acesso</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="width: 32px; height: 32px; background-color: #7c3aed; border-radius: 50%; text-align: center; color: #ffffff; font-weight: 600; font-size: 14px; line-height: 32px;">3</td>
                                      <td style="padding-left: 12px; color: #374151; font-size: 14px;">Comece a gerenciar sua empresa!</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
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

    console.log("[create-tenant-admin] Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      userId: userId,
      message: "Admin criado e email enviado com sucesso"
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
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Erro ao criar admin do tenant"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
