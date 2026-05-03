import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';

export interface MensagemUnificada {
  id: string;
  tipo: 'checkout' | 'lembrete' | 'avaliacao' | 'carrinho' | 'pagamento' | 'tecnico';
  destinatario: string;
  telefone: string;
  mensagem: string;
  status: 'pendente' | 'enviado' | 'erro';
  agendado_para?: string;
  created_at: string;
  enviado_em?: string;
  erro?: string;
}

export function useCentralMensagens() {
  const { tenantId } = useTenantContext();

  // Mensagens enviadas (comunicacoes)
  const comunicacoes = useQuery({
    queryKey: ['central-mensagens-comunicacoes', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comunicacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((c: any) => ({
        id: c.id,
        tipo: c.template_usado?.includes('payment') ? 'pagamento' as const : 'checkout' as const,
        destinatario: c.mensagem?.match(/\*Cliente:\*\s*(.+)/)?.[1] || 'Cliente',
        telefone: c.mensagem?.match(/\*Contato:\*\s*(.+)/)?.[1] || '',
        mensagem: c.mensagem || '',
        status: (c.status_entrega === 'enviado' ? 'enviado' : c.status_entrega === 'erro' ? 'erro' : 'pendente') as 'pendente' | 'enviado' | 'erro',
        created_at: c.created_at,
        enviado_em: c.created_at,
      }));
    },
    enabled: !!tenantId,
  });

  // Lembretes na fila
  const lembretes = useQuery({
    queryKey: ['central-mensagens-lembretes', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_lembretes')
        .select('*, agendamentos(nome_cliente, telefone)')
        .order('agendado_para', { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data || []).map((l: any) => ({
        id: l.id,
        tipo: 'lembrete' as const,
        destinatario: l.agendamentos?.nome_cliente || 'Cliente',
        telefone: l.agendamentos?.telefone || '',
        mensagem: l.tipo === '1_dia_antes' ? 'Lembrete 1 dia antes do serviço' : 'Lembrete no dia do serviço',
        status: (l.enviado ? 'enviado' : 'pendente') as 'pendente' | 'enviado' | 'erro',
        agendado_para: l.agendado_para,
        created_at: l.criado_em || l.agendado_para,
        enviado_em: l.enviado_em,
        erro: l.erro,
      }));
    },
    enabled: !!tenantId,
  });

  // Avaliações na fila
  const avaliacoes = useQuery({
    queryKey: ['central-mensagens-avaliacoes', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fila_avaliacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((a: any) => ({
        id: a.id,
        tipo: 'avaliacao' as const,
        destinatario: a.nome_cliente || 'Cliente',
        telefone: a.telefone || '',
        mensagem: a.status === 'enviado' ? 'Pesquisa de satisfação enviada' : 'Pesquisa de satisfação pendente',
        status: (a.status === 'enviado' ? 'enviado' : a.status === 'erro' ? 'erro' : 'pendente') as 'pendente' | 'enviado' | 'erro',
        created_at: a.created_at,
        enviado_em: a.enviado_em,
      }));
    },
    enabled: !!tenantId,
  });

  // Carrinhos contatados
  const carrinhos = useQuery({
    queryKey: ['central-mensagens-carrinhos', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carrinhos_abandonados')
        .select('*')
        .in('status', ['contatado', 'abandonado'])
        .not('telefone', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((c: any) => ({
        id: c.id,
        tipo: 'carrinho' as const,
        destinatario: c.nome_cliente || 'Anônimo',
        telefone: c.telefone || '',
        mensagem: `Carrinho abandonado - ${c.tentativas_contato || 0} tentativa(s) - R$ ${(c.valor_total || 0).toFixed(2)}`,
        status: (c.status === 'contatado' ? 'enviado' : 'pendente') as 'pendente' | 'enviado' | 'erro',
        created_at: c.created_at,
        enviado_em: c.ultima_tentativa_contato,
      }));
    },
    enabled: !!tenantId,
  });

  const allMessages: MensagemUnificada[] = [
    ...(comunicacoes.data || []),
    ...(lembretes.data || []),
    ...(avaliacoes.data || []),
    ...(carrinhos.data || []),
  ].sort((a, b) => {
    const dateA = (a as any).agendado_para || a.created_at;
    const dateB = (b as any).agendado_para || b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const isLoading = comunicacoes.isLoading || lembretes.isLoading || avaliacoes.isLoading || carrinhos.isLoading;

  const metrics = {
    totalEnviados: allMessages.filter(m => m.status === 'enviado').length,
    totalPendentes: allMessages.filter(m => m.status === 'pendente').length,
    totalErros: allMessages.filter(m => m.status === 'erro').length,
    porTipo: {
      checkout: allMessages.filter(m => m.tipo === 'checkout' || m.tipo === 'pagamento').length,
      lembrete: allMessages.filter(m => m.tipo === 'lembrete').length,
      avaliacao: allMessages.filter(m => m.tipo === 'avaliacao').length,
      carrinho: allMessages.filter(m => m.tipo === 'carrinho').length,
    },
  };

  const refetch = () => {
    comunicacoes.refetch();
    lembretes.refetch();
    avaliacoes.refetch();
    carrinhos.refetch();
  };

  return { allMessages, isLoading, metrics, refetch };
}
