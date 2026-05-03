import { useQuery } from '@tanstack/react-query';
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
  analise_ia: {
    tipo?: 'despesa' | 'receita';
    valor?: number;
    descricao?: string;
    categoria?: string;
    data?: string;
    forma_pagamento?: string;
    observacoes?: string;
    confianca?: number;
  } | null;
  processamento_status: 'processando' | 'sucesso' | 'erro' | 'nao_autorizado';
  erro_mensagem: string | null;
  created_at: string;
  updated_at: string;
}

export function useWhatsAppFinanceiro(filtroTipo?: 'despesa' | 'receita') {
  return useQuery({
    queryKey: ['whatsapp-financeiro-log', filtroTipo],
    queryFn: async () => {
      let query = supabase
        .from('whatsapp_financeiro_log' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filtroTipo) {
        query = query.eq('tipo_lancamento', filtroTipo);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as WhatsAppFinanceiroLog[];
    },
  });
}

export function useWhatsAppFinanceiroStats(filtroTipo?: 'despesa' | 'receita') {
  return useQuery({
    queryKey: ['whatsapp-financeiro-stats', filtroTipo],
    queryFn: async () => {
      let query = supabase
        .from('whatsapp_financeiro_log' as any)
        .select('tipo_mensagem, tipo_lancamento, processamento_status, analise_ia, created_at');
      
      if (filtroTipo) {
        query = query.eq('tipo_lancamento', filtroTipo);
      }

      const { data, error } = await query;

      if (error) throw error;

      const logs = (data || []) as unknown as WhatsAppFinanceiroLog[];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const stats = {
        total: logs.length,
        sucesso: logs.filter(d => d.processamento_status === 'sucesso').length,
        erro: logs.filter(d => d.processamento_status === 'erro').length,
        naoAutorizado: logs.filter(d => d.processamento_status === 'nao_autorizado').length,
        processando: logs.filter(d => d.processamento_status === 'processando').length,
        hoje: logs.filter(d => new Date(d.created_at) >= hoje).length,
        despesas: logs.filter(d => d.tipo_lancamento === 'despesa').length,
        receitas: logs.filter(d => d.tipo_lancamento === 'receita').length,
        valorTotalDespesas: logs
          .filter(d => {
            if (d.processamento_status !== 'sucesso' || !d.analise_ia || d.tipo_lancamento !== 'despesa') return false;
            const analise = d.analise_ia as any;
            return analise.valor !== undefined;
          })
          .reduce((sum, d) => {
            const analise = d.analise_ia as any;
            return sum + (analise.valor || 0);
          }, 0),
        valorTotalReceitas: logs
          .filter(d => {
            if (d.processamento_status !== 'sucesso' || !d.analise_ia || d.tipo_lancamento !== 'receita') return false;
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
