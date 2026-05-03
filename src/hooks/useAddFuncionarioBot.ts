import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLimitValidation } from './useLimitValidation';

interface AddFuncionarioBotData {
  nome: string;
  telefone_whatsapp: string;
  observacoes?: string;
}

export function useAddFuncionarioBot() {
  const queryClient = useQueryClient();
  const { validateFeatureAndLimitAsync } = useLimitValidation();

  return useMutation({
    mutationFn: async (data: AddFuncionarioBotData) => {
      // Validar via RPC centralizada (feature + limite)
      const validation = await validateFeatureAndLimitAsync('whatsapp_bot', 'funcionarios_bot', 1);
      
      if (!validation.canProceed) {
        validation.showError();
        throw new Error('Limite atingido ou recurso não disponível no seu plano');
      }

      // Mostrar aviso se próximo do limite
      validation.showWarning();

      const { data: result, error } = await supabase
        .from('funcionarios_bot')
        .insert({
          nome: data.nome,
          telefone_whatsapp: data.telefone_whatsapp,
          observacoes: data.observacoes || null,
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios-bot'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-usage'] });
      queryClient.invalidateQueries({ queryKey: ['resource-limit'] });
      
      toast({
        title: 'Sucesso',
        description: 'Funcionário adicionado com sucesso',
      });

      // Enviar mensagem de boas-vindas (não bloqueia o fluxo)
      try {
        const { error: welcomeError } = await supabase.functions.invoke(
          'send-welcome-bot',
          {
            body: {
              funcionario_id: result.id,
              nome: result.nome,
              telefone: result.telefone_whatsapp,
            },
          }
        );

        if (welcomeError && import.meta.env.DEV) {
          console.error('Erro ao enviar boas-vindas:', welcomeError);
        }
      } catch {
        // Silencioso - não afeta a experiência do usuário
      }
    },
    onError: (error: Error) => {
      // Não mostrar toast duplicado se for erro de limite
      if (error.message?.includes('Limite atingido')) return;
      
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar funcionário',
        variant: 'destructive',
      });
    },
  });
}
