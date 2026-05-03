import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface FuncionarioBot {
  id: string;
  nome: string;
  telefone_whatsapp: string;
  ativo: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export function useFuncionariosBot() {
  const { tenantId } = useTenantContext();
  
  return useQuery({
    queryKey: ['funcionarios-bot', tenantId],
    queryFn: async (): Promise<FuncionarioBot[]> => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('funcionarios_bot')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('nome');

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}
