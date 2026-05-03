import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { calcularStatusPagamento } from '@/utils/financeiroHelpers';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface Pagamento {
  id: string;
  agendamento_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string | null;
  status: string;
  comprovante_url: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgendamentoComPagamento {
  id: string;
  nome_cliente: string;
  telefone: string;
  data_agendamento: string;
  valor_total: number;
  status: string;
  origem: string;
  categoria_receita: string;
  pagamentos: Pagamento[];
  valor_pago: number;
  saldo_pendente: number;
  status_pagamento: 'pago' | 'parcial' | 'pendente' | 'inadimplente';
}

export interface ReceitasFilters {
  dataInicio?: Date;
  dataFim?: Date;
  statusPagamento?: string;
  formaPagamento?: string;
  categoriaReceita?: string;
  origem?: string;
  busca?: string;
}

export interface KPIsReceitas {
  totalEsperado: number;
  totalRealizado: number;
  totalPendente: number;
  taxaRecebimento: number;
  inadimplencia: number;
}

export function useReceitas(filters?: ReceitasFilters) {
  const { tenantId } = useTenantContext();
  const [agendamentos, setAgendamentos] = useState<AgendamentoComPagamento[]>([]);
  const [kpis, setKpis] = useState<KPIsReceitas>({
    totalEsperado: 0,
    totalRealizado: 0,
    totalPendente: 0,
    taxaRecebimento: 0,
    inadimplencia: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAgendamentosComPagamentos = async () => {
    // PROTEÇÃO: Não executar sem tenant
    if (!tenantId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          pagamentos:pagamentos_agendamentos(*)
        `)
        .eq('tenant_id', tenantId) // ← FILTRO OBRIGATÓRIO
        .order('data_agendamento', { ascending: false });

      // Aplicar filtros
      if (filters?.dataInicio) {
        query = query.gte('data_agendamento', filters.dataInicio.toISOString().split('T')[0]);
      }
      if (filters?.dataFim) {
        query = query.lte('data_agendamento', filters.dataFim.toISOString().split('T')[0]);
      }
      if (filters?.busca) {
        query = query.or(`nome_cliente.ilike.%${filters.busca}%,telefone.ilike.%${filters.busca}%`);
      }
      if (filters?.categoriaReceita && filters.categoriaReceita !== 'all') {
        query = query.eq('categoria_receita', filters.categoriaReceita);
      }
      if (filters?.origem && filters.origem !== 'all') {
        query = query.eq('origem', filters.origem);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Processar dados e calcular status de pagamento
      const processedData: AgendamentoComPagamento[] = (data || []).map((agend: any) => {
        const pagamentosPagos = (agend.pagamentos || []).filter((p: any) => p.status === 'pago');
        const valorPago = pagamentosPagos.reduce((sum: number, p: any) => sum + Number(p.valor_pago || 0), 0);
        const valorTotal = Number(agend.valor_total || 0);
        
        return {
          ...agend,
          pagamentos: agend.pagamentos || [],
          valor_pago: valorPago,
          saldo_pendente: valorTotal - valorPago,
          status_pagamento: calcularStatusPagamento(valorTotal, valorPago, agend.data_agendamento),
        };
      });

      // Filtrar por status de pagamento se necessário
      let filteredData = processedData;
      if (filters?.statusPagamento && filters.statusPagamento !== 'all') {
        filteredData = processedData.filter(agend => 
          agend.status_pagamento === filters.statusPagamento
        );
      }

      // Filtrar por forma de pagamento se necessário
      if (filters?.formaPagamento && filters.formaPagamento !== 'all') {
        filteredData = filteredData.filter(agend =>
          agend.pagamentos.some(p => p.forma_pagamento === filters.formaPagamento)
        );
      }

      setAgendamentos(filteredData);
      calcularKPIs(filteredData);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      toast({
        title: 'Erro ao carregar receitas',
        description: 'Não foi possível carregar os dados de receitas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularKPIs = (data: AgendamentoComPagamento[]) => {
    const totalEsperado = data.reduce((sum, agend) => sum + agend.valor_total, 0);
    const totalRealizado = data.reduce((sum, agend) => sum + agend.valor_pago, 0);
    const totalPendente = totalEsperado - totalRealizado;
    const taxaRecebimento = totalEsperado > 0 ? (totalRealizado / totalEsperado) * 100 : 0;
    
    const hoje = new Date();
    const inadimplentes = data.filter(agend => {
      const dataAgend = new Date(agend.data_agendamento + 'T00:00:00');
      return dataAgend < hoje && agend.valor_pago === 0;
    }).length;
    
    const inadimplencia = data.length > 0 ? (inadimplentes / data.length) * 100 : 0;

    setKpis({
      totalEsperado,
      totalRealizado,
      totalPendente,
      taxaRecebimento,
      inadimplencia,
    });
  };

  const uploadComprovante = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `pagamentos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes-despesas')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes-despesas')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do comprovante:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível fazer upload do comprovante.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const criarPagamento = async (pagamento: Partial<Pagamento>, file?: File) => {
    if (!tenantId) {
      toast({
        title: 'Erro',
        description: 'Tenant não identificado.',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      let comprovanteUrl = null;
      if (file) {
        comprovanteUrl = await uploadComprovante(file);
        if (!comprovanteUrl) return false;
      }

      const { error } = await (supabase as any)
        .from('pagamentos_agendamentos')
        .insert({
          agendamento_id: pagamento.agendamento_id,
          valor_pago: pagamento.valor_pago,
          data_pagamento: pagamento.data_pagamento,
          forma_pagamento: pagamento.forma_pagamento,
          status: pagamento.status,
          observacoes: pagamento.observacoes,
          comprovante_url: comprovanteUrl,
          tenant_id: tenantId, // ← INCLUIR TENANT_ID
        });

      if (error) throw error;

      toast({
        title: 'Pagamento registrado',
        description: 'O pagamento foi registrado com sucesso.',
      });

      await fetchAgendamentosComPagamentos();
      return true;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: 'Erro ao registrar pagamento',
        description: 'Não foi possível registrar o pagamento.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const atualizarPagamento = async (id: string, dados: Partial<Pagamento>, file?: File) => {
    if (!tenantId) {
      toast({
        title: 'Erro',
        description: 'Tenant não identificado.',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      let comprovanteUrl = dados.comprovante_url;
      if (file) {
        comprovanteUrl = await uploadComprovante(file);
        if (!comprovanteUrl) return false;
      }

      const { error } = await (supabase as any)
        .from('pagamentos_agendamentos')
        .update({
          valor_pago: dados.valor_pago,
          data_pagamento: dados.data_pagamento,
          forma_pagamento: dados.forma_pagamento,
          status: dados.status,
          observacoes: dados.observacoes,
          comprovante_url: comprovanteUrl,
        })
        .eq('id', id)
        .eq('tenant_id', tenantId); // ← Garantir que só atualiza do próprio tenant

      if (error) throw error;

      toast({
        title: 'Pagamento atualizado',
        description: 'O pagamento foi atualizado com sucesso.',
      });

      await fetchAgendamentosComPagamentos();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        title: 'Erro ao atualizar pagamento',
        description: 'Não foi possível atualizar o pagamento.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deletarPagamento = async (id: string, comprovanteUrl?: string | null) => {
    if (!tenantId) {
      toast({
        title: 'Erro',
        description: 'Tenant não identificado.',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      // Deletar comprovante do storage se existir
      if (comprovanteUrl) {
        const path = comprovanteUrl.split('/').slice(-2).join('/');
        await supabase.storage
          .from('comprovantes-despesas')
          .remove([path]);
      }

      const { error } = await (supabase as any)
        .from('pagamentos_agendamentos')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId); // ← Garantir que só deleta do próprio tenant

      if (error) throw error;

      toast({
        title: 'Pagamento excluído',
        description: 'O pagamento foi excluído com sucesso.',
      });

      await fetchAgendamentosComPagamentos();
      return true;
    } catch (error) {
      console.error('Erro ao deletar pagamento:', error);
      toast({
        title: 'Erro ao excluir pagamento',
        description: 'Não foi possível excluir o pagamento.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAgendamentosComPagamentos();
  }, [filters, tenantId]);

  const atualizarCategoriaReceita = async (agendamentoId: string, categoriaReceita: string) => {
    if (!tenantId) {
      toast({
        title: 'Erro',
        description: 'Tenant não identificado.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ categoria_receita: categoriaReceita })
        .eq('id', agendamentoId)
        .eq('tenant_id', tenantId); // ← Garantir que só atualiza do próprio tenant

      if (error) throw error;

      toast({
        title: 'Categoria atualizada!',
        description: 'A categoria da receita foi atualizada com sucesso.',
      });

      await fetchAgendamentosComPagamentos();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: 'Erro ao atualizar categoria',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return {
    agendamentos,
    kpis,
    loading,
    criarPagamento,
    atualizarPagamento,
    deletarPagamento,
    refresh: fetchAgendamentosComPagamentos,
    atualizarCategoriaReceita,
  };
}
