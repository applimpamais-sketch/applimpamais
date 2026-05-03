/**
 * CORS centralizado para a plataforma SaaS.
 * O domínio principal vem de variável de ambiente e os ambientes locais
 * continuam liberados para desenvolvimento.
 */

const DEFAULT_SITE_DOMAIN = 'https://app.limpamais.com';
const PRIMARY_SITE_DOMAIN = (Deno.env.get('SITE_DOMAIN') ?? Deno.env.get('PUBLIC_SITE_URL') ?? DEFAULT_SITE_DOMAIN).replace(/\/$/, '');
const EXTRA_ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [
  PRIMARY_SITE_DOMAIN,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  ...EXTRA_ALLOWED_ORIGINS,
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = !!origin && ALLOWED_ORIGINS.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : PRIMARY_SITE_DOMAIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function handleCorsPreflightResponse(req: Request): Response {
  const origin = req.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
