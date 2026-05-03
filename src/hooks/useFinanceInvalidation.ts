import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { INVALIDATION_GROUPS } from '@/lib/queryKeys';

/**
 * Hook para invalidar todas as queries financeiras de uma vez.
 * 
 * Use este hook sempre que:
 * - Um pagamento for registrado/alterado
 * - Uma despesa for criada/editada/paga
 * - Um reembolso for processado
 * - Um agendamento mudar de status
 * 
 * Isso garante que TODAS as telas financeiras sejam atualizadas
 * de forma consistente.
 */
export function useFinanceInvalidation() {
  const queryClient = useQueryClient();
  
  const invalidateFinancial = useCallback(() => {
    console.log('🔄 Invalidando todas as queries financeiras...');
    
    INVALIDATION_GROUPS.financial.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);
  
  const invalidateAppointments = useCallback(() => {
    console.log('🔄 Invalidando queries de agendamentos...');
    
    INVALIDATION_GROUPS.appointments.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);
  
  const invalidateAll = useCallback(() => {
    console.log('🔄 Invalidando TODAS as queries financeiras e de agendamentos...');
    
    // Combinar todos os grupos
    const allKeys = new Set([
      ...INVALIDATION_GROUPS.financial,
      ...INVALIDATION_GROUPS.appointments,
    ]);
    
    allKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);
  
  return {
    invalidateFinancial,
    invalidateAppointments,
    invalidateAll,
    queryClient,
  };
}

/**
 * Hook para usar em mutações que afetam dados financeiros.
 * 
 * Exemplo de uso:
 * ```tsx
 * const { invalidateFinancial } = useFinanceInvalidation();
 * 
 * const mutation = useMutation({
 *   mutationFn: async (data) => {
 *     await supabase.from('pagamentos').update(data);
 *   },
 *   onSuccess: () => {
 *     invalidateFinancial(); // Atualiza todas as telas financeiras
 *     toast.success('Pagamento atualizado!');
 *   },
 * });
 * ```
 */
