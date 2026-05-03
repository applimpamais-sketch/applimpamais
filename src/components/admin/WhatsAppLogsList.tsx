import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, ShieldAlert, MessageCircle, Image, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppLog {
  id: string;
  telefone_remetente: string;
  tipo_mensagem: string;
  processamento_status: string;
  analise_ia?: any;
  erro_mensagem?: string;
  created_at: string;
}

interface WhatsAppLogsListProps {
  logs: WhatsAppLog[];
  realtimeLog: WhatsAppLog | null;
}

const statusConfig = {
  sucesso: {
    icon: CheckCircle,
    label: 'Sucesso',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  erro: {
    icon: XCircle,
    label: 'Erro',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  processando: {
    icon: Clock,
    label: 'Processando',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  },
  nao_autorizado: {
    icon: ShieldAlert,
    label: 'Não Autorizado',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
};

const tipoMensagemIcon = {
  text: MessageCircle,
  image: Image,
  audio: Mic,
  ptt: Mic,
};

export function WhatsAppLogsList({ logs, realtimeLog }: WhatsAppLogsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Mensagens em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma mensagem processada ainda
            </p>
          ) : (
            logs.map((log) => {
              const statusInfo = statusConfig[log.processamento_status as keyof typeof statusConfig] || statusConfig.processando;
              const StatusIcon = statusInfo.icon;
              const TipoIcon = tipoMensagemIcon[log.tipo_mensagem as keyof typeof tipoMensagemIcon] || MessageCircle;
              const isNew = realtimeLog?.id === log.id;

              return (
                <div
                  key={log.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    isNew ? 'border-primary bg-primary/5 animate-in fade-in slide-in-from-top-2' : 'border-border'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TipoIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono text-muted-foreground">
                        {log.telefone_remetente}
                      </span>
                    </div>
                    <Badge variant="outline" className={cn('text-xs', statusInfo.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {log.analise_ia && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                      <p className="font-medium">
                        💰 R$ {log.analise_ia.valor?.toFixed(2) || 'N/A'}
                      </p>
                      <p className="text-muted-foreground truncate">
                        {log.analise_ia.descricao || 'Sem descrição'}
                      </p>
                      {log.analise_ia.confianca && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Confiança: {log.analise_ia.confianca}%
                        </p>
                      )}
                    </div>
                  )}

                  {log.erro_mensagem && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded text-sm text-red-600">
                      {log.erro_mensagem}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
