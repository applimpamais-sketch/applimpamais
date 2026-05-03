import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Edit, 
  Truck, 
  MapPin, 
  PlayCircle,
  Package,
  Plus,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoricoItem {
  id: string;
  tipo: 'status' | 'dados' | 'tracking' | 'criacao' | 'remarcacao';
  descricao: string;
  detalhes?: string;
  responsavel?: string;
  icon: any;
  color: string;
  created_at: string;
}

interface AgendamentoTimelineProps {
  agendamentoId: string;
  collapsibleOnMobile?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  confirmado: { label: 'Confirmado', color: 'bg-blue-500', icon: AlertCircle },
  concluido: { label: 'Concluído', color: 'bg-green-500', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
  pago: { label: 'Pago', color: 'bg-emerald-500', icon: CheckCircle },
};

const TRACKING_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  em_rota: { label: 'Trajeto Iniciado', color: 'bg-blue-500', icon: Truck },
  chegou: { label: 'Chegou no Local', color: 'bg-green-500', icon: MapPin },
  servico_em_andamento: { label: 'Serviço em Andamento', color: 'bg-purple-500', icon: PlayCircle },
  concluido: { label: 'Trajeto Concluído', color: 'bg-emerald-500', icon: Package },
};

const ALTERACAO_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  agendamento_criado: { label: 'Agendamento Criado', icon: Plus, color: 'bg-emerald-500' },
  status_alterado: { label: 'Status Alterado', icon: RefreshCw, color: 'bg-blue-500' },
  data_remarcada: { label: 'Remarcação', icon: Calendar, color: 'bg-orange-500' },
  dados_editados: { label: 'Dados Editados', icon: Edit, color: 'bg-muted' },
};

// Função para formatar data de maneira amigável
const formatarData = (dataStr: string) => {
  try {
    const data = new Date(dataStr);
    return format(data, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dataStr;
  }
};

export default function AgendamentoTimeline({ agendamentoId, collapsibleOnMobile = false }: AgendamentoTimelineProps) {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(!collapsibleOnMobile);

  useEffect(() => {
    fetchHistorico();
    
    // Realtime para novas mudanças
    const channel = supabase
      .channel(`historico-${agendamentoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'historico_agendamentos',
          filter: `agendamento_id=eq.${agendamentoId}`
        },
        () => {
          fetchHistorico(); // Refetch when new history arrives
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracking_sessions',
          filter: `agendamento_id=eq.${agendamentoId}`
        },
        () => {
          fetchHistorico(); // Refetch when tracking updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agendamentoId]);

  const fetchHistorico = async () => {
    try {
      // Fetch from historico_agendamentos WITH profile join
      const { data: historicoData, error: historicoError } = await supabase
        .from('historico_agendamentos')
        .select(`
          *,
          perfil:alterado_por(nome_completo)
        `)
        .eq('agendamento_id', agendamentoId)
        .order('created_at', { ascending: false });

      if (historicoError) throw historicoError;

      // Fetch from tracking_sessions WITH profile join
      const { data: trackingData, error: trackingError } = await supabase
        .from('tracking_sessions')
        .select(`
          *,
          tecnico:tecnico_id(nome_completo)
        `)
        .eq('agendamento_id', agendamentoId)
        .order('created_at', { ascending: false });

      if (trackingError) throw trackingError;

      // Transform and merge events
      const events: HistoricoItem[] = [];

      // Add historico_agendamentos events
      historicoData?.forEach((item: any) => {
        const tipoAlteracao = item.tipo_alteracao;
        const config = ALTERACAO_CONFIG[tipoAlteracao];
        const responsavelNome = item.perfil?.nome_completo || null;

        // Processar descrição baseada no tipo
        let descricao = '';
        let detalhes = '';

        if (tipoAlteracao === 'agendamento_criado') {
          descricao = 'Agendamento Criado';
          detalhes = item.valor_novo || 'Novo agendamento registrado';
        } else if (tipoAlteracao === 'status_alterado') {
          const statusAnterior = STATUS_CONFIG[item.valor_anterior]?.label || item.valor_anterior;
          const statusNovo = STATUS_CONFIG[item.valor_novo]?.label || item.valor_novo;
          descricao = `Status: ${statusAnterior} → ${statusNovo}`;
        } else if (tipoAlteracao === 'data_remarcada') {
          // Tentar parsear as datas do JSON
          try {
            const anterior = JSON.parse(item.valor_anterior || '{}');
            const novo = JSON.parse(item.valor_novo || '{}');
            const dataAnterior = anterior.data_agendamento ? formatarData(anterior.data_agendamento) : '?';
            const dataNova = novo.data_agendamento ? formatarData(novo.data_agendamento) : '?';
            descricao = `Remarcado de ${dataAnterior} para ${dataNova}`;
          } catch {
            descricao = 'Data do agendamento alterada';
          }
          if (item.campo_alterado) {
            const outrosCampos = item.campo_alterado.split(', ').filter((c: string) => c !== 'data_agendamento');
            if (outrosCampos.length > 0) {
              detalhes = `Outros campos alterados: ${outrosCampos.join(', ')}`;
            }
          }
        } else if (tipoAlteracao === 'dados_editados') {
          descricao = 'Dados Editados';
          if (item.campo_alterado) {
            detalhes = `Campos: ${item.campo_alterado}`;
          }
        } else {
          // Fallback para tipos antigos
          const isStatusChange = tipoAlteracao === 'status_alterado';
          const statusConfig = isStatusChange && item.valor_novo 
            ? STATUS_CONFIG[item.valor_novo] 
            : null;
          
          descricao = isStatusChange 
            ? `Status: ${STATUS_CONFIG[item.valor_anterior]?.label || item.valor_anterior} → ${statusConfig?.label || item.valor_novo}`
            : 'Dados Editados';
          detalhes = !isStatusChange && item.campo_alterado 
            ? `Campos: ${item.campo_alterado}` 
            : '';
        }

        events.push({
          id: item.id,
          tipo: tipoAlteracao === 'agendamento_criado' ? 'criacao' 
              : tipoAlteracao === 'status_alterado' ? 'status'
              : tipoAlteracao === 'data_remarcada' ? 'remarcacao'
              : 'dados',
          descricao,
          detalhes: detalhes || undefined,
          responsavel: responsavelNome,
          icon: config?.icon || Edit,
          color: config?.color || 'bg-muted',
          created_at: item.created_at,
        });
      });

      // Add tracking_sessions events
      trackingData?.forEach((session: any) => {
        const tecnicoNome = session.tecnico?.nome_completo || session.tecnico_nome || null;

        // Event: Trajeto iniciado
        if (session.iniciado_em) {
          events.push({
            id: `${session.id}-iniciado`,
            tipo: 'tracking',
            descricao: TRACKING_CONFIG.em_rota.label,
            detalhes: undefined,
            responsavel: tecnicoNome,
            icon: TRACKING_CONFIG.em_rota.icon,
            color: TRACKING_CONFIG.em_rota.color,
            created_at: session.iniciado_em,
          });
        }

        // Event: Chegou no local
        if (session.chegou_em) {
          const tempoTrajeto = session.iniciado_em 
            ? Math.round((new Date(session.chegou_em).getTime() - new Date(session.iniciado_em).getTime()) / 60000)
            : null;
          
          events.push({
            id: `${session.id}-chegou`,
            tipo: 'tracking',
            descricao: TRACKING_CONFIG.chegou.label,
            detalhes: tempoTrajeto 
              ? `Tempo de trajeto: ${tempoTrajeto} minutos` 
              : undefined,
            responsavel: tecnicoNome,
            icon: TRACKING_CONFIG.chegou.icon,
            color: TRACKING_CONFIG.chegou.color,
            created_at: session.chegou_em,
          });
        }

        // Event: Concluído
        if (session.concluido_em) {
          const duracaoServico = session.chegou_em 
            ? Math.round((new Date(session.concluido_em).getTime() - new Date(session.chegou_em).getTime()) / 60000)
            : null;
          
          events.push({
            id: `${session.id}-concluido`,
            tipo: 'tracking',
            descricao: TRACKING_CONFIG.concluido.label,
            detalhes: duracaoServico 
              ? `Duração do serviço: ${duracaoServico} minutos` 
              : undefined,
            responsavel: tecnicoNome,
            icon: TRACKING_CONFIG.concluido.icon,
            color: TRACKING_CONFIG.concluido.color,
            created_at: session.concluido_em,
          });
        }
      });

      // Sort by date descending
      events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setHistorico(events);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-sm text-muted-foreground">Carregando histórico...</p>;
    }

    if (historico.length === 0) {
      return <p className="text-sm text-muted-foreground">Nenhuma alteração registrada ainda.</p>;
    }

    return (
      <div className="space-y-3">
        {historico.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={item.id} className="flex gap-3">
              {/* Linha vertical */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center shadow-sm`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                {index < historico.length - 1 && (
                  <div className="w-px h-full bg-border/50 mt-1.5" />
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 pb-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{item.descricao}</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {formatDistanceToNow(new Date(item.created_at), { 
                      addSuffix: true,
                      locale: ptBR 
                    })}
                  </Badge>
                </div>

                {/* Responsável */}
                {item.responsavel && (
                  <p className="text-xs text-primary font-medium">
                    por {item.responsavel}
                  </p>
                )}

                {item.detalhes && (
                  <p className="text-sm text-muted-foreground">{item.detalhes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Se for collapsible no mobile
  if (collapsibleOnMobile) {
    return (
      <Card className="backdrop-blur-md bg-background/60 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="py-4 px-5 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-2xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Histórico de Alterações
                  {!loading && historico.length > 0 && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      {historico.length} {historico.length === 1 ? 'evento' : 'eventos'}
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="px-5 pb-5 pt-0">
              {renderContent()}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  // Versão normal (não collapsible)
  return (
    <Card className="backdrop-blur-md bg-background/60 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="py-4 px-5">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Histórico de Alterações
          {!loading && historico.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-2">
              {historico.length} {historico.length === 1 ? 'evento' : 'eventos'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
