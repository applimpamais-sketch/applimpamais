import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface MeuServico {
  id: string;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  data_agendamento: string;
  horario: string | null;
  itens_carrinho: any[];
  valor_total: number;
  status: string;
  forma_pagamento: string | null;
  pago_em: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  genero_cliente: string | null;
  cupom_codigo: string | null;
  cupom_desconto_percentual: number | null;
  valor_desconto: number | null;
  valor_frete: number | null;
}

export function useMeusServicos(filtroData?: 'hoje' | 'semana' | 'todos') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meus-servicos', user?.id, filtroData],
    queryFn: async (): Promise<MeuServico[]> => {
      if (!user?.id) return [];

      let query = (supabase
        .from('agendamentos') as any)
        .select('*')
        .eq('tecnico_id', user.id)
        .order('data_agendamento', { ascending: true })
        .order('horario', { ascending: true });

      // Aplicar filtros de data
      if (filtroData === 'hoje') {
        const hoje = new Date().toISOString().split('T')[0];
        query = query.eq('data_agendamento', hoje);
      } else if (filtroData === 'semana') {
        // Mostrar a semana inteira (domingo a sábado) incluindo dias passados
        const hoje = new Date();
        const inicioSemana = startOfWeek(hoje, { locale: ptBR });
        const fimSemana = endOfWeek(hoje, { locale: ptBR });
        query = query
          .gte('data_agendamento', format(inicioSemana, 'yyyy-MM-dd'))
          .lte('data_agendamento', format(fimSemana, 'yyyy-MM-dd'));
      }
      // filtroData === 'todos' não aplica filtro de data

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as any as MeuServico[];
    },
    enabled: !!user?.id,
  });
}
