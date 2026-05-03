import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';

export function useRealtimeFluxoCaixa(onUpdate: () => void) {
  // Realtime para agendamentos (entradas)
  useRealtimeSubscription({
    table: 'agendamentos',
    event: '*',
    onChange: () => {
      console.log('📊 Fluxo de caixa: entradas atualizadas');
      onUpdate();
    },
    // Usa filtro de tenant automaticamente via useRealtimeSubscription
  });

  // Realtime para despesas (saídas)
  useRealtimeSubscription({
    table: 'despesas',
    event: '*',
    onChange: (payload) => {
      console.log('📊 Fluxo de caixa: saídas atualizadas');
      onUpdate();
      
      if (payload.eventType === 'INSERT') {
        toast({
          title: '💸 Nova despesa',
          description: 'Fluxo de caixa atualizado',
        });
      }
    },
    // Usa filtro de tenant automaticamente via useRealtimeSubscription
  });
}
