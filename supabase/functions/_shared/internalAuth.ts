/**
 * Internal function auth guard.
 *
 * Allows execution when at least one trusted credential is present:
 * 1) Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 * 2) x-internal-function-secret / x-cron-secret = INTERNAL_FUNCTION_SECRET
 */

export function isInternalRequestAuthorized(req: Request): { ok: boolean; reason?: string } {
  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (authHeader?.startsWith("Bearer ") && serviceRoleKey) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (token === serviceRoleKey) {
      return { ok: true };
    }
  }

  const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
  const requestSecret =
    req.headers.get("x-internal-function-secret") ??
    req.headers.get("x-cron-secret") ??
    req.headers.get("X-Internal-Function-Secret") ??
    req.headers.get("X-Cron-Secret");

  if (internalSecret && requestSecret && requestSecret === internalSecret) {
    return { ok: true };
  }

  if (!internalSecret) {
    return {
      ok: false,
      reason:
        "Unauthorized internal call. Configure INTERNAL_FUNCTION_SECRET or use service role Authorization.",
    };
  }

  return { ok: false, reason: "Unauthorized internal call" };
}
