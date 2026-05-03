import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';

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
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['whatsapp-conversas', tenantId, filtro],
    queryFn: async (): Promise<WhatsAppConversa[]> => {
      if (!tenantId) return [];

      let query = supabase
        .from('whatsapp_conversas')
        .select('*')
        .eq('tenant_id', tenantId)
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
    enabled: !!tenantId,
    refetchInterval: 10000, // Atualizar a cada 10s
  });
}

export function useWhatsAppMensagens(conversaId: string) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['whatsapp-mensagens', tenantId, conversaId],
    queryFn: async (): Promise<WhatsAppMensagem[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('whatsapp_mensagens')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('conversa_id', conversaId)
        .order('criado_em', { ascending: true });

      if (error) throw error;
      return (data || []).map(msg => ({
        ...msg,
        direcao: msg.direcao as 'entrada' | 'saida',
        tipo: msg.tipo as 'texto' | 'imagem' | 'audio'
      }));
    },
    enabled: !!tenantId && !!conversaId,
  });
}

export function useWhatsAppStats() {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['whatsapp-stats', tenantId],
    queryFn: async () => {
      if (!tenantId) {
        return {
          totalConversas: 0,
          conversasAtivas: 0,
          agendamentosConfirmados: 0,
          orcamentosPendentes: 0,
          taxaConversao: 0,
        };
      }

      const [conversasRes, agendamentosRes] = await Promise.all([
        supabase.from('whatsapp_conversas').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('agendamentos_bot').select('status', { count: 'exact' }).eq('tenant_id', tenantId),
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
    enabled: !!tenantId,
    refetchInterval: 30000, // Atualizar a cada 30s
  });
}
