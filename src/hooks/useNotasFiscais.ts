import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotaFiscal {
  id: string;
  agendamento_id: string | null;
  numero_nota: string | null;
  serie: string;
  tipo: 'nfse' | 'nfce' | 'manual';
  status: 'pendente' | 'emitida' | 'cancelada' | 'rejeitada';
  valor_total: number;
  valor_impostos: number;
  cliente_nome: string;
  cliente_documento: string | null;
  cliente_endereco: string | null;
  cliente_email: string | null;
  descricao_servico: string;
  data_emissao: string | null;
  data_competencia: string;
  codigo_verificacao: string | null;
  url_pdf: string | null;
  url_xml: string | null;
  resposta_api: Record<string, unknown> | null;
  observacoes: string | null;
  emitida_por: string | null;
  created_at: string;
  updated_at: string;
  agendamento?: {
    id: string;
    nome_cliente: string;
    telefone: string;
    valor_total: number;
    data_agendamento: string;
    endereco: string;
  };
}

export interface NotaFiscalInput {
  agendamento_id?: string | null;
  numero_nota?: string | null;
  serie?: string;
  tipo: 'nfse' | 'nfce' | 'manual';
  status?: 'pendente' | 'emitida' | 'cancelada' | 'rejeitada';
  valor_total: number;
  valor_impostos?: number;
  cliente_nome: string;
  cliente_documento?: string | null;
  cliente_endereco?: string | null;
  cliente_email?: string | null;
  descricao_servico: string;
  data_emissao?: string | null;
  data_competencia?: string;
  codigo_verificacao?: string | null;
  url_pdf?: string | null;
  url_xml?: string | null;
  observacoes?: string | null;
}

export interface NotasFiscaisFilters {
  status?: string;
  tipo?: string;
  dataInicio?: string;
  dataFim?: string;
  searchTerm?: string;
}

export function useNotasFiscais(filters?: NotasFiscaisFilters) {
  return useQuery({
    queryKey: ['notas-fiscais', filters],
    queryFn: async () => {
      let query = supabase
        .from('notas_fiscais')
        .select(`
          *,
          agendamento:agendamentos(id, nome_cliente, telefone, valor_total, data_agendamento, endereco)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }

      if (filters?.tipo && filters.tipo !== 'todos') {
        query = query.eq('tipo', filters.tipo);
      }

      if (filters?.dataInicio) {
        query = query.gte('data_competencia', filters.dataInicio);
      }

      if (filters?.dataFim) {
        query = query.lte('data_competencia', filters.dataFim);
      }

      if (filters?.searchTerm) {
        query = query.or(`cliente_nome.ilike.%${filters.searchTerm}%,numero_nota.ilike.%${filters.searchTerm}%,cliente_documento.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as NotaFiscal[];
    },
  });
}

export function useNotasFiscaisStats() {
  return useQuery({
    queryKey: ['notas-fiscais-stats'],
    queryFn: async () => {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('notas_fiscais')
        .select('status, valor_total, data_competencia');

      if (error) throw error;

      const notas = data || [];
      const notasMesAtual = notas.filter(
        (n) => new Date(n.data_competencia) >= inicioMes
      );

      const totalEmitidas = notasMesAtual.filter((n) => n.status === 'emitida').length;
      const totalPendentes = notasMesAtual.filter((n) => n.status === 'pendente').length;
      const valorFaturado = notasMesAtual
        .filter((n) => n.status === 'emitida')
        .reduce((sum, n) => sum + Number(n.valor_total), 0);
      const totalNotas = notas.length;

      return {
        totalEmitidas,
        totalPendentes,
        valorFaturado,
        totalNotas,
      };
    },
  });
}

export function useCreateNotaFiscal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NotaFiscalInput) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('notas_fiscais')
        .insert({
          ...input,
          emitida_por: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais-stats'] });
      toast.success('Nota fiscal criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar nota fiscal:', error);
      toast.error('Erro ao criar nota fiscal');
    },
  });
}

export function useUpdateNotaFiscal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<NotaFiscalInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais-stats'] });
      toast.success('Nota fiscal atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar nota fiscal:', error);
      toast.error('Erro ao atualizar nota fiscal');
    },
  });
}

export function useDeleteNotaFiscal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notas_fiscais')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais-stats'] });
      toast.success('Nota fiscal excluída!');
    },
    onError: (error) => {
      console.error('Erro ao excluir nota fiscal:', error);
      toast.error('Erro ao excluir nota fiscal');
    },
  });
}

export function useAgendamentosParaNota() {
  return useQuery({
    queryKey: ['agendamentos-para-nota'],
    queryFn: async () => {
      // Buscar agendamentos concluídos ou pagos que ainda não têm nota fiscal
      const { data: notasExistentes } = await supabase
        .from('notas_fiscais')
        .select('agendamento_id')
        .not('agendamento_id', 'is', null);

      const idsComNota = notasExistentes?.map((n) => n.agendamento_id) || [];

      let query = supabase
        .from('agendamentos')
        .select('id, nome_cliente, telefone, valor_total, data_agendamento, endereco, status')
        .in('status', ['concluido', 'pago'])
        .order('data_agendamento', { ascending: false })
        .limit(100);

      if (idsComNota.length > 0) {
        query = query.not('id', 'in', `(${idsComNota.join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}
