import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';

export function useRealtimePagamentos(onUpdate: () => void) {
  useRealtimeSubscription({
    table: 'pagamentos_agendamentos',
    event: '*',
    onInsert: (payload) => {
      if (payload.new.status === 'pago') {
        toast({
          title: '💰 Pagamento recebido!',
          description: `${formatCurrency(payload.new.valor_pago || 0)} - ${payload.new.forma_pagamento}`,
        });
      }
      onUpdate();
    },
    onUpdate: (payload) => {
      const oldData = payload.old as any;
      if (payload.new.status === 'pago' && oldData?.status !== 'pago') {
        toast({
          title: '💰 Pagamento confirmado!',
          description: formatCurrency(payload.new.valor_pago || 0),
        });
      }
      onUpdate();
    },
  });
}
