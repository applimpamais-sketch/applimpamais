import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PushPreferences {
  id?: string;
  user_id: string;
  novo_agendamento: boolean;
  agendamento_confirmado: boolean;
  agendamento_concluido: boolean;
  pagamento_recebido: boolean;
  carrinho_abandonado: boolean;
  problema_reportado: boolean;
  meta_atingida: boolean;
  horario_inicio: string;
  horario_fim: string;
  permitir_final_semana: boolean;
}

export function usePushPreferences() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['push-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('push_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Se não existir, criar com valores padrão
      if (!data) {
        const { data: newPrefs, error: createError } = await supabase
          .from('push_notification_preferences')
          .insert({
            user_id: user.id,
            novo_agendamento: true,
            agendamento_confirmado: true,
            agendamento_concluido: true,
            pagamento_recebido: true,
            carrinho_abandonado: false,
            problema_reportado: true,
            meta_atingida: true,
            horario_inicio: '08:00:00',
            horario_fim: '22:00:00',
            permitir_final_semana: true
          })
          .select()
          .single();

        if (createError) throw createError;
        return newPrefs;
      }

      return data;
    }
  });

  const updatePreferences = useMutation({
    mutationFn: async (prefs: Partial<PushPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('push_notification_preferences')
        .upsert({
          user_id: user.id,
          ...prefs
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-preferences'] });
      toast.success('Preferências atualizadas com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar preferências:', error);
      toast.error('Erro ao salvar preferências');
    }
  });

  const sendTestNotification = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-test-push');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Notificação de teste enviada! 🔔');
    },
    onError: (error) => {
      console.error('Erro ao enviar teste:', error);
      toast.error('Erro ao enviar notificação de teste');
    }
  });

  return {
    preferences,
    isLoading,
    updatePreferences,
    sendTestNotification
  };
}
