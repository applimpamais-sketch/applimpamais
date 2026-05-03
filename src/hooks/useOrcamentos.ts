import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface OrcamentoItem {
  id: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export interface Orcamento {
  id: string;
  numero: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'expirado';
  cliente_nome: string;
  cliente_email?: string;
  cliente_telefone?: string;
  cliente_documento?: string;
  cliente_endereco?: string;
  cliente_cidade?: string;
  empresa_nome?: string;
  itens: OrcamentoItem[];
  subtotal: number;
  desconto_tipo?: 'percentual' | 'fixo';
  desconto_valor?: number;
  valor_total: number;
  condicoes_pagamento?: string;
  observacoes?: string;
  validade_dias: number;
  data_validade?: string;
  url_pdf?: string;
  enviado_em?: string;
  respondido_em?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OrcamentoFormData {
  cliente_nome: string;
  cliente_email?: string;
  cliente_telefone?: string;
  cliente_documento?: string;
  cliente_endereco?: string;
  cliente_cidade?: string;
  empresa_nome?: string;
  itens: OrcamentoItem[];
  desconto_tipo?: 'percentual' | 'fixo';
  desconto_valor?: number;
  condicoes_pagamento?: string;
  observacoes?: string;
  validade_dias: number;
}

export function useOrcamentos() {
  return useQuery({
    queryKey: ['orcamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        itens: (Array.isArray(item.itens) ? item.itens : []) as unknown as OrcamentoItem[],
        status: item.status as Orcamento['status'],
        desconto_tipo: item.desconto_tipo as Orcamento['desconto_tipo'],
      })) as Orcamento[];
    },
  });
}

export function useOrcamentosStats() {
  return useQuery({
    queryKey: ['orcamentos-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('status, valor_total, created_at');

      if (error) throw error;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisMonth = (data || []).filter(o => 
        new Date(o.created_at) >= startOfMonth
      );

      const stats = {
        total: data?.length || 0,
        totalMes: thisMonth.length,
        rascunhos: (data || []).filter(o => o.status === 'rascunho').length,
        enviados: (data || []).filter(o => o.status === 'enviado').length,
        aprovados: (data || []).filter(o => o.status === 'aprovado').length,
        recusados: (data || []).filter(o => o.status === 'recusado').length,
        valorTotalAprovados: (data || [])
          .filter(o => o.status === 'aprovado')
          .reduce((sum, o) => sum + Number(o.valor_total), 0),
        valorTotalMes: thisMonth.reduce((sum, o) => sum + Number(o.valor_total), 0),
      };

      return stats;
    },
  });
}

export function useCreateOrcamento() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (formData: OrcamentoFormData) => {
      const subtotal = formData.itens.reduce((sum, item) => sum + item.valor_total, 0);
      
      let valorDesconto = 0;
      if (formData.desconto_valor && formData.desconto_valor > 0) {
        if (formData.desconto_tipo === 'percentual') {
          valorDesconto = subtotal * (formData.desconto_valor / 100);
        } else {
          valorDesconto = formData.desconto_valor;
        }
      }

      const valorTotal = subtotal - valorDesconto;

      const dataValidade = new Date();
      dataValidade.setDate(dataValidade.getDate() + formData.validade_dias);

      const { data, error } = await supabase
        .from('orcamentos')
        .insert({
          cliente_nome: formData.cliente_nome,
          cliente_email: formData.cliente_email,
          cliente_telefone: formData.cliente_telefone,
          cliente_documento: formData.cliente_documento,
          cliente_endereco: formData.cliente_endereco,
          cliente_cidade: formData.cliente_cidade,
          empresa_nome: formData.empresa_nome,
          itens: formData.itens as unknown as any,
          subtotal,
          desconto_tipo: formData.desconto_tipo,
          desconto_valor: formData.desconto_valor || 0,
          valor_total: valorTotal,
          condicoes_pagamento: formData.condicoes_pagamento,
          observacoes: formData.observacoes,
          validade_dias: formData.validade_dias,
          data_validade: dataValidade.toISOString().split('T')[0],
          created_by: user?.id,
          status: 'rascunho',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamentos-stats'] });
      toast.success('Orçamento criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar orçamento');
    },
  });
}

export function useUpdateOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Orcamento> & { id: string }) => {
      const { data, error } = await supabase
        .from('orcamentos')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamentos-stats'] });
      toast.success('Orçamento atualizado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar orçamento');
    },
  });
}

export function useDeleteOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamentos-stats'] });
      toast.success('Orçamento excluído!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir orçamento');
    },
  });
}

export function useUpdateOrcamentoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Orcamento['status'] }) => {
      const updates: any = { status };
      
      if (status === 'enviado') {
        updates.enviado_em = new Date().toISOString();
      } else if (['aprovado', 'recusado'].includes(status)) {
        updates.respondido_em = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orcamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamentos-stats'] });
      toast.success(`Status alterado para "${status}"!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar status');
    },
  });
}
