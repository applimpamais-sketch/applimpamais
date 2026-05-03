import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UpdateFuncionarioBotData {
  id: string;
  nome?: string;
  telefone_whatsapp?: string;
  ativo?: boolean;
  observacoes?: string;
}

export function useUpdateFuncionarioBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateFuncionarioBotData) => {
      const { data: result, error } = await supabase
        .from('funcionarios_bot')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios-bot'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Funcionário atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar funcionário',
        variant: 'destructive',
      });
    },
  });
}
