import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useRealtimeRelatorios(onUpdate: () => void) {
  // Realtime para agendamentos (base dos relatórios)
  useRealtimeSubscription({
    table: 'agendamentos',
    event: '*',
    onChange: () => {
      console.log('📊 Relatórios: dados atualizados');
      onUpdate();
    },
    // Usa filtro de tenant automaticamente via useRealtimeSubscription
  });
}
