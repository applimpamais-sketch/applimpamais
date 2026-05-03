import { HttpError } from "./auth.ts";

interface TenantLookupClient {
  from: (table: string) => any;
}

function getPlatformHostname(): string | null {
  const siteDomain = Deno.env.get("SITE_DOMAIN") ?? Deno.env.get("PUBLIC_SITE_URL");
  if (!siteDomain) return null;
  return normalizeHostname(siteDomain);
}

function normalizeHostname(value: string | null): string | null {
  if (!value) return null;

  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return new URL(value).hostname.toLowerCase();
    }

    return value.split(":")[0].trim().toLowerCase();
  } catch {
    return value.split(":")[0].trim().toLowerCase();
  }
}

function extractHostname(req: Request): string | null {
  return normalizeHostname(
    req.headers.get("x-forwarded-host") ??
      req.headers.get("host") ??
      req.headers.get("origin") ??
      req.headers.get("referer"),
  );
}

function isLocalHost(hostname: string | null): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isPlatformRootHost(hostname: string | null, platformHost: string | null): boolean {
  if (!hostname || !platformHost) return false;
  return hostname === platformHost;
}

export async function resolvePublicTenant(
  supabase: TenantLookupClient,
  req: Request,
  body?: Record<string, unknown> | null,
): Promise<{ id: string; nome_empresa: string; nome_fantasia: string | null; dominio_customizado: string | null }> {
  const url = new URL(req.url);
  const requestedTenantId =
    url.searchParams.get("tenant_id") ??
    url.searchParams.get("tenantId") ??
    req.headers.get("x-tenant-id") ??
    (typeof body?.tenant_id === "string" ? body.tenant_id : null) ??
    (typeof body?.tenantId === "string" ? body.tenantId : null);

  const hostname = extractHostname(req);
  const platformHost = getPlatformHostname();
  const isLocalRequest = isLocalHost(hostname);
  const isPlatformRootRequest = isPlatformRootHost(hostname, platformHost);

  if (hostname && !isLocalRequest) {
    const { data: tenantByDomain, error: tenantByDomainError } = await supabase
      .from("saas_tenants")
      .select("id, nome_empresa, nome_fantasia, dominio_customizado, status")
      .eq("dominio_customizado", hostname)
      .in("status", ["ativo", "trial"])
      .maybeSingle();

    if (tenantByDomainError) {
      throw new HttpError(500, "Failed to resolve tenant by domain");
    }

    if (tenantByDomain) {
      if (requestedTenantId && requestedTenantId !== tenantByDomain.id) {
        throw new HttpError(400, "tenant_id does not match hostname tenant");
      }

      return tenantByDomain;
    }

    if (!isPlatformRootRequest) {
      throw new HttpError(404, "Tenant not found for hostname");
    }
  }

  if (!requestedTenantId) {
    throw new HttpError(
      400,
      "Tenant could not be resolved. Provide tenant_id in local/dev or platform root domain requests.",
    );
  }

  const { data: tenant, error } = await supabase
    .from("saas_tenants")
    .select("id, nome_empresa, nome_fantasia, dominio_customizado, status")
    .eq("id", requestedTenantId)
    .in("status", ["ativo", "trial"])
    .maybeSingle();

  if (error) {
    throw new HttpError(500, "Failed to resolve tenant by id");
  }

  if (!tenant) {
    throw new HttpError(404, "Tenant not found for tenant_id");
  }

  return tenant;
}
