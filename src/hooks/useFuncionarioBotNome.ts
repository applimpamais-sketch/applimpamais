import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFuncionarioBotNome(funcionarioId: string | null | undefined) {
  return useQuery({
    queryKey: ['funcionario-bot-nome', funcionarioId],
    queryFn: async (): Promise<string | null> => {
      if (!funcionarioId) return null;
      
      const { data, error } = await supabase
        .from('funcionarios_bot')
        .select('nome')
        .eq('id', funcionarioId)
        .single();

      if (error) {
        console.error('Erro ao buscar nome do funcionário:', error);
        return null;
      }
      
      return data?.nome || null;
    },
    enabled: !!funcionarioId,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}

// Hook para buscar múltiplos funcionários de uma vez (otimização)
export function useFuncionariosBotNomes(funcionarioIds: (string | null | undefined)[]) {
  const idsValidos = funcionarioIds.filter((id): id is string => !!id);
  const idsUnicos = [...new Set(idsValidos)];
  
  return useQuery({
    queryKey: ['funcionarios-bot-nomes', idsUnicos.sort().join(',')],
    queryFn: async (): Promise<Record<string, string>> => {
      if (idsUnicos.length === 0) return {};
      
      const { data, error } = await supabase
        .from('funcionarios_bot')
        .select('id, nome')
        .in('id', idsUnicos);

      if (error) {
        console.error('Erro ao buscar nomes dos funcionários:', error);
        return {};
      }
      
      const mapa: Record<string, string> = {};
      data?.forEach(f => {
        mapa[f.id] = f.nome;
      });
      
      return mapa;
    },
    enabled: idsUnicos.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
