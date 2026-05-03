import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppDespesaLog {
  id: string;
  despesa_id: string | null;
  telefone_remetente: string;
  tipo_mensagem: 'texto' | 'imagem' | 'audio';
  conteudo_original: string | null;
  arquivo_url: string | null;
  transcricao_ia: string | null;
  analise_ia: {
    valor?: number;
    descricao?: string;
    categoria?: string;
    data_despesa?: string;
    observacoes?: string;
    confianca?: number;
  } | null;
  processamento_status: 'processando' | 'sucesso' | 'erro';
  erro_mensagem: string | null;
  created_at: string;
  updated_at: string;
}

export function useWhatsAppDespesas() {
  return useQuery({
    queryKey: ['whatsapp-despesas-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_despesas_log' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as WhatsAppDespesaLog[];
    },
  });
}

export function useWhatsAppDespesasStats() {
  return useQuery({
    queryKey: ['whatsapp-despesas-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_despesas_log' as any)
        .select('tipo_mensagem, processamento_status, analise_ia, created_at');

      if (error) throw error;

      const logs = (data || []) as unknown as WhatsAppDespesaLog[];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const stats = {
        total: logs.length,
        sucesso: logs.filter(d => d.processamento_status === 'sucesso').length,
        erro: logs.filter(d => d.processamento_status === 'erro').length,
        processando: logs.filter(d => d.processamento_status === 'processando').length,
        hoje: logs.filter(d => new Date(d.created_at) >= hoje).length,
        valorTotal: logs
          .filter(d => {
            if (d.processamento_status !== 'sucesso' || !d.analise_ia) return false;
            const analise = d.analise_ia as any;
            return analise.valor !== undefined;
          })
          .reduce((sum, d) => {
            const analise = d.analise_ia as any;
            return sum + (analise.valor || 0);
          }, 0),
        porTipo: {
          texto: logs.filter(d => d.tipo_mensagem === 'texto').length,
          imagem: logs.filter(d => d.tipo_mensagem === 'imagem').length,
          audio: logs.filter(d => d.tipo_mensagem === 'audio').length,
        }
      };

      return stats;
    },
  });
}
