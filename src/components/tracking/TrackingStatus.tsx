import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  MapPin, 
  User, 
  Wrench, 
  Calendar,
  CheckCircle,
  Navigation,
  Phone
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrackingStatusProps {
  status: 'em_rota' | 'chegou' | 'servico_em_andamento' | 'concluido' | 'cancelado';
  tecnicoNome: string | null;
  etaMinutos: number | null;
  distanciaMetros: number | null;
  agendamento: {
    nome_cliente: string;
    telefone: string;
    endereco: string;
    bairro?: string | null;
    cidade?: string | null;
    data_agendamento: string;
    horario?: string | null;
    valor_total: number;
    itens_carrinho: any[];
  } | null;
  lastUpdate: Date | null;
}

const statusConfig = {
  em_rota: {
    label: 'A caminho',
    color: 'bg-blue-500',
    icon: Navigation,
    description: 'O técnico está se deslocando até você',
  },
  chegou: {
    label: 'Técnico chegou!',
    color: 'bg-green-500',
    icon: MapPin,
    description: 'O técnico chegou ao seu endereço',
  },
  servico_em_andamento: {
    label: 'Serviço em andamento',
    color: 'bg-purple-500',
    icon: Wrench,
    description: 'O serviço está sendo realizado',
  },
  concluido: {
    label: 'Concluído',
    color: 'bg-emerald-500',
    icon: CheckCircle,
    description: 'Serviço finalizado com sucesso!',
  },
  cancelado: {
    label: 'Cancelado',
    color: 'bg-red-500',
    icon: CheckCircle,
    description: 'Este serviço foi cancelado',
  },
};

export default function TrackingStatus({
  status,
  tecnicoNome,
  etaMinutos,
  distanciaMetros,
  agendamento,
  lastUpdate,
}: TrackingStatusProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatDistance = (metros: number) => {
    if (metros >= 1000) {
      return `${(metros / 1000).toFixed(1)} km`;
    }
    return `${metros} m`;
  };

  const formatETA = (minutos: number) => {
    if (minutos < 60) {
      return `~${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `~${horas}h ${mins}min`;
  };

  const getItensDescricao = () => {
    if (!agendamento?.itens_carrinho?.length) return 'Serviço';
    
    return agendamento.itens_carrinho
      .map((item: any) => item.nome || item.name || item.item || 'Serviço')
      .slice(0, 2)
      .join(', ') + (agendamento.itens_carrinho.length > 2 ? ` +${agendamento.itens_carrinho.length - 2}` : '');
  };

  return (
    <Card className="overflow-hidden">
      {/* Header com Status */}
      <div className={`${config.color} text-white p-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <StatusIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{config.label}</h2>
            <p className="text-sm text-white/90">{config.description}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Técnico e ETA */}
        {status === 'em_rota' && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{tecnicoNome || 'Técnico'}</p>
                <p className="text-xs text-muted-foreground">está a caminho</p>
              </div>
            </div>
            
            <div className="text-right">
              {etaMinutos !== null && (
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatETA(etaMinutos)}
                </p>
              )}
              {distanciaMetros !== null && (
                <p className="text-xs text-muted-foreground">
                  {formatDistance(distanciaMetros)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Status chegou */}
        {status === 'chegou' && (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full animate-pulse">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                {tecnicoNome || 'O técnico'} chegou!
              </p>
              <p className="text-sm text-muted-foreground">
                Aguarde, ele irá tocar a campainha
              </p>
            </div>
          </div>
        )}

        {/* Status concluído */}
        {status === 'concluido' && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                Serviço concluído!
              </p>
              <p className="text-sm text-muted-foreground">
                Obrigado por escolher a RC Limpa Mais
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Informações do Serviço */}
        {agendamento && (
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2 text-sm">
              <Wrench className="h-4 w-4 text-primary" />
              Detalhes do Serviço
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">{agendamento.endereco}</p>
                  <p className="text-muted-foreground text-xs">
                    {agendamento.bairro}{agendamento.cidade && `, ${agendamento.cidade}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(agendamento.data_agendamento + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                  {agendamento.horario && ` • ${agendamento.horario}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span>{getItensDescricao()}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/30 rounded-lg mt-3">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(agendamento.valor_total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Última atualização */}
        {lastUpdate && status === 'em_rota' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3 w-3" />
            <span>
              Última atualização: {format(lastUpdate, "HH:mm:ss", { locale: ptBR })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
