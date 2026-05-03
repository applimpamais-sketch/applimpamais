import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useServicosHoje() {
  return useQuery({
    queryKey: ['servicos-hoje'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await (supabase
        .from('agendamentos') as any)
        .select('id, tecnico_id')
        .eq('data_agendamento', hoje)
        .not('tecnico_id', 'is', null);

      if (error) throw error;
      
      return {
        total: data?.length || 0,
        tecnicosAtivos: new Set(data?.map((a: any) => a.tecnico_id)).size,
      };
    },
  });
}
