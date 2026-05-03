import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new HttpError(500, `Missing required environment variable: ${name}`);
  }
  return value;
}

export function createAdminClient() {
  return createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function createUserClient(authHeader: string) {
  return createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_ANON_KEY"),
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export interface RequestAuthContext {
  adminClient: ReturnType<typeof createAdminClient>;
  userId: string;
  tenantId: string | null;
  isSuperAdmin: boolean;
  roles: Array<{ role: string; tenant_id: string | null }>;
}

export async function getRequestAuthContext(req: Request): Promise<RequestAuthContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Unauthorized");
  }

  const token = authHeader.replace("Bearer ", "");
  const userClient = createUserClient(authHeader);
  const adminClient = createAdminClient();

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const userId = userData.user.id;

  const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("tenant_id")
      .eq("id", userId)
      .maybeSingle(),
    adminClient
      .from("user_roles")
      .select("role, tenant_id")
      .eq("user_id", userId),
  ]);

  if (profileError) {
    throw new HttpError(500, "Failed to load user profile");
  }

  if (rolesError) {
    throw new HttpError(500, "Failed to load user roles");
  }

  const normalizedRoles = (roles ?? []) as Array<{ role: string; tenant_id: string | null }>;
  const isSuperAdmin = normalizedRoles.some((entry) => entry.role === "super_admin");

  return {
    adminClient,
    userId,
    tenantId: profile?.tenant_id ?? null,
    isSuperAdmin,
    roles: normalizedRoles,
  };
}

export async function requireSuperAdmin(req: Request): Promise<RequestAuthContext> {
  const context = await getRequestAuthContext(req);
  if (!context.isSuperAdmin) {
    throw new HttpError(403, "Forbidden");
  }
  return context;
}

export async function requireTenantAdmin(
  req: Request,
  requestedTenantId?: string | null,
): Promise<RequestAuthContext & { effectiveTenantId: string }> {
  const context = await getRequestAuthContext(req);

  if (context.isSuperAdmin) {
    const effectiveTenantId = requestedTenantId ?? context.tenantId;
    if (!effectiveTenantId) {
      throw new HttpError(400, "tenant_id is required for super admin operations");
    }

    return {
      ...context,
      effectiveTenantId,
    };
  }

  const effectiveTenantId = requestedTenantId ?? context.tenantId;
  if (!effectiveTenantId) {
    throw new HttpError(403, "Tenant not found for authenticated user");
  }

  if (requestedTenantId && requestedTenantId !== context.tenantId) {
    throw new HttpError(403, "Forbidden");
  }

  const isTenantAdmin = context.roles.some((entry) =>
    entry.role === "admin" && entry.tenant_id === effectiveTenantId
  );

  if (!isTenantAdmin) {
    throw new HttpError(403, "Forbidden");
  }

  return {
    ...context,
    effectiveTenantId,
  };
}
