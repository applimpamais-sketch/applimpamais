import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 3;

  const timestamps = rateLimitMap.get(email) || [];
  const recent = timestamps.filter((timestamp) => now - timestamp < windowMs);

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

interface RequestBody {
  email: string;
  redirectTo?: string;
}

function getEmailTemplate(resetUrl: string, branding?: TenantBranding | null): string {
  const companyName = branding?.nome_fantasia || branding?.nome_empresa || "Limpamais";
  const logoUrl = branding?.logo_url || `${SITE_DOMAIN}/icon-192x192.png`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir senha - ${companyName}</title>
</head>
<body style="margin:0;padding:0;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f4f4f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f4f4f5;">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e 0%,#14b8a6 100%);padding:40px 30px;text-align:center;">
              <img src="${logoUrl}" alt="${companyName}" style="height:60px;width:auto;margin-bottom:20px;" />
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:600;">Redefinir senha</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px 0;">Olá,</p>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
                Recebemos uma solicitação para redefinir a senha da sua conta em <strong>${companyName}</strong>.
              </p>
              <div style="background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border-radius:12px;padding:20px;border-left:4px solid #0f766e;margin-bottom:30px;">
                <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px 0;font-weight:600;">Instruções</p>
                <p style="color:#374151;font-size:14px;line-height:1.5;margin:0;">
                  Clique no botão abaixo para criar uma nova senha segura para sua conta.
                </p>
              </div>
              <div style="text-align:center;padding:10px 0 30px 0;">
                <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#0f766e 0%,#14b8a6 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:600;">
                  Redefinir minha senha
                </a>
              </div>
              <div style="background-color:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin-bottom:25px;">
                <p style="color:#92400e;font-size:14px;margin:0;line-height:1.5;">
                  Este link expira em <strong>1 hora</strong>. Se você não solicitou esta redefinição, ignore este email.
                </p>
              </div>
              <div style="background-color:#f9fafb;border-radius:8px;padding:16px;">
                <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 10px 0;">
                  Se o botão não funcionar, copie e cole este link no navegador:
                </p>
                <p style="color:#0f766e;font-size:12px;word-break:break-all;margin:0;background-color:#ffffff;padding:10px;border-radius:4px;border:1px solid #e5e7eb;">
                  ${resetUrl}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:25px 30px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 10px 0;">Este email foi enviado automaticamente.</p>
              <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} <strong>${companyName}</strong></p>
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

const successResponse = new Response(
  JSON.stringify({
    success: true,
    message: "Se o email estiver cadastrado, você receberá um link de recuperação.",
  }),
  { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectTo }: RequestBody = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!checkRateLimit(normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Muitas tentativas. Aguarde 1 minuto." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Configuração do servidor ausente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const resend = new Resend(resendApiKey);
    const finalRedirectTo = redirectTo || `${SITE_DOMAIN}/reset-password`;

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: normalizedEmail,
      options: { redirectTo: finalRedirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.warn("[send-password-reset] generateLink fallback:", linkError?.message);
      return successResponse;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    let tenantBranding: TenantBranding | null = null;
    if (profile?.tenant_id) {
      const { data: tenant } = await supabase
        .from("saas_tenants")
        .select("nome_fantasia, nome_empresa, logo_url")
        .eq("id", profile.tenant_id)
        .maybeSingle();

      if (tenant) {
        tenantBranding = tenant as TenantBranding;
      }
    }

    const senderName = tenantBranding?.nome_fantasia || tenantBranding?.nome_empresa || "Limpamais";
    const fromEmail =
      Deno.env.get("PASSWORD_RESET_FROM_EMAIL") ||
      `Recuperação ${senderName} <recuperacao@notificacao.limpamais.com>`;

    await resend.emails.send({
      from: fromEmail,
      to: [normalizedEmail],
      subject: `Redefinir senha - ${senderName}`,
      html: getEmailTemplate(linkData.properties.action_link, tenantBranding),
    });

    return successResponse;
  } catch (error) {
    console.error("[send-password-reset] Erro:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar solicitação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
};

serve(handler);
