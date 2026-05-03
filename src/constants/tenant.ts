/**
 * Legacy tenant constants are now environment-driven to avoid hardcoded IDs.
 * Keep these exports for backward compatibility while migration completes.
 */

export const LEGACY_MASTER_TENANT_FALLBACK_ID =
  import.meta.env.VITE_LEGACY_MASTER_TENANT_FALLBACK_ID || '';

export const LEGACY_OPERATIONAL_TENANT_ID =
  import.meta.env.VITE_LEGACY_OPERATIONAL_TENANT_ID || '';

export const MASTER_TENANT_NAME = import.meta.env.VITE_MASTER_TENANT_NAME || 'Limpamais';

export const MASTER_TENANT_FALLBACK_ID = LEGACY_MASTER_TENANT_FALLBACK_ID;
export const RC_LIMPA_MAIS_TENANT_ID = LEGACY_OPERATIONAL_TENANT_ID;

export function isLegacyOperationalTenant(tenantId: string | null | undefined): boolean {
  return !!LEGACY_OPERATIONAL_TENANT_ID && tenantId === LEGACY_OPERATIONAL_TENANT_ID;
}

export function isLegacyFallbackTenant(tenantId: string | null | undefined): boolean {
  return !!LEGACY_MASTER_TENANT_FALLBACK_ID && tenantId === LEGACY_MASTER_TENANT_FALLBACK_ID;
}

/**
 * @deprecated Keep while legacy flow is being phased out.
 */
export function isRCLimpaMaisTenant(tenantId: string | null | undefined): boolean {
  return isLegacyOperationalTenant(tenantId);
}

/**
 * @deprecated Keep while legacy flow is being phased out.
 */
export function isMasterFallbackTenant(tenantId: string | null | undefined): boolean {
  return isLegacyFallbackTenant(tenantId);
}
