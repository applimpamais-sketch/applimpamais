import { motion } from 'framer-motion';
import { MapPin, Calendar, Wrench, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrackingClientCardProps {
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
  };
  lastUpdate: Date | null;
  status: 'em_rota' | 'chegou' | 'servico_em_andamento' | 'concluido' | 'cancelado';
}

export default function TrackingClientCard({
  agendamento,
  lastUpdate,
  status,
}: TrackingClientCardProps) {
  const getItensDescricao = () => {
    if (!agendamento?.itens_carrinho?.length) return 'Serviço';

    return agendamento.itens_carrinho
      .map((item: any) => item.nome || item.name || item.item || 'Serviço')
      .slice(0, 2)
      .join(', ') +
      (agendamento.itens_carrinho.length > 2
        ? ` +${agendamento.itens_carrinho.length - 2}`
        : '');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-4 space-y-4">
          {/* Serviço Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{getItensDescricao()}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(agendamento.data_agendamento + 'T00:00:00'), "dd 'de' MMMM", {
                    locale: ptBR,
                  })}
                  {agendamento.horario && ` • ${agendamento.horario}`}
                </p>
              </div>
            </div>

            <Separator />

            {/* Endereço */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{agendamento.endereco}</p>
                <p className="text-xs text-muted-foreground">
                  {agendamento.bairro}
                  {agendamento.cidade && `, ${agendamento.cidade}`}
                </p>
              </div>
            </div>

            <Separator />

            {/* Valor */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <span className="text-sm font-medium">Valor do serviço</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(agendamento.valor_total)}
              </span>
            </div>
          </div>

          {/* Última atualização */}
          {lastUpdate && status === 'em_rota' && (
            <motion.div
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <Clock className="h-3 w-3" />
              <span>
                Atualizado {format(lastUpdate, 'HH:mm:ss', { locale: ptBR })}
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
