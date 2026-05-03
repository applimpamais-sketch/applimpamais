import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppFinanceiroStatus {
  configured: boolean;
  lastActivity: string | null;
  instanceId: string | null;
}

export function useWhatsAppFinanceiroStatus() {
  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['whatsapp-financeiro-status'],
    queryFn: async (): Promise<WhatsAppFinanceiroStatus> => {
      // Verificar última atividade no whatsapp_financeiro_log
      const { data: lastLog, error } = await supabase
        .from('whatsapp_financeiro_log')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar status do bot financeiro:', error);
      }

      const lastActivity = lastLog?.created_at || null;
      
      // Configurado se houver alguma mensagem nas últimas 24h
      const isConfigured = lastActivity 
        ? (new Date().getTime() - new Date(lastActivity).getTime()) < 24 * 60 * 60 * 1000
        : false;

      return {
        configured: isConfigured,
        lastActivity,
        instanceId: null, // Não expor o instance ID no frontend
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-whatsapp-financeiro-connection');
      
      if (error) throw error;
      
      await refetch();
      return data;
    } catch (error) {
      console.error('Erro ao testar conexão do bot financeiro:', error);
      throw error;
    }
  };

  return {
    status: status || { configured: false, lastActivity: null, instanceId: null },
    loading: isLoading,
    testConnection,
    refreshStatus: refetch,
  };
}
