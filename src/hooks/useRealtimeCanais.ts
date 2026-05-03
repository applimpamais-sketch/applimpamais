import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from '@/hooks/use-toast';

export function useRealtimeCanais(onUpdate: () => void) {
  // Realtime para canais_empresa (cliques)
  useRealtimeSubscription({
    table: 'canais_empresa',
    event: '*',
    onChange: (payload) => {
      onUpdate();
      if (payload.eventType === 'UPDATE' && payload.new) {
        const newData = payload.new as { nome?: string; total_cliques?: number };
        toast({
          title: '📊 Novo clique registrado',
          description: `Canal: ${newData.nome || 'Atualizado'}`,
        });
      }
    },
  });

  // Realtime para agendamentos (conversões + receita)
  useRealtimeSubscription({
    table: 'agendamentos',
    event: 'INSERT',
    onChange: (payload) => {
      const newData = payload.new as { canal_origem?: string };
      if (newData?.canal_origem) {
        onUpdate();
        toast({
          title: '🎯 Nova conversão!',
          description: `Canal: ${newData.canal_origem}`,
        });
      }
    },
  });
}
