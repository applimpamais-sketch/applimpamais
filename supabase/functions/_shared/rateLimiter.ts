/**
 * Rate Limiter para proteger Edge Functions contra abuso
 */

interface RateLimitConfig {
  maxRequests: number; // Máximo de requisições
  windowMs: number; // Janela de tempo em ms
}

const requestCounts = new Map<string, number[]>();

/**
 * Verifica se o IP/identificador excedeu o limite de taxa
 * @param identifier - IP ou identificador único
 * @param config - Configuração do limite
 * @returns true se permitido, false se bloqueado
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const timestamps = requestCounts.get(identifier) || [];

  // Remover timestamps fora da janela de tempo
  const recentTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < config.windowMs
  );

  // Verificar se excedeu o limite
  if (recentTimestamps.length >= config.maxRequests) {
    const oldestTimestamp = recentTimestamps[0];
    const resetAt = oldestTimestamp + config.windowMs;
    
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Adicionar timestamp atual
  recentTimestamps.push(now);
  requestCounts.set(identifier, recentTimestamps);

  // Limpar cache periodicamente (evitar memory leak)
  if (Math.random() < 0.01) {
    cleanupOldEntries(config.windowMs);
  }

  return {
    allowed: true,
    remaining: config.maxRequests - recentTimestamps.length,
    resetAt: now + config.windowMs,
  };
}

/**
 * Extrai IP do request
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Cria resposta de rate limit excedido
 */
export function createRateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      },
    }
  );
}

/**
 * Limpa entradas antigas do cache
 */
function cleanupOldEntries(windowMs: number): void {
  const now = Date.now();
  
  for (const [key, timestamps] of requestCounts.entries()) {
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );
    
    if (recentTimestamps.length === 0) {
      requestCounts.delete(key);
    } else {
      requestCounts.set(key, recentTimestamps);
    }
  }
}
