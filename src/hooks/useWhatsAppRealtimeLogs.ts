import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppFinanceiroLog {
  id: string;
  lancamento_id: string | null;
  telefone_remetente: string;
  tipo_mensagem: 'texto' | 'imagem' | 'audio';
  tipo_lancamento: 'despesa' | 'receita' | null;
  tabela_origem: 'despesas' | 'agendamentos' | null;
  conteudo_original: string | null;
  arquivo_url: string | null;
  transcricao_ia: string | null;
  analise_ia: any;
  processamento_status: 'processando' | 'sucesso' | 'erro' | 'nao_autorizado';
  erro_mensagem: string | null;
  created_at: string;
  updated_at: string;
}

export function useWhatsAppRealtimeLogs() {
  const [realtimeLog, setRealtimeLog] = useState<WhatsAppFinanceiroLog | null>(null);
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['whatsapp-financeiro-realtime'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_financeiro_log' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as unknown as WhatsAppFinanceiroLog[];
    },
  });

  useEffect(() => {
    console.log('📡 Configurando realtime para whatsapp_financeiro_log...');

    const channel = supabase
      .channel('whatsapp-financeiro-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_financeiro_log',
        },
        (payload) => {
          console.log('🔔 Atualização realtime recebida:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setRealtimeLog(payload.new as WhatsAppFinanceiroLog);
          }
          
          // Refetch para atualizar a lista completa
          queryClient.invalidateQueries({ queryKey: ['whatsapp-financeiro-realtime'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Status do canal realtime:', status);
      });

    return () => {
      console.log('📡 Desconectando canal realtime...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    logs,
    realtimeLog,
    isLoading,
  };
}

export function useWhatsAppLogsStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['whatsapp-financeiro-stats-realtime'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_financeiro_log' as any)
        .select('*');

      if (error) throw error;

      const logs = (data || []) as unknown as WhatsAppFinanceiroLog[];

      const total = logs.length;
      const sucesso = logs.filter(l => l.processamento_status === 'sucesso').length;
      const erro = logs.filter(l => l.processamento_status === 'erro').length;
      const naoAutorizado = logs.filter(l => l.processamento_status === 'nao_autorizado').length;
      const processando = logs.filter(l => l.processamento_status === 'processando').length;

      const porTelefone = logs.reduce((acc, log) => {
        const tel = log.telefone_remetente;
        if (!acc[tel]) {
          acc[tel] = { total: 0, sucesso: 0, erro: 0 };
        }
        acc[tel].total++;
        if (log.processamento_status === 'sucesso') acc[tel].sucesso++;
        if (log.processamento_status === 'erro') acc[tel].erro++;
        return acc;
      }, {} as Record<string, { total: number; sucesso: number; erro: number }>);

      const porTipo = logs.reduce((acc, log) => {
        const tipo = log.tipo_mensagem;
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        sucesso,
        erro,
        naoAutorizado,
        processando,
        taxaSucesso: total > 0 ? (sucesso / total) * 100 : 0,
        porTelefone,
        porTipo,
      };
    },
    refetchInterval: 10000,
  });

  return { stats, isLoading };
}
