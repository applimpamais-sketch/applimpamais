import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';

export function useRealtimeReceitas(onUpdate: () => void) {
  // Realtime para agendamentos (receitas)
  useRealtimeSubscription({
    table: 'agendamentos',
    event: '*',
    onChange: (payload) => {
      console.log('💰 Receitas atualizadas via agendamentos');
      onUpdate();
      
      if (payload.eventType === 'INSERT') {
        toast({
          title: '🆕 Novo agendamento',
          description: 'Uma nova receita foi registrada',
        });
      } else if (payload.eventType === 'UPDATE') {
        const newData = payload.new as any;
        if (newData?.status === 'pago') {
          toast({
            title: '✅ Pagamento confirmado',
            description: 'Receita atualizada com sucesso',
          });
        }
      }
    },
  });
}
