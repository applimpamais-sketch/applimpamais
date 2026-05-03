/**
 * 🔒 SECURITY: CORS configuration restrito
 * Apenas origins permitidas podem fazer requisições
 */

const ALLOWED_ORIGINS = [
  'https://rclimpamais.com.br',
  'https://www.rclimpamais.com.br',
  'https://rclimpamais.br',
  'https://www.rclimpamais.br',
  'https://rclimpamais.lovable.app',
  'https://68aba76a-9e66-47f9-9a7c-f4d03824233c.lovableproject.com',
  'http://localhost:8080', // Dev only
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  // Validar origin
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24h cache
    'Vary': 'Origin',
  };
}

export function handleCorsPreflightResponse(req: Request): Response {
  const origin = req.headers.get('origin');
  return new Response(null, { 
    status: 204,
    headers: getCorsHeaders(origin) 
  });
}