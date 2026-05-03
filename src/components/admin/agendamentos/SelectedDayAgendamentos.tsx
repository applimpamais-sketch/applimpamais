import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Agendamento } from '@/hooks/useAgendamentos';
import AgendamentoListItem from './AgendamentoListItem';
import { CalendarDays } from 'lucide-react';

interface SelectedDayAgendamentosProps {
  agendamentos: Agendamento[];
  selectedDate: Date;
  onAgendamentoClick: (agendamento: Agendamento) => void;
}

const CALENDAR_STATUS = ['confirmado', 'em_andamento'];

export default function SelectedDayAgendamentos({
  agendamentos,
  selectedDate,
  onAgendamentoClick
}: SelectedDayAgendamentosProps) {
  const agendamentosDoDia = useMemo(() => {
    const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
    return agendamentos
      .filter(ag => ag.data_agendamento === dataFormatada)
      .filter(ag => CALENDAR_STATUS.includes(ag.status));
  }, [agendamentos, selectedDate]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          {agendamentosDoDia.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {agendamentosDoDia.length} agendamento(s)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {agendamentosDoDia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <CalendarDays className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Nenhum agendamento neste dia</p>
          </div>
        ) : (
          <ScrollArea className={agendamentosDoDia.length > 4 ? "h-[250px]" : ""}>
            <div className="space-y-2 pr-1">
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
  );
}
