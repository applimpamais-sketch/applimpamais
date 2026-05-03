import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { HttpError, requireTenantAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DeleteMemberRequest {
  userId: string;
  tenant_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { userId, tenant_id }: DeleteMemberRequest = await req.json();
    if (!userId) {
      throw new HttpError(400, "userId é obrigatório");
    }

    const { adminClient: supabaseAdmin, effectiveTenantId, userId: requestingUserId } =
      await requireTenantAdmin(req, tenant_id);

    if (requestingUserId === userId) {
      throw new HttpError(400, "Use outro administrador para remover esta conta");
    }

    const [{ data: targetProfile, error: profileError }, { data: targetRoles, error: rolesError }] =
      await Promise.all([
        supabaseAdmin.from("profiles").select("tenant_id").eq("id", userId).maybeSingle(),
        supabaseAdmin.from("user_roles").select("role, tenant_id").eq("user_id", userId),
      ]);

    if (profileError) throw profileError;
    if (rolesError) throw rolesError;

    if (!targetProfile || targetProfile.tenant_id !== effectiveTenantId) {
      throw new HttpError(404, "Membro não encontrado neste tenant");
    }

    if ((targetRoles ?? []).some((entry: { role: string }) => entry.role === "super_admin")) {
      throw new HttpError(403, "Não é permitido remover um super admin");
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      throw deleteError;
    }

    await supabaseAdmin.from("tenant_activity_log").insert({
      tenant_id: effectiveTenantId,
      user_id: requestingUserId,
      action: "team_member_deleted",
      resource_type: "profile",
      resource_id: userId,
      details: null,
      user_agent: req.headers.get("user-agent"),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Membro removido com sucesso",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error: any) {
    console.error("[delete-team-member] Erro:", error);
    const status = error instanceof HttpError ? error.status : 500;
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro ao remover membro",
      }),
      {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
