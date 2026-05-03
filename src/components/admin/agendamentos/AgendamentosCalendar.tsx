import { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameMonth
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Agendamento } from '@/hooks/useAgendamentos';
import CalendarDayCell from './CalendarDayCell';
import WeekViewGrid from './WeekViewGrid';
import DayViewGrid from './DayViewGrid';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useUpdateAgendamento } from '@/hooks/useUpdateAgendamento';
import { toast } from 'sonner';

interface AgendamentosCalendarProps {
  agendamentos: Agendamento[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  onAgendamentoClick?: (agendamento: Agendamento) => void;
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function AgendamentosCalendar({
  agendamentos,
  selectedDate,
  onDateSelect,
  viewMode,
  onViewModeChange,
  onAgendamentoClick
}: AgendamentosCalendarProps) {
  const updateAgendamento = useUpdateAgendamento();

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const CALENDAR_STATUS = ['confirmado', 'em_andamento'];

  const agendamentosPorDia = useMemo(() => {
    return agendamentos
      .filter(ag => CALENDAR_STATUS.includes(ag.status))
      .reduce((acc, ag) => {
        const data = ag.data_agendamento;
        if (!acc[data]) acc[data] = [];
        acc[data].push(ag);
        return acc;
      }, {} as Record<string, Agendamento[]>);
  }, [agendamentos]);

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
    return [selectedDate];
  }, [selectedDate, viewMode]);

  const navigate = (direction: number) => {
    if (viewMode === 'month') {
      onDateSelect(direction > 0 ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1));
    } else if (viewMode === 'week') {
      onDateSelect(direction > 0 ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1));
    } else {
      onDateSelect(direction > 0 ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
    }
  };

  const goToToday = () => onDateSelect(new Date());

  const getTitle = () => {
    if (viewMode === 'month') return format(selectedDate, 'MMMM yyyy', { locale: ptBR });
    if (viewMode === 'week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return `${format(start, 'd MMM', { locale: ptBR })} - ${format(end, 'd MMM yyyy', { locale: ptBR })}`;
    }
    return format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: ptBR });
  };

  const agendamentosDoDia = useMemo(() => {
    const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
    return agendamentosPorDia[dataFormatada] || [];
  }, [selectedDate, agendamentosPorDia]);

  // Find agendamento by id from all agendamentos
  const findAgendamento = useCallback((id: string) => {
    return agendamentos.find(ag => ag.id === id);
  }, [agendamentos]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const ag = findAgendamento(active.id as string);
    if (!ag) return;

    const overId = over.id as string;
    let newDate: string | undefined;
    let newHorario: string | null | undefined;

    if (overId.startsWith('day-')) {
      // Dropped on a day cell (month view)
      newDate = overId.replace('day-', '');
    } else if (overId.startsWith('slot-')) {
      // Dropped on a time slot (week view): slot-YYYY-MM-DD-HH
      const parts = overId.replace('slot-', '').split('-');
      newDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
      const hour = parseInt(parts[3], 10);
      newHorario = `${String(hour).padStart(2, '0')}:00`;
    }

    if (!newDate) return;

    // Check if anything actually changed
    const dateChanged = newDate !== ag.data_agendamento;
    const horarioChanged = newHorario !== undefined && newHorario !== ag.horario;

    if (!dateChanged && !horarioChanged) return;

    const updateData: any = {};
    const originalData: any = {};

    if (dateChanged) {
      updateData.data_agendamento = newDate;
      originalData.data_agendamento = ag.data_agendamento;
    }
    if (horarioChanged && newHorario !== undefined) {
      updateData.horario = newHorario;
      originalData.horario = ag.horario;
    }

    updateAgendamento.mutate({
      id: ag.id,
      data: updateData,
      originalData,
    });
  }, [findAgendamento, updateAgendamento]);

  return (
    <Card className="flex-1 overflow-hidden">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>Hoje</Button>
          </div>
          <CardTitle className="text-base md:text-xl capitalize">{getTitle()}</CardTitle>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange(mode)}
                className={cn("text-xs px-3", viewMode === mode && "shadow-sm")}
              >
                {mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {/* Month view */}
          {viewMode === 'month' && (
            <>
              <div className="grid grid-cols-7 border-b bg-muted/30">
                {WEEK_DAYS.map(dia => (
                  <div key={dia} className="p-1.5 md:p-3 text-center text-xs md:text-sm font-medium text-muted-foreground">
                    {dia}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map(dia => (
                  <CalendarDayCell
                    key={dia.toISOString()}
                    date={dia}
                    agendamentos={agendamentosPorDia[format(dia, 'yyyy-MM-dd')] || []}
                    isSelected={isSameDay(dia, selectedDate)}
                    isToday={isToday(dia)}
                    isCurrentMonth={isSameMonth(dia, selectedDate)}
                    onClick={() => onDateSelect(dia)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Week view */}
          {viewMode === 'week' && (
            <WeekViewGrid
              days={calendarDays}
              agendamentosPorDia={agendamentosPorDia}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
            />
          )}

          {/* Day view */}
          {viewMode === 'day' && onAgendamentoClick && (
            <DayViewGrid
              date={selectedDate}
              agendamentos={agendamentosDoDia}
              onAgendamentoClick={onAgendamentoClick}
            />
          )}
        </DndContext>
      </CardContent>
    </Card>
  );
}
