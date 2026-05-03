import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScriptAtendimento {
  id: string;
  nome: string;
  categoria: string;
  etapa: string;
  variante: string;
  conteudo: string;
  variaveis: string[];
  contexto: string | null;
  ativo: boolean;
  uso_count: number;
  conversoes: number;
  ab_grupo: string | null;
  created_at: string;
  updated_at: string;
}

interface Filters {
  categoria?: string;
  etapa?: string;
}

export function useScriptsAtendimento(filters?: Filters) {
  const queryClient = useQueryClient();

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ['scripts_atendimento', filters],
    queryFn: async () => {
      let query = supabase
        .from('scripts_atendimento' as any)
        .select('*')
        .order('categoria')
        .order('etapa')
        .order('variante');

      if (filters?.categoria && filters.categoria !== 'todos') {
        query = query.eq('categoria', filters.categoria);
      }
      if (filters?.etapa && filters.etapa !== 'todos') {
        query = query.eq('etapa', filters.etapa);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ScriptAtendimento[];
    },
  });

  const incrementUso = useMutation({
    mutationFn: async (id: string) => {
      const script = scripts.find(s => s.id === id);
      if (!script) return;
      const { error } = await (supabase as any)
        .from('scripts_atendimento')
        .update({ uso_count: script.uso_count + 1 })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts_atendimento'] }),
  });

  const incrementConversao = useMutation({
    mutationFn: async (id: string) => {
      const script = scripts.find(s => s.id === id);
      if (!script) return;
      const { error } = await (supabase as any)
        .from('scripts_atendimento')
        .update({ conversoes: script.conversoes + 1 })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts_atendimento'] });
      toast.success('Conversão registrada!');
    },
  });

  const updateScript = useMutation({
    mutationFn: async ({ id, conteudo }: { id: string; conteudo: string }) => {
      const { error } = await (supabase as any)
        .from('scripts_atendimento')
        .update({ conteudo, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts_atendimento'] });
      toast.success('Script atualizado!');
    },
  });

  // Group scripts by ab_grupo for A/B comparison
  const abGroups = scripts.reduce<Record<string, ScriptAtendimento[]>>((acc, s) => {
    if (s.ab_grupo) {
      if (!acc[s.ab_grupo]) acc[s.ab_grupo] = [];
      acc[s.ab_grupo].push(s);
    }
    return acc;
  }, {});

  return {
    scripts,
    isLoading,
    abGroups,
    incrementUso,
    incrementConversao,
    updateScript,
  };
}
