import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';

export function useRealtimeCarrinhos(onUpdate: () => void) {
  useRealtimeSubscription({
    table: 'carrinhos_abandonados',
    event: '*',
    onInsert: (payload) => {
      toast({
        title: '🛒 Novo carrinho abandonado',
        description: `Cliente ${payload.new.nome_cliente || 'anônimo'} abandonou carrinho de ${formatCurrency(payload.new.valor_total || 0)}`,
      });
      onUpdate();
    },
    onUpdate: (payload) => {
      if (payload.new.status === 'recuperado') {
        toast({
          title: '✅ Carrinho recuperado!',
          description: `Cliente ${payload.new.nome_cliente} finalizou a compra`,
        });
      }
      onUpdate();
    },
    // Usa filtro de tenant automaticamente via useRealtimeSubscription
  });
}
