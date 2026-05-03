import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache to avoid creating multiple GoTrueClient instances (one per session_id)
const clientCache = new Map<string, SupabaseClient>();

export function createSessionScopedSupabaseClient(sessionId: string, tenantId?: string | null): SupabaseClient {
  const cacheKey = `${tenantId ?? 'no-tenant'}:${sessionId}`;
  const cached = clientCache.get(cacheKey);
  if (cached) return cached;

  const client = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: {
          'x-session-id': sessionId,
          'x-tenant-id': tenantId || '',
        },
      },
    }
  );

  clientCache.set(cacheKey, client);

  // Cleanup old entries if cache grows (shouldn't happen, but safety net)
  if (clientCache.size > 5) {
    const firstKey = clientCache.keys().next().value;
    if (firstKey && firstKey !== cacheKey) {
      clientCache.delete(firstKey);
    }
  }

  return client;
}
