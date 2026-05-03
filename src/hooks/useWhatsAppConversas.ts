import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppConversa {
  id: string;
  telefone: string;
  nome_cliente: string | null;
  estado_atual: string;
  contexto: any;
  ultima_mensagem: string;
  criado_em: string;
  finalizado: boolean;
}

export interface WhatsAppMensagem {
  id: string;
  conversa_id: string;
  direcao: 'entrada' | 'saida';
  tipo: 'texto' | 'imagem' | 'audio';
  conteudo: string | null;
  imagem_url: string | null;
  metadata: any;
  criado_em: string;
}

export function useWhatsAppConversas(filtro?: 'ativas' | 'finalizadas') {
  return useQuery({
    queryKey: ['whatsapp-conversas', filtro],
    queryFn: async (): Promise<WhatsAppConversa[]> => {
      let query = supabase
        .from('whatsapp_conversas')
        .select('*')
        .order('ultima_mensagem', { ascending: false });

      if (filtro === 'ativas') {
        query = query.eq('finalizado', false);
      } else if (filtro === 'finalizadas') {
        query = query.eq('finalizado', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000, // Atualizar a cada 10s
  });
}

export function useWhatsAppMensagens(conversaId: string) {
  return useQuery({
    queryKey: ['whatsapp-mensagens', conversaId],
    queryFn: async (): Promise<WhatsAppMensagem[]> => {
      const { data, error } = await supabase
        .from('whatsapp_mensagens')
        .select('*')
        .eq('conversa_id', conversaId)
        .order('criado_em', { ascending: true });

      if (error) throw error;
      return (data || []).map(msg => ({
        ...msg,
        direcao: msg.direcao as 'entrada' | 'saida',
        tipo: msg.tipo as 'texto' | 'imagem' | 'audio'
      }));
    },
    enabled: !!conversaId,
  });
}

export function useWhatsAppStats() {
  return useQuery({
    queryKey: ['whatsapp-stats'],
    queryFn: async () => {
      const [conversasRes, agendamentosRes] = await Promise.all([
        supabase.from('whatsapp_conversas').select('*', { count: 'exact', head: true }),
        supabase.from('agendamentos_bot').select('status', { count: 'exact' })
      ]);

      const totalConversas = conversasRes.count || 0;
      
      const agendamentos = agendamentosRes.data || [];
      const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
      const orcamentos = agendamentos.filter(a => a.status === 'orcamento').length;

      const taxaConversao = totalConversas > 0 
        ? ((confirmados / totalConversas) * 100).toFixed(1)
        : '0.0';

      return {
        totalConversas,
        conversasAtivas: conversasRes.count || 0,
        agendamentosConfirmados: confirmados,
        orcamentosPendentes: orcamentos,
        taxaConversao: parseFloat(taxaConversao)
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30s
  });
}