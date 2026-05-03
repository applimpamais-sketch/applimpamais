import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';

export function useRealtimeParcerias(onUpdate: () => void) {
  // Realtime para parceiros
  useRealtimeSubscription({
    table: 'parceiro_links',
    event: '*',
    onChange: () => {
      console.log('🤝 Parceiros atualizados');
      onUpdate();
    },
  });

  // Realtime para conversões
  useRealtimeSubscription({
    table: 'parceiro_conversoes',
    event: '*',
    onChange: (payload) => {
      console.log('📈 Conversão de parceiro registrada');
      onUpdate();
      
      if (payload.eventType === 'INSERT') {
        toast({
          title: '🎉 Nova conversão',
          description: 'Um parceiro gerou uma nova conversão',
        });
      }
    },
  });

  // Realtime para saques
  useRealtimeSubscription({
    table: 'parceiro_saques',
    event: '*',
    onChange: (payload) => {
      console.log('💸 Saque de parceiro atualizado');
      onUpdate();
      
      if (payload.eventType === 'INSERT') {
        toast({
          title: '💰 Novo pedido de saque',
          description: 'Um parceiro solicitou um saque',
        });
      }
    },
  });
}
