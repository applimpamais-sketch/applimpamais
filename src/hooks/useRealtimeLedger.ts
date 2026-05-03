import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useFinanceInvalidation } from './useFinanceInvalidation';
import { toast } from 'sonner';

/**
 * Hook que escuta mudanças na tabela ledger_entries em tempo real.
 * 
 * Quando qualquer entrada do ledger é criada, atualizada ou deletada,
 * este hook invalida TODAS as queries financeiras automaticamente,
 * garantindo que todas as telas mostrem dados consistentes.
 * 
 * Use este hook nas páginas principais que precisam de atualização
 * em tempo real:
 * - Dashboard
 * - Dashboard Financeiro
 * - Dashboard Consolidado
 * - Fluxo de Caixa
 */
export function useRealtimeLedger(showToast = true) {
  const { invalidateAll } = useFinanceInvalidation();
  
  useRealtimeSubscription({
    table: 'ledger_entries',
    event: '*',
    onInsert: (payload) => {
      console.log('📊 Nova entrada no ledger:', payload.new);
      invalidateAll();
      
      if (showToast) {
        const entry = payload.new as any;
        if (entry.tipo === 'IN') {
          toast.success('💰 Nova receita registrada', {
            description: `R$ ${Number(entry.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          });
        } else if (entry.origem === 'despesa') {
          toast.info('💸 Despesa paga', {
            description: `R$ ${Number(entry.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          });
        } else if (entry.origem === 'reembolso') {
          toast.warning('↩️ Reembolso processado', {
            description: `R$ ${Number(entry.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          });
        }
      }
    },
    onUpdate: (payload) => {
      console.log('📊 Ledger atualizado:', payload.new);
      invalidateAll();
      
      if (showToast) {
        toast.info('📊 Dados financeiros atualizados');
      }
    },
    onDelete: (payload) => {
      console.log('📊 Entrada removida do ledger:', payload.old);
      invalidateAll();
    },
  });
}

/**
 * Hook silencioso (sem toasts) para uso em páginas onde
 * as notificações podem ser redundantes.
 */
export function useRealtimeLedgerSilent() {
  return useRealtimeLedger(false);
}
