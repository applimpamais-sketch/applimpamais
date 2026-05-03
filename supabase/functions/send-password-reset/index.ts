import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting: track requests per email
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 3;
  
  const timestamps = rateLimitMap.get(email) || [];
  const recent = timestamps.filter(t => now - t < windowMs);
  
  if (recent.length >= maxRequests) {
    return false;
  }
  
  recent.push(now);
  rateLimitMap.set(email, recent);
  return true;
}

interface TenantBranding {
  nome_fantasia: string | null;
  nome_empresa: string;
  logo_url: string | null;
}

function getEmailTemplate(resetUrl: string, branding?: TenantBranding | null): string {
  // Determinar nome da empresa e logo
  const companyName = branding?.nome_fantasia || branding?.nome_empresa || 'RC Limpa Mais';
  const logoUrl = branding?.logo_url || 'https://rclimpamais.com.br/logo-rc-limpa-mais.png';
  const isMaster = !branding;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" style="height: 60px; width: auto; margin-bottom: 20px;" />` : ''}
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">Redefinir Senha 🔐</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá!
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Recebemos uma solicitação para redefinir a senha da sua conta${isMaster ? ' no sistema <strong>RC Limpa Mais</strong>' : ''}.
              </p>
              
              <!-- Info Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #7c3aed;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="width: 50px; vertical-align: top;">
                          <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 50%; text-align: center; line-height: 44px; font-size: 20px;">
                            🔑
                          </div>
                        </td>
                        <td style="vertical-align: top; padding-left: 15px;">
                          <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0; font-weight: 600;">Instruções</p>
                          <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.5;">Clique no botão abaixo para criar uma nova senha segura para sua conta.</p>
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
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      🔐 Redefinir Minha Senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                  ⚠️ <strong>Atenção:</strong> Este link expira em <strong>1 hora</strong>. Se você não solicitou esta redefinição, ignore este email.
                </p>
              </div>
              
              <!-- Alternative Link -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px;">
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
                  Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                </p>
                <p style="color: #7c3aed; font-size: 12px; word-break: break-all; margin: 0; background-color: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
                  ${resetUrl}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                Este email foi enviado automaticamente.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} <strong>${companyName}</strong> - Todos os direitos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

interface RequestBody {
  email: string;
  redirectTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectTo }: RequestBody = await req.json();
    
    // Validate email
    if (!email || typeof email !== 'string') {
      console.error("[send-password-reset] Email não fornecido");
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("[send-password-reset] Email inválido:", email);
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check rate limit
    if (!checkRateLimit(email.toLowerCase())) {
      console.warn("[send-password-reset] Rate limit excedido para:", email);
      return new Response(
        JSON.stringify({ error: "Muitas tentativas. Aguarde 1 minuto." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize clients
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[send-password-reset] RESEND_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração de email ausente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[send-password-reset] Supabase credentials ausentes");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor ausente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const resend = new Resend(resendApiKey);
    
    // Generate recovery link using Admin API
    // Always use production domain for redirects
    const productionDomain = "https://rclimpamais.com.br";
    const finalRedirectTo = redirectTo?.includes('lovable') 
      ? `${productionDomain}/reset-password`
      : (redirectTo || `${productionDomain}/reset-password`);
    
    console.log("[send-password-reset] Gerando link para:", email, "redirect:", finalRedirectTo);
    
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email.toLowerCase().trim(),
      options: {
        redirectTo: finalRedirectTo
      }
    });
    
    if (linkError) {
      // Don't reveal if user exists or not (anti-enumeration)
      console.error("[send-password-reset] Erro ao gerar link:", linkError.message);
      // Return success anyway to prevent user enumeration
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Se o email estiver cadastrado, você receberá um link de recuperação." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!linkData?.properties?.action_link) {
      console.error("[send-password-reset] Link não gerado");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Se o email estiver cadastrado, você receberá um link de recuperação." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const resetUrl = linkData.properties.action_link;
    console.log("[send-password-reset] Link gerado com sucesso para:", email);
    
    // Buscar branding do tenant do usuário
    let tenantBranding: TenantBranding | null = null;
    
    const { data: userData } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    
    if (userData?.tenant_id) {
      const { data: tenant } = await supabase
        .from('saas_tenants')
        .select('nome_fantasia, nome_empresa, logo_url')
        .eq('id', userData.tenant_id)
        .single();
      
      // Só usar branding se NÃO for o tenant master
      if (tenant && userData.tenant_id !== '00000000-0000-0000-0000-000000000001') {
        tenantBranding = tenant as TenantBranding;
        console.log("[send-password-reset] Usando branding do tenant:", tenantBranding.nome_fantasia || tenantBranding.nome_empresa);
      }
    }
    
    // Determinar nome do remetente
    const senderName = tenantBranding?.nome_fantasia || tenantBranding?.nome_empresa || 'RC Limpa Mais';
    
    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: `${senderName} <recuperacao@notificacao.rclimpamais.com.br>`,
      to: [email.toLowerCase().trim()],
      subject: `🔐 Redefinir Senha - ${senderName}`,
      html: getEmailTemplate(resetUrl, tenantBranding),
    });
    
    console.log("[send-password-reset] Email enviado:", emailResponse);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Se o email estiver cadastrado, você receberá um link de recuperação." 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("[send-password-reset] Erro:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar solicitação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
