import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/corsConfig.ts";

interface BootstrapPayload {
  email?: string;
  password?: string;
  nome_completo?: string;
  tenant_id?: string | null;
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return handleCorsPreflightResponse(req);
  }

  try {
    const bootstrapToken = Deno.env.get("INITIAL_ADMIN_BOOTSTRAP_TOKEN");
    if (!bootstrapToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bootstrap endpoint disabled. Configure INITIAL_ADMIN_BOOTSTRAP_TOKEN.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const requestToken = req.headers.get("x-bootstrap-token");
    if (!requestToken || requestToken !== bootstrapToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized bootstrap request" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let payload: BootstrapPayload = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const supabaseAdmin = createClient(
      getRequiredEnv("SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const adminEmail = payload.email ?? Deno.env.get("INITIAL_ADMIN_EMAIL") ?? "app@limpamais.com";
    const adminPassword = payload.password ?? Deno.env.get("INITIAL_ADMIN_PASSWORD") ?? crypto.randomUUID();
    const adminName = payload.nome_completo ?? "Limpamais Admin";
    const tenantId = payload.tenant_id ?? Deno.env.get("INITIAL_ADMIN_TENANT_ID") ?? null;

    const { data: existingUsers, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
    if (listUsersError) {
      throw listUsersError;
    }

    const existingUser = existingUsers?.users?.find((entry) => entry.email === adminEmail);
    if (existingUser) {
      const roleFilter = supabaseAdmin
        .from("user_roles")
        .select("user_id")
        .eq("user_id", existingUser.id)
        .eq("role", "admin");

      const { data: existingRole, error: roleQueryError } = await (tenantId
        ? roleFilter.eq("tenant_id", tenantId).limit(1)
        : roleFilter.is("tenant_id", null).limit(1));

      if (roleQueryError) {
        throw roleQueryError;
      }

      if (!existingRole || existingRole.length === 0) {
        const { error: roleInsertError } = await supabaseAdmin.from("user_roles").insert({
          user_id: existingUser.id,
          role: "admin",
          tenant_id: tenantId,
        });

        if (roleInsertError) {
          throw roleInsertError;
        }
      }

      await supabaseAdmin
        .from("profiles")
        .update({
          nome_completo: adminName,
          tenant_id: tenantId,
        })
        .eq("id", existingUser.id);

      return new Response(
        JSON.stringify({
          success: true,
          alreadyExists: true,
          userId: existingUser.id,
          tenantId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        nome_completo: adminName,
        tenant_id: tenantId,
      },
    });

    if (createError || !createdUser.user) {
      throw createError ?? new Error("Failed to create user");
    }

    const userId = createdUser.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        nome_completo: adminName,
        tenant_id: tenantId,
      })
      .eq("id", userId);

    if (profileError) {
      throw profileError;
    }

    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "admin",
      tenant_id: tenantId,
    });

    if (roleError) {
      throw roleError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        email: adminEmail,
        tenantId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[create-initial-admin] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
