/**
 * Constantes relacionadas a multi-tenancy
 */

/**
 * ID do tenant master original (RC Limpa Mais - dados legados).
 * Este tenant foi criado como fallback para operações sem contexto de tenant.
 */
export const MASTER_TENANT_FALLBACK_ID = '00000000-0000-0000-0000-000000000001';

/**
 * ID do tenant RC Limpa Mais principal (operacional).
 * Todos os dados de produção da RC Limpa Mais estão vinculados a este tenant.
 */
export const RC_LIMPA_MAIS_TENANT_ID = '2046cf1c-af8c-4e5e-b992-092ec922c35c';

/**
 * Nome do tenant master
 */
export const MASTER_TENANT_NAME = 'RC Limpa Mais';

/**
 * Verifica se um tenant_id é o tenant RC Limpa Mais (operacional)
 */
export function isRCLimpaMaisTenant(tenantId: string | null | undefined): boolean {
  return tenantId === RC_LIMPA_MAIS_TENANT_ID;
}

/**
 * Verifica se um tenant_id é o tenant master fallback
 */
export function isMasterFallbackTenant(tenantId: string | null | undefined): boolean {
  return tenantId === MASTER_TENANT_FALLBACK_ID;
}
