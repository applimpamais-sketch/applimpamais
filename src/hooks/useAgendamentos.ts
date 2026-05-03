import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { playNotificationSound } from '@/utils/notificationSound';
import { Database } from '@/integrations/supabase/types';
import { useTenantContext } from '@/hooks/useTenantContext';

type AgendamentoDB = Database['public']['Tables']['agendamentos']['Row'];

export interface Agendamento extends Omit<AgendamentoDB, 'itens_carrinho' | 'valor_frete'> {
  itens_carrinho: any[];
  valor_frete: number;
  isNew?: boolean;
  tracking_status?: string | null;
}

export interface AgendamentoFilters {
  dataInicio?: Date;
  dataFim?: Date;
  status?: string[];
  bairro?: string;
  busca?: string;
  tecnicoId?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  origemTipo?: 'parceiro' | 'canal' | 'bot' | 'atendente' | 'manual' | 'direto';
  sortField?: 'created_at' | 'data_agendamento';
  sortAscending?: boolean;
}

export function useAgendamentos(filters?: AgendamentoFilters) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { tenantId } = useTenantContext();

  useEffect(() => {
    async function fetchAgendamentos() {
      // PROTEÇÃO: Não executar sem tenant
      if (!tenantId) {
        setLoading(false);
        return;
      }
      
      try {
        // 1. Validar sessão ativa antes de fazer query
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('❌ Sem sessão ativa:', sessionError);
          toast({ 
            title: 'Sessão expirada', 
            description: 'Por favor, faça login novamente',
            variant: 'destructive' 
          });
          setLoading(false);
          return;
        }

        console.log('✅ Sessão ativa, buscando agendamentos...');
        console.log('🔍 Filtros aplicados:', filters);
        console.log('🏢 Tenant ID:', tenantId);
        
        let query = supabase
          .from('agendamentos')
          .select('*')
          .eq('tenant_id', tenantId); // ← FILTRO OBRIGATÓRIO DE TENANT
        
        // 2. Aplicar filtros com validação de formato de data
        if (filters?.dataInicio) {
          // Garantir que é um Date válido e converter para ISO string
          const date = filters.dataInicio instanceof Date ? filters.dataInicio : new Date(filters.dataInicio);
          if (!isNaN(date.getTime())) {
            const dataStr = date.toISOString().split('T')[0];
            console.log('📅 Data início formatada:', dataStr);
            query = query.gte('data_agendamento', dataStr);
          }
        }
        if (filters?.dataFim) {
          const date = filters.dataFim instanceof Date ? filters.dataFim : new Date(filters.dataFim);
          if (!isNaN(date.getTime())) {
            const dataStr = date.toISOString().split('T')[0];
            console.log('📅 Data fim formatada:', dataStr);
            query = query.lte('data_agendamento', dataStr);
          }
        }
        if (filters?.status?.length) {
          console.log('🏷️ Filtro status:', filters.status);
          query = query.in('status', filters.status);
        }
        if (filters?.bairro) {
          console.log('📍 Filtro bairro:', filters.bairro);
          query = query.ilike('bairro', `%${filters.bairro}%`);
        }
        if (filters?.busca) {
          console.log('🔍 Filtro busca:', filters.busca);
          query = query.or(`nome_cliente.ilike.%${filters.busca}%,telefone.ilike.%${filters.busca}%`);
        }
        if (filters?.tecnicoId) {
          console.log('👷 Filtro técnico:', filters.tecnicoId);
          query = query.eq('tecnico_id', filters.tecnicoId);
        }
        if (filters?.valorMinimo) {
          console.log('💰 Filtro valor mínimo:', filters.valorMinimo);
          query = query.gte('valor_total', filters.valorMinimo);
        }
        if (filters?.valorMaximo) {
          console.log('💰 Filtro valor máximo:', filters.valorMaximo);
          query = query.lte('valor_total', filters.valorMaximo);
        }
        
        // Filtro por tipo de origem
        if (filters?.origemTipo) {
          console.log('🎯 Filtro origem:', filters.origemTipo);
          switch (filters.origemTipo) {
            case 'parceiro':
              query = query.not('parceiro_codigo', 'is', null);
              break;
            case 'canal':
              query = query.not('canal_origem', 'is', null);
              break;
            case 'bot':
              query = query.eq('origem', 'whatsapp_bot');
              break;
            case 'atendente':
              query = query.eq('origem', 'atendente_whatsapp');
              break;
            case 'manual':
              query = query.eq('criado_manualmente', true);
              break;
            case 'direto':
              query = query
                .is('parceiro_codigo', null)
                .is('canal_origem', null)
                .or('origem.is.null,origem.neq.whatsapp_bot')
                .eq('criado_manualmente', false);
              break;
          }
        }
        
        const orderField = filters?.sortField || 'data_agendamento';
        const ascending = filters?.sortAscending ?? false;
        query = query.order(orderField, { ascending });
        
        const { data, error } = await query;
        
        // 3. Log detalhado do resultado
        console.log('📊 Resultado da query:', { 
          registros: data?.length || 0, 
          erro: error?.message || null,
          detalhes: error 
        });
        
        if (error) {
          console.error('❌ Erro Supabase completo:', error);
          throw error;
        }
        
        // Fetch active tracking sessions
        const agendamentoIds = data?.map((a: any) => a.id) || [];
        let trackingSessions: any[] = [];
        
        if (agendamentoIds.length > 0) {
          const { data: trackingData } = await supabase
            .from('tracking_sessions')
            .select('agendamento_id, status')
            .in('agendamento_id', agendamentoIds)
            .in('status', ['em_rota', 'chegou', 'servico_em_andamento']);
          
          trackingSessions = trackingData || [];
        }
        
        // Map tracking status to agendamentos
        const agendamentosWithTracking = (data || []).map((ag: any) => ({
          ...ag,
          tracking_status: trackingSessions.find(t => t.agendamento_id === ag.id)?.status || null
        }));
        
        setAgendamentos(agendamentosWithTracking as Agendamento[]);
        console.log('✅ Agendamentos carregados com sucesso:', data?.length || 0);
      } catch (error: any) {
        console.error('❌ Erro ao carregar agendamentos:', error);
        toast({ 
          title: 'Erro ao carregar agendamentos', 
          description: error?.message || 'Erro desconhecido ao buscar dados',
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchAgendamentos();
    
    // Configurar Realtime COM FILTRO DE TENANT
    if (!tenantId) return;
    
    const channel = supabase
      .channel(`agendamentos-realtime-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agendamentos',
          filter: `tenant_id=eq.${tenantId}` // ← FILTRO OBRIGATÓRIO
        },
        (payload) => {
          console.log('🆕 Novo agendamento:', payload.new);
          
          // Adicionar ao início da lista com flag de "novo"
          setAgendamentos(prev => [
            { ...payload.new as Agendamento, isNew: true },
            ...prev
          ]);
          
          // Tocar som e mostrar notificação
          playNotificationSound();
          toast({
            title: '🎉 Novo Agendamento!',
            description: `${(payload.new as Agendamento).nome_cliente} - ${(payload.new as Agendamento).bairro || 'Sem bairro'}`,
          });
          
          // Remover flag "isNew" após 3 segundos
          setTimeout(() => {
            setAgendamentos(prev => 
              prev.map(a => a.id === payload.new.id ? { ...a, isNew: false } : a)
            );
          }, 3000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agendamentos',
          filter: `tenant_id=eq.${tenantId}` // ← FILTRO OBRIGATÓRIO
        },
        (payload) => {
          console.log('📝 Agendamento atualizado:', payload.new);
          
          setAgendamentos(prev =>
            prev.map(a => a.id === payload.new.id ? payload.new as Agendamento : a)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'agendamentos',
          filter: `tenant_id=eq.${tenantId}` // ← FILTRO OBRIGATÓRIO
        },
        (payload) => {
          console.log('🗑️ Agendamento deletado:', payload.old.id);
          
          setAgendamentos(prev => prev.filter(a => a.id !== payload.old.id));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters, toast, tenantId]);

  const updateStatus = async (id: string, newStatus: string) => {
    if (!tenantId) {
      toast({ 
        title: 'Erro',
        description: 'Tenant não identificado',
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      // 1. Buscar status atual antes de atualizar
      const { data: currentData, error: fetchError } = await supabase
        .from('agendamentos')
        .select('status')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();
      
      if (fetchError) {
        console.error('Erro ao buscar status atual:', fetchError);
        throw fetchError;
      }
      
      const oldStatus = currentData?.status;
      
      // 2. Atualizar o status
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenantId);
      
      if (error) {
        console.error('Erro Supabase ao atualizar status:', error);
        throw error;
      }
      
      // 3. Registrar no histórico
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('historico_agendamentos').insert({
        agendamento_id: id,
        tipo_alteracao: 'status_alterado',
        valor_anterior: oldStatus,
        valor_novo: newStatus,
        alterado_por: user?.id || null,
        tenant_id: tenantId
      });
      
      toast({ title: 'Status atualizado com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({ 
        title: 'Erro ao atualizar status',
        description: error?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
  };

  return { agendamentos, loading, updateStatus };
}
