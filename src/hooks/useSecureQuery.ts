import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useTenantContext } from './useTenantContext';
import { fromTenant, withTenant, isGlobalTable } from '@/lib/tenantQuery';
import { PostgrestError } from '@supabase/supabase-js';

type QueryOptions<T> = Omit<UseQueryOptions<T, PostgrestError>, 'queryKey' | 'queryFn'>;

interface SecureQueryConfig {
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  range?: { from: number; to: number };
}

/**
 * Hook de query segura com filtro de tenant automático.
 * 
 * @example
 * const { data, isLoading } = useSecureQuery('agendamentos', ['agendamentos-list'], {
 *   select: 'id, nome_cliente, valor_total',
 *   filters: { status: 'pendente' },
 *   orderBy: { column: 'created_at', ascending: false }
 * });
 */
export function useSecureQuery<T = any>(
  table: string,
  queryKey: string[],
  config?: SecureQueryConfig & QueryOptions<T>
) {
  const { tenantId, isLoading: tenantLoading } = useTenantContext();
  
  const isGlobal = isGlobalTable(table);
  
  return useQuery({
    queryKey: isGlobal ? queryKey : [...queryKey, tenantId],
    queryFn: async () => {
      let query = fromTenant(table, tenantId).select(config?.select || '*');
      
      // Aplicar filtros adicionais
      if (config?.filters) {
        Object.entries(config.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value) as any;
          }
        });
      }
      
      // Aplicar ordenação
      if (config?.orderBy) {
        query = query.order(config.orderBy.column, { 
          ascending: config.orderBy.ascending ?? false 
        }) as any;
      }
      
      // Aplicar limit
      if (config?.limit) {
        query = query.limit(config.limit) as any;
      }
      
      // Aplicar range
      if (config?.range) {
        query = query.range(config.range.from, config.range.to) as any;
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as T;
    },
    enabled: (isGlobal || !!tenantId) && !tenantLoading && (config?.enabled !== false),
    ...config,
  });
}

/**
 * Hook de mutation segura com tenant_id automático.
 * 
 * @example
 * const { mutate } = useSecureMutation('despesas', {
 *   onSuccess: () => toast.success('Despesa criada!')
 * });
 * 
 * mutate({ insert: { descricao: 'Aluguel', valor: 1000 } });
 */
export function useSecureMutation<TData = any, TVariables = any>(
  table: string,
  options?: UseMutationOptions<TData, PostgrestError, TVariables> & {
    invalidateQueries?: string[][];
  }
) {
  const { tenantId } = useTenantContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: any) => {
      if (variables.insert) {
        const { data, error } = await fromTenant(table, tenantId)
          .insert(variables.insert)
          .select() as any;
        if (error) throw error;
        return data;
      }
      
      if (variables.update) {
        let query = fromTenant(table, tenantId).update(variables.update.data);
        
        // Aplicar filtros para o UPDATE
        if (variables.update.match) {
          Object.entries(variables.update.match).forEach(([key, value]) => {
            query = query.eq(key, value) as any;
          });
        }
        
        const { data, error } = await query.select() as any;
        if (error) throw error;
        return data;
      }
      
      if (variables.delete) {
        let query = fromTenant(table, tenantId).delete();
        
        // Aplicar filtros para o DELETE
        if (variables.delete.match) {
          Object.entries(variables.delete.match).forEach(([key, value]) => {
            query = query.eq(key, value) as any;
          });
        }
        
        const { error } = await query;
        if (error) throw error;
        return null;
      }
      
      throw new Error('Mutation deve incluir insert, update ou delete');
    },
    onSuccess: (data, variables, context) => {
      // Invalidar queries especificadas
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [...queryKey, tenantId] });
        });
      }
      
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Hook para verificar se o contexto de tenant está pronto
 */
export function useTenantReady() {
  const { tenantId, isLoading, tenantChecked } = useTenantContext();
  
  return {
    isReady: tenantChecked && !isLoading && !!tenantId,
    tenantId,
    isLoading,
  };
}
