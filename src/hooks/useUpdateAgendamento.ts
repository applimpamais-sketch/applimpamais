import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateAgendamentoData {
  nome_cliente?: string;
  telefone?: string;
  genero_cliente?: string | null;
  endereco?: string;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
  data_agendamento?: string;
  horario?: string | null;
  itens_carrinho?: any[];
  valor_total?: number;
  valor_frete?: number;
  valor_desconto?: number;
}

export function useUpdateAgendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data, 
      originalData 
    }: { 
      id: string; 
      data: UpdateAgendamentoData;
      originalData?: Partial<UpdateAgendamentoData>;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update the agendamento
      const { error: updateError } = await supabase
        .from('agendamentos')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (updateError) throw updateError;

      // Determine which fields were changed
      const changedFields: string[] = [];
      if (originalData) {
        Object.keys(data).forEach(key => {
          const typedKey = key as keyof UpdateAgendamentoData;
          if (JSON.stringify(data[typedKey]) !== JSON.stringify(originalData[typedKey])) {
            changedFields.push(key);
          }
        });
      }

      // Record in history
      if (changedFields.length > 0) {
        // Detectar se é remarcação (mudança de data)
        const isRemarcacao = changedFields.includes('data_agendamento');
        const tipoAlteracao = isRemarcacao ? 'data_remarcada' : 'dados_editados';
        
        await supabase.from('historico_agendamentos').insert({
          agendamento_id: id,
          tipo_alteracao: tipoAlteracao,
          campo_alterado: changedFields.join(', '),
          valor_anterior: originalData ? JSON.stringify(
            Object.fromEntries(
              changedFields.map(f => [f, originalData[f as keyof UpdateAgendamentoData]])
            )
          ) : null,
          valor_novo: JSON.stringify(
            Object.fromEntries(
              changedFields.map(f => [f, data[f as keyof UpdateAgendamentoData]])
            )
          ),
          alterado_por: user?.id || null
        });
      }

      return { id, changedFields };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast.success('Agendamento atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Erro ao atualizar agendamento');
    }
  });
}
