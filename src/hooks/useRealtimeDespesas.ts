import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useRealtimeDespesas(onUpdate: () => void) {
  useRealtimeSubscription({
    table: 'despesas',
    event: '*',
    onChange: () => {
      console.log('💰 Despesas atualizadas');
      onUpdate();
    },
    // Usa filtro de tenant automaticamente via useRealtimeSubscription
  });
}
