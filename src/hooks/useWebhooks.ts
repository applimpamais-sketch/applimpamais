import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WebhookLog {
  id: string;
  webhook_id: string;
  evento: string;
  payload: any;
  resposta_status?: number;
  resposta_body?: string;
  sucesso: boolean;
  criado_em: string;
}

export function useWebhookLogs(webhookId: string) {
  return useQuery({
    queryKey: ['webhook-logs', webhookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs' as any)
        .select('*')
        .eq('webhook_id', webhookId)
        .order('criado_em', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return ((data || []) as any[]) as WebhookLog[];
    },
    enabled: !!webhookId,
  });
}

export function useTestWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ webhookId, url, evento }: { webhookId: string; url: string; evento: string }) => {
      const testPayload = {
        evento,
        timestamp: new Date().toISOString(),
        teste: true,
        dados: {
          exemplo: 'dados de teste',
        },
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testPayload),
        });

        const responseBody = await response.text();

        // Registrar log
        await supabase.from('webhook_logs' as any).insert([{
          webhook_id: webhookId,
          evento: `${evento}_teste`,
          payload: testPayload,
          resposta_status: response.status,
          resposta_body: responseBody,
          sucesso: response.ok,
        }]);

        return {
          status: response.status,
          body: responseBody,
          sucesso: response.ok,
        };
      } catch (error: any) {
        // Registrar erro
        await supabase.from('webhook_logs' as any).insert([{
          webhook_id: webhookId,
          evento: `${evento}_teste`,
          payload: testPayload,
          resposta_status: 0,
          resposta_body: error.message,
          sucesso: false,
        }]);

        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-logs'] });
      if (result.sucesso) {
        toast.success(`Webhook testado com sucesso! Status: ${result.status}`);
      } else {
        toast.error(`Webhook retornou erro. Status: ${result.status}`);
      }
    },
    onError: () => {
      toast.error('Erro ao testar webhook');
    },
  });
}
