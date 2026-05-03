import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WhatsAppStatus {
  connected: boolean;
  ultraMsgConfigured: boolean;
  lastMessageAt: Date | null;
  status?: string;
  substatus?: string;
}

export function useWhatsAppStatus() {
  const [status, setStatus] = useState<WhatsAppStatus>({
    connected: false,
    ultraMsgConfigured: false,
    lastMessageAt: null,
  });
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Verificar status ao montar
  useEffect(() => {
    checkStatus();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      // Buscar última mensagem recebida
      const { data: logs, error } = await supabase
        .from('whatsapp_financeiro_log' as any)
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const hasRecentMessages = logs && 'created_at' in logs;
      const lastMessageDate = hasRecentMessages && logs.created_at 
        ? new Date(logs.created_at as string) 
        : null;
      
      // Considera conectado se recebeu mensagem nas últimas 24h
      const isConnected = lastMessageDate && 
        (Date.now() - lastMessageDate.getTime()) < 24 * 60 * 60 * 1000;

      setStatus({
        connected: !!isConnected,
        ultraMsgConfigured: !!hasRecentMessages,
        lastMessageAt: lastMessageDate,
      });

      setLastMessage(lastMessageDate?.toISOString() || null);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-whatsapp-connection', {
        body: {},
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Conexão OK!', {
          description: data.message || 'UltraMsg está respondendo corretamente',
        });
        
        // Atualizar status com informações detalhadas
        setStatus(prev => ({
          ...prev,
          connected: data.data?.isActive || false,
          ultraMsgConfigured: data.data?.isActive || false,
          status: data.data?.status,
          substatus: data.data?.substatus,
        }));
        
        await checkStatus();
      } else {
        toast.error('Erro na conexão', {
          description: data.message || 'Não foi possível conectar ao UltraMsg',
        });
      }

      return data;
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error);
      toast.error('Erro ao testar conexão', {
        description: error.message || 'Verifique sua configuração',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    lastMessage,
    loading,
    testConnection,
    refreshStatus: checkStatus,
  };
}
