import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache to avoid creating multiple GoTrueClient instances (one per session_id)
const clientCache = new Map<string, SupabaseClient>();

export function createSessionScopedSupabaseClient(sessionId: string): SupabaseClient {
  const cached = clientCache.get(sessionId);
  if (cached) return cached;

  const client = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: {
          'x-session-id': sessionId,
        },
      },
    }
  );

  clientCache.set(sessionId, client);

  // Cleanup old entries if cache grows (shouldn't happen, but safety net)
  if (clientCache.size > 5) {
    const firstKey = clientCache.keys().next().value;
    if (firstKey && firstKey !== sessionId) {
      clientCache.delete(firstKey);
    }
  }

  return client;
}
