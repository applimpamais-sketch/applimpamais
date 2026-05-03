import { HttpError, requireTenantAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, new_password, tenant_id } = await req.json();

    if (!user_id || !new_password) {
      throw new HttpError(400, "user_id e new_password são obrigatórios");
    }

    if (typeof new_password !== "string" || new_password.length < 8) {
      throw new HttpError(400, "A nova senha precisa ter pelo menos 8 caracteres");
    }

    const { adminClient: supabaseAdmin, effectiveTenantId, userId: requestingUserId } =
      await requireTenantAdmin(req, tenant_id);

    const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] =
      await Promise.all([
        supabaseAdmin.from("profiles").select("tenant_id").eq("id", user_id).maybeSingle(),
        supabaseAdmin.from("user_roles").select("role").eq("user_id", user_id),
      ]);

    if (profileError) throw profileError;
    if (rolesError) throw rolesError;

    if (!profile || profile.tenant_id !== effectiveTenantId) {
      throw new HttpError(404, "Usuário não encontrado neste tenant");
    }

    if ((roles ?? []).some((entry: { role: string }) => entry.role === "super_admin")) {
      throw new HttpError(403, "Não é permitido alterar a senha de um super admin por aqui");
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      password: new_password,
    });

    if (error) {
      throw error;
    }

    await supabaseAdmin.from("tenant_activity_log").insert({
      tenant_id: effectiveTenantId,
      user_id: requestingUserId,
      action: "team_member_password_reset",
      resource_type: "profile",
      resource_id: user_id,
      details: null,
      user_agent: req.headers.get("user-agent"),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Senha atualizada com sucesso" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[reset-admin-password] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof HttpError ? error.status : 500;
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
