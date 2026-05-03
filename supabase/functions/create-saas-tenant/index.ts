import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { HttpError, requireSuperAdmin } from "../_shared/auth.ts";
import { SITE_DOMAIN } from "../_shared/siteConfig.ts";

const INVITES_FROM_EMAIL =
  Deno.env.get("INVITES_FROM_EMAIL") ?? "Limpamais <convite@notificacao.limpamais.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const moduloSchema = z.object({
  modulo_id: z.string().uuid(),
  codigo: z.string().min(1).max(100).optional(),
  preco_negociado: z.number().min(0).nullable().optional(),
});

const createTenantSchema = z.object({
  nome_empresa: z.string().min(2).max(255),
  nome_fantasia: z.string().max(255).optional().nullable(),
  cnpj: z.string().max(30).optional().nullable(),
  email_contato: z.string().email(),
  telefone: z.string().max(30).optional().nullable(),
  responsavel_nome: z.string().min(3).max(255),
  responsavel_email: z.string().email(),
  plano: z.enum(["starter", "professional", "enterprise"]).default("starter"),
  valor_mensal: z.number().min(0).optional(),
  trial_termina_em: z.string().datetime().optional(),
  modulos: z.array(moduloSchema).default([]),
});

function getInviteEmailTemplate({
  nome,
  nomeEmpresa,
  plano,
  magicLink,
}: {
  nome: string;
  nomeEmpresa: string;
  plano: string;
  magicLink: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bem-vindo à Limpamais</title>
      </head>
      <body style="margin:0;padding:0;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f4f4f5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f5;">
          <tr>
            <td style="padding:40px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0f766e 0%,#14b8a6 100%);padding:40px 30px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,.14);padding:10px 18px;border-radius:999px;color:#fff;font-size:13px;font-weight:600;letter-spacing:.04em;">
                      LIMPAMAIS
                    </div>
                    <h1 style="color:#fff;margin:20px 0 0;font-size:28px;font-weight:600;">Seu ambiente já está pronto</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 30px;">
                    <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 18px;">Olá <strong>${nome}</strong>,</p>
                    <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 18px;">
                      A empresa <strong>${nomeEmpresa}</strong> foi criada na plataforma <strong>Limpamais</strong> e seu acesso administrativo já está liberado.
                    </p>
                    <div style="background:#f0fdfa;border-left:4px solid #0f766e;border-radius:12px;padding:20px;margin:0 0 28px;">
                      <p style="color:#0f766e;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;font-weight:700;">Plano inicial</p>
                      <p style="color:#1f2937;font-size:20px;font-weight:700;margin:0;">${plano}</p>
                    </div>
                    <div style="text-align:center;padding:10px 0 26px;">
                      <a href="${magicLink}" style="display:inline-block;background:linear-gradient(135deg,#0f766e 0%,#14b8a6 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:600;">
                        Acessar painel
                      </a>
                    </div>
                    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;">
                      <p style="color:#92400e;font-size:14px;margin:0;line-height:1.5;">
                        Este link é válido por <strong>1 hora</strong> e deve ser usado para concluir seu primeiro acesso.
                      </p>
                    </div>
                    <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">
                      Se precisar, você também pode acessar diretamente em <a href="${SITE_DOMAIN}" style="color:#0f766e;">${SITE_DOMAIN}</a>.
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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { adminClient: supabaseAdmin, userId } = await requireSuperAdmin(req);
    const payload = createTenantSchema.parse(await req.json());
    const trialEnd =
      payload.trial_termina_em ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("saas_tenants")
      .insert({
        nome_empresa: payload.nome_empresa,
        nome_fantasia: payload.nome_fantasia ?? null,
        cnpj: payload.cnpj ?? null,
        email_contato: payload.email_contato,
        telefone: payload.telefone ?? null,
        responsavel_nome: payload.responsavel_nome,
        responsavel_email: payload.responsavel_email,
        plano: payload.plano,
        status: "trial",
        valor_mensal: payload.valor_mensal ?? 0,
        trial_termina_em: trialEnd,
        criado_por: userId,
      })
      .select()
      .single();

    if (tenantError || !tenant) {
      throw tenantError ?? new Error("Falha ao criar tenant");
    }

    if (payload.modulos.length > 0) {
      const { error: modulesError } = await supabaseAdmin
        .from("tenant_modulos")
        .upsert(
          payload.modulos.map((modulo) => ({
            tenant_id: tenant.id,
            modulo_id: modulo.modulo_id,
            preco_negociado: modulo.preco_negociado ?? null,
            status: "ativo",
            ativado_em: new Date().toISOString(),
          })),
          { onConflict: "tenant_id,modulo_id" },
        );

      if (modulesError) {
        throw modulesError;
      }
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: payload.responsavel_email,
      options: {
        data: {
          tenant_id: tenant.id,
          nome_completo: payload.responsavel_nome,
        },
        redirectTo: `${SITE_DOMAIN}/auth`,
      },
    });

    if (linkError || !linkData?.user?.id) {
      throw linkError ?? new Error("Falha ao gerar acesso do administrador");
    }

    const adminUserId = linkData.user.id;

    const { error: tenantOwnerError } = await supabaseAdmin
      .from("saas_tenants")
      .update({ responsavel_user_id: adminUserId })
      .eq("id", tenant.id);

    if (tenantOwnerError) {
      throw tenantOwnerError;
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        tenant_id: tenant.id,
        nome_completo: payload.responsavel_nome,
      })
      .eq("id", adminUserId);

    if (profileError) {
      throw profileError;
    }

    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: adminUserId,
      role: "admin",
      tenant_id: tenant.id,
    });

    if (roleError) {
      throw roleError;
    }

    await supabaseAdmin.from("tenant_activity_log").insert({
      tenant_id: tenant.id,
      user_id: userId,
      action: "tenant_created",
      resource_type: "saas_tenant",
      resource_id: tenant.id,
      details: {
        plano: payload.plano,
        responsavel_email: payload.responsavel_email,
        modules_count: payload.modulos.length,
      },
      user_agent: req.headers.get("user-agent"),
    });

    const magicLink = linkData.properties?.action_link;
    if (magicLink && Deno.env.get("RESEND_API_KEY")) {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      await resend.emails.send({
        from: INVITES_FROM_EMAIL,
        to: [payload.responsavel_email],
        subject: "Bem-vindo à Limpamais - seu acesso está pronto",
        html: getInviteEmailTemplate({
          nome: payload.responsavel_nome,
          nomeEmpresa: payload.nome_fantasia || payload.nome_empresa,
          plano: payload.plano,
          magicLink,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        tenant,
        admin_user_id: adminUserId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error) {
    console.error("[create-saas-tenant] Erro:", error);
    const status = error instanceof HttpError ? error.status : error instanceof z.ZodError ? 400 : 500;
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof z.ZodError ? "Dados inválidos" : error instanceof Error ? error.message : "Erro ao criar tenant",
        details:
          error instanceof z.ZodError ? error.errors.map((entry) => `${entry.path.join(".")}: ${entry.message}`) : undefined,
      }),
      {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});
