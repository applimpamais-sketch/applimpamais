import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface CarrinhoAbandonado {
  id: string;
  nome_cliente: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  itens_carrinho: any;
  valor_total: number;
  cupom_codigo: string | null;
  cupom_desconto_percentual: number | null;
  valor_desconto: number;
  data_agendamento: string | null;
  etapa_abandonada: 'carrinho' | 'agendamento';
  percentual_preenchimento: number;
  session_id: string;
  user_agent: string | null;
  status: 'abandonado' | 'contatado' | 'recuperado' | 'perdido';
  tentativas_contato: number;
  ultima_tentativa_contato: string | null;
  notas_internas: string | null;
  created_at: string;
  updated_at: string;
  last_activity: string;
}

interface UseCarrinhosAbandonadosParams {
  status?: string;
  etapa?: string;
  periodo?: 'hoje' | 'semana' | 'mes' | 'todos';
}

export function useCarrinhosAbandonados(params: UseCarrinhosAbandonadosParams = {}) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['carrinhos-abandonados', params, tenantId],
    queryFn: async () => {
      // SEGURANÇA: Não executar sem tenant
      if (!tenantId) {
        throw new Error('[SECURITY] Query carrinhos-abandonados sem tenantId');
      }

      let query = supabase
        .from('carrinhos_abandonados')
        .select('*')
        .eq('tenant_id', tenantId) // FILTRO TENANT
        .order('last_activity', { ascending: false });

      // Filtrar por status
      if (params.status && params.status !== 'todos') {
        query = query.eq('status', params.status);
      }

      // Filtrar por etapa
      if (params.etapa && params.etapa !== 'todos') {
        query = query.eq('etapa_abandonada', params.etapa);
      }

      // Filtrar por período
      if (params.periodo && params.periodo !== 'todos') {
        const now = new Date();
        let startDate: Date;

        switch (params.periodo) {
          case 'hoje':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'semana':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'mes':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CarrinhoAbandonado[];
    },
    enabled: !!tenantId, // Só executar se tiver tenant
  });
}

export function useCarrinhosAbandonadosStats() {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['carrinhos-abandonados-stats', tenantId],
    queryFn: async () => {
      // SEGURANÇA: Não executar sem tenant
      if (!tenantId) {
        throw new Error('[SECURITY] Query carrinhos-abandonados-stats sem tenantId');
      }

      const { data: all, error: allError } = await supabase
        .from('carrinhos_abandonados')
        .select('valor_total, status, created_at')
        .eq('tenant_id', tenantId); // FILTRO TENANT

      if (allError) throw allError;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const total = all?.length || 0;
      const abandonadosHoje = all?.filter(c => 
        new Date(c.created_at) >= hoje && c.status === 'abandonado'
      ).length || 0;
      
      const recuperados = all?.filter(c => c.status === 'recuperado').length || 0;
      const taxaRecuperacao = total > 0 ? (recuperados / total) * 100 : 0;
      
      const valorEmRisco = all
        ?.filter(c => c.status === 'abandonado')
        .reduce((sum, c) => sum + Number(c.valor_total), 0) || 0;

      const valorRecuperado = all
        ?.filter(c => c.status === 'recuperado')
        .reduce((sum, c) => sum + Number(c.valor_total), 0) || 0;

      return {
        total,
        abandonadosHoje,
        taxaRecuperacao: Math.round(taxaRecuperacao),
        valorEmRisco,
        valorRecuperado,
      };
    },
    enabled: !!tenantId, // Só executar se tiver tenant
  });
}
