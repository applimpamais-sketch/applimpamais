import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ProximoServico {
  id: string;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  bairro: string | null;
  cidade: string | null;
  horario: string | null;
  valor_total: number;
  latitude: number | null;
  longitude: number | null;
  itens_carrinho: any[];
  data_agendamento: string;
}

interface UseProximoServicoResult {
  proximoServico: ProximoServico | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProximoServico(
  tecnicoId: string | null,
  dataAtual: string,
  agendamentoAtualId?: string
): UseProximoServicoResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['proximo-servico', tecnicoId, dataAtual, agendamentoAtualId],
    queryFn: async (): Promise<ProximoServico | null> => {
      if (!tecnicoId) return null;

      // Buscar agendamentos do técnico para o dia atual
      // que ainda não foram concluídos
      let query = supabase
        .from('agendamentos')
        .select('id, nome_cliente, telefone, endereco, bairro, cidade, horario, valor_total, latitude, longitude, itens_carrinho, data_agendamento')
        .eq('tecnico_id', tecnicoId)
        .eq('data_agendamento', dataAtual)
        .in('status', ['confirmado', 'pendente'])
        .order('horario', { ascending: true, nullsFirst: false })
        .limit(1);

      // Excluir o agendamento atual se fornecido
      if (agendamentoAtualId) {
        query = query.neq('id', agendamentoAtualId);
      }

      const { data: agendamentos, error } = await query;

      if (error) throw error;

      if (!agendamentos || agendamentos.length === 0) {
        return null;
      }

      return agendamentos[0] as ProximoServico;
    },
    enabled: !!tecnicoId,
    staleTime: 30000, // Cache por 30 segundos
  });

  return {
    proximoServico: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// Função auxiliar para calcular ETA estimado baseado em distância
export function calcularETAEstimado(distanciaKm: number): number {
  // Velocidade média estimada em cidade: 25 km/h
  const velocidadeMedia = 25;
  const tempoMinutos = (distanciaKm / velocidadeMedia) * 60;
  return Math.ceil(tempoMinutos);
}

// Função para calcular distância entre dois pontos (Haversine)
export function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
