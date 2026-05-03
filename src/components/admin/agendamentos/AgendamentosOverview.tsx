import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Agendamento } from '@/hooks/useAgendamentos';
import StatusDonutChart from './StatusDonutChart';
import AgendamentoListItem from './AgendamentoListItem';
import { CalendarDays, TrendingUp } from 'lucide-react';

interface AgendamentosOverviewProps {
  agendamentos: Agendamento[];
  selectedDate: Date | null;
  onAgendamentoClick: (agendamento: Agendamento) => void;
}

// Status que aparecem no calendário (agenda real de trabalho)
const CALENDAR_STATUS = ['confirmado', 'em_andamento'];

export default function AgendamentosOverview({
  agendamentos,
  selectedDate,
  onAgendamentoClick,
}: AgendamentosOverviewProps) {
  // Filtrar agendamentos do dia selecionado (apenas confirmados/em_andamento)
  const agendamentosDoDia = useMemo(() => {
    if (!selectedDate) return [];
    const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
    return agendamentos
      .filter(ag => ag.data_agendamento === dataFormatada)
      .filter(ag => CALENDAR_STATUS.includes(ag.status));
  }, [agendamentos, selectedDate]);

  // Calcular estatísticas gerais
  const stats = useMemo(() => {
    const contagem = {
      total: agendamentos.length,
      pendentes: 0,
      confirmados: 0,
      concluidos: 0,
      cancelados: 0,
      pagos: 0,
    };
    
    agendamentos.forEach(ag => {
      if (ag.status === 'pendente') contagem.pendentes++;
      if (ag.status === 'confirmado') contagem.confirmados++;
      if (ag.status === 'concluido') contagem.concluidos++;
      if (ag.status === 'cancelado') contagem.cancelados++;
      if (ag.status === 'pago') contagem.pagos++;
    });
    
    return contagem;
  }, [agendamentos]);

  // Stats do dia selecionado
  const statsDia = useMemo(() => {
    const contagem = {
      total: agendamentosDoDia.length,
      pendentes: 0,
      confirmados: 0,
      concluidos: 0,
      cancelados: 0,
      pagos: 0,
    };
    
    let valorTotal = 0;
    
    agendamentosDoDia.forEach(ag => {
      if (ag.status === 'pendente') contagem.pendentes++;
      if (ag.status === 'confirmado') contagem.confirmados++;
      if (ag.status === 'concluido') contagem.concluidos++;
      if (ag.status === 'cancelado') contagem.cancelados++;
      if (ag.status === 'pago') contagem.pagos++;
      valorTotal += ag.valor_total;
    });
    
    return { ...contagem, valorTotal };
  }, [agendamentosDoDia]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Card de Overview Geral */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <StatusDonutChart stats={stats} />
        </CardContent>
      </Card>

      {/* Card de Agendamentos do Dia - hidden on mobile (SelectedDayAgendamentos handles it there) */}
      <div className="hidden lg:flex flex-1 flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {selectedDate ? (
                  <span>
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                ) : (
                  'Selecione um dia'
                )}
              </div>
              {agendamentosDoDia.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {agendamentosDoDia.length} agendamento(s)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-1 min-h-0">
            {agendamentosDoDia.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Nenhum agendamento neste dia</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-3">
                <div className="space-y-2">
                  {agendamentosDoDia.map(agendamento => (
                    <AgendamentoListItem
                      key={agendamento.id}
                      agendamento={agendamento}
                      onClick={() => onAgendamentoClick(agendamento)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
