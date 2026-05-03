import { supabase } from '@/integrations/supabase/client';

/**
 * WRAPPER OBRIGATÓRIO PARA QUERIES MULTI-TENANT
 * 
 * Este módulo garante que TODAS as queries incluam filtro de tenant_id.
 * USO OBRIGATÓRIO em todos os hooks e serviços.
 * 
 * @example
 * // SELECT com filtro automático
 * const data = await fromTenant('agendamentos', tenantId).select('*').order('created_at');
 * 
 * // INSERT com tenant_id automático
 * await fromTenant('despesas', tenantId).insert({ descricao: '...', valor: 100 });
 */

/**
 * Lista de tabelas que NÃO precisam de filtro de tenant
 * (tabelas globais ou de configuração do sistema)
 */
export const GLOBAL_TABLES = [
  'saas_tenants',
  'saas_modulos', 
  'saas_plan_limits',
  'user_roles',
  'tracking_sessions',
  'tracking_positions',
  'blog_posts_queue',
  'blog_clusters',
  'blog_keywords_bank',
  'blog_editorial_calendar',
  'blog_internal_links',
  'blog_config',
  'blog_automation_config',
  'blog_publish_logs',
  'blog_traffic_estimates',
  'webhook_logs',
  'data_retention_log',
  'security_alerts',
  'role_access_log',
  'integracoes',
  'admin_onboarding_progress',
] as const;

type GlobalTable = typeof GLOBAL_TABLES[number];

/**
 * Verifica se uma tabela é global (não precisa de filtro tenant)
 */
export function isGlobalTable(table: string): boolean {
  return GLOBAL_TABLES.includes(table as GlobalTable);
}

/**
 * Wrapper seguro para queries multi-tenant.
 * Aplica filtro de tenant_id automaticamente.
 * 
 * @throws Error se tenantId for null/undefined para tabelas não-globais
 */
export function fromTenant(
  table: string, 
  tenantId: string | null | undefined
) {
  // Tabelas globais não precisam de tenant
  if (isGlobalTable(table)) {
    return {
      select: (columns = '*') => supabase.from(table as any).select(columns),
      insert: (data: any) => supabase.from(table as any).insert(data),
      update: (data: any) => supabase.from(table as any).update(data),
      upsert: (data: any, options?: any) => supabase.from(table as any).upsert(data, options),
      delete: () => supabase.from(table as any).delete(),
    };
  }

  // Para tabelas com tenant, exigir tenantId
  if (!tenantId) {
    console.error(`[SECURITY] Query em ${table} sem tenantId. Isso é proibido.`);
    throw new Error(`[SECURITY] Query em ${table} sem tenantId. Isso é proibido.`);
  }
  
  return {
    /**
     * SELECT com filtro de tenant automático
     */
    select: (columns = '*') => {
      return supabase
        .from(table as any)
        .select(columns)
        .eq('tenant_id', tenantId);
    },
    
    /**
     * INSERT com tenant_id automático no payload
     */
    insert: (data: any) => {
      const dataWithTenant = Array.isArray(data) 
        ? data.map(d => ({ ...d, tenant_id: tenantId }))
        : { ...data, tenant_id: tenantId };
      
      return supabase
        .from(table as any)
        .insert(dataWithTenant);
    },
    
    /**
     * UPDATE com filtro de tenant automático
     */
    update: (data: any) => {
      return supabase
        .from(table as any)
        .update(data)
        .eq('tenant_id', tenantId);
    },
    
    /**
     * UPSERT com tenant_id automático no payload
     */
    upsert: (data: any, options?: any) => {
      const dataWithTenant = Array.isArray(data) 
        ? data.map(d => ({ ...d, tenant_id: tenantId }))
        : { ...data, tenant_id: tenantId };
      
      return supabase
        .from(table as any)
        .upsert(dataWithTenant, options);
    },
    
    /**
     * DELETE com filtro de tenant automático
     */
    delete: () => {
      return supabase
        .from(table as any)
        .delete()
        .eq('tenant_id', tenantId);
    },
  };
}

/**
 * Adiciona filtro de tenant a uma query existente
 * Útil para queries mais complexas
 */
export function withTenantFilter<T extends { eq: (col: string, val: string) => T }>(
  query: T, 
  tenantId: string | null | undefined
): T {
  if (!tenantId) {
    console.error('[SECURITY] withTenantFilter chamado sem tenantId');
    throw new Error('[SECURITY] withTenantFilter requer tenantId');
  }
  return query.eq('tenant_id', tenantId);
}

/**
 * Cria payload com tenant_id para INSERT/UPDATE
 */
export function withTenant<T extends object>(
  data: T, 
  tenantId: string | null | undefined
): T & { tenant_id: string } {
  if (!tenantId) {
    console.error('[SECURITY] withTenant chamado sem tenantId');
    throw new Error('[SECURITY] withTenant requer tenantId');
  }
  return { ...data, tenant_id: tenantId };
}

/**
 * Cria array de payloads com tenant_id para INSERT em lote
 */
export function withTenantBatch<T extends object>(
  dataArray: T[], 
  tenantId: string | null | undefined
): Array<T & { tenant_id: string }> {
  if (!tenantId) {
    console.error('[SECURITY] withTenantBatch chamado sem tenantId');
    throw new Error('[SECURITY] withTenantBatch requer tenantId');
  }
  return dataArray.map(d => ({ ...d, tenant_id: tenantId }));
}
