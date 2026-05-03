import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STATUS_COLORS, STATUS_LABELS } from '@/utils/dashboardColors';
import { cn } from '@/lib/utils';
import { OrigemAgendamentoBadge } from './OrigemAgendamentoBadge';

interface AgendamentosRecentesListProps {
  agendamentos: any[];
}

export default function AgendamentosRecentesList({ agendamentos }: AgendamentosRecentesListProps) {
  if (agendamentos.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Nenhum agendamento recente</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3 pr-4">
        {agendamentos.map((agendamento) => {
          const status = agendamento.status as keyof typeof STATUS_COLORS;
          const colors = STATUS_COLORS[status] || STATUS_COLORS.pendente;
          const primeiroServico = agendamento.itens_carrinho?.[0]?.name || 'Serviço';

          return (
            <div
              key={agendamento.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50',
                colors.bg
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm truncate">
                    {agendamento.nome_cliente}
                  </p>
                  <OrigemAgendamentoBadge
                    origem={agendamento.origem}
                    criadoPorFuncionarioBotId={agendamento.criado_por_funcionario_bot}
                    criadoManualmente={agendamento.criado_manualmente}
                    parceiroCodigo={agendamento.parceiro_codigo}
                    canalOrigem={agendamento.canal_origem}
                    compact
                    className="text-[10px] py-0 px-1.5 h-4"
                  />
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {primeiroServico}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(agendamento.data_agendamento + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                  {agendamento.horario && ` às ${agendamento.horario}`}
                </p>
              </div>

              <Badge
                variant="outline"
                className={cn('ml-3 whitespace-nowrap', colors.badge, colors.text, colors.border)}
              >
                {STATUS_LABELS[status]}
              </Badge>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
