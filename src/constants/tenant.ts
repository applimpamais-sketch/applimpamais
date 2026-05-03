/**
 * Constantes relacionadas a multi-tenancy.
 *
 * Nesta fase da migração, ainda preservamos os IDs legados para manter
 * compatibilidade com a base atual, mas todo código novo deve evitar
 * depender de tenants especiais por marca.
 */

/**
 * Tenant fallback legado criado para operações sem contexto explícito.
 * Deve ser eliminado quando o fluxo multi-tenant estiver 100% consolidado.
 */
export const LEGACY_MASTER_TENANT_FALLBACK_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Tenant operacional legado usado pela base original da RC.
 * Mantido temporariamente por compatibilidade de dados.
 */
export const LEGACY_OPERATIONAL_TENANT_ID = '2046cf1c-af8c-4e5e-b992-092ec922c35c';

/**
 * Nome padrão da plataforma quando um tenant especial precisar ser exibido.
 */
export const MASTER_TENANT_NAME = 'Limpamais';

/**
 * Alias legados preservados para não quebrar importações existentes.
 */
export const MASTER_TENANT_FALLBACK_ID = LEGACY_MASTER_TENANT_FALLBACK_ID;
export const RC_LIMPA_MAIS_TENANT_ID = LEGACY_OPERATIONAL_TENANT_ID;

export function isLegacyOperationalTenant(tenantId: string | null | undefined): boolean {
  return tenantId === LEGACY_OPERATIONAL_TENANT_ID;
}

export function isLegacyFallbackTenant(tenantId: string | null | undefined): boolean {
  return tenantId === LEGACY_MASTER_TENANT_FALLBACK_ID;
}

/**
 * @deprecated Manter apenas enquanto o fluxo legado não for removido.
 */
export function isRCLimpaMaisTenant(tenantId: string | null | undefined): boolean {
  return isLegacyOperationalTenant(tenantId);
}

/**
 * @deprecated Manter apenas enquanto o fluxo legado não for removido.
 */
export function isMasterFallbackTenant(tenantId: string | null | undefined): boolean {
  return isLegacyFallbackTenant(tenantId);
}
