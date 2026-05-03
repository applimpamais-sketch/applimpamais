import { useMemo } from 'react';
import { format, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Agendamento } from '@/hooks/useAgendamentos';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface WeekViewGridProps {
  days: Date[];
  agendamentosPorDia: Record<string, Agendamento[]>;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const STATUS_COLORS: Record<string, string> = {
  confirmado: 'bg-green-500',
  em_andamento: 'bg-blue-500',
};

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6);
const HOUR_HEIGHT = 60;

function parseHour(horario: string | null): number | null {
  if (!horario) return null;
  const match = horario.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
}

// Draggable appointment card
function DraggableAppointment({ ag, top }: { ag: Agendamento; top: number }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ag.id,
    data: { agendamento: ag },
  });

  const style: React.CSSProperties = {
    top,
    height: HOUR_HEIGHT - 4,
    ...(transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : {}),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "absolute left-0.5 right-0.5 rounded text-[11px] text-white px-1.5 py-1 overflow-hidden cursor-grab active:cursor-grabbing",
        STATUS_COLORS[ag.status] || 'bg-gray-500'
      )}
      style={style}
    >
      <div className="font-medium truncate">{ag.horario}</div>
      <div className="truncate opacity-90">{ag.nome_cliente}</div>
    </div>
  );
}

// Droppable time slot
function DroppableSlot({ dayKey, hour }: { dayKey: string; hour: number }) {
  const id = `slot-${dayKey}-${String(hour).padStart(2, '0')}`;
  const { setNodeRef, isOver } = useDroppable({ id, data: { dayKey, hour } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute w-full border-t border-border/20 transition-colors",
        isOver && "bg-primary/15"
      )}
      style={{ top: (hour - 6) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
    />
  );
}

export default function WeekViewGrid({
  days,
  agendamentosPorDia,
  selectedDate,
  onDateSelect
}: WeekViewGridProps) {

  const { timedByDay, allDayByDay } = useMemo(() => {
    const timed: Record<string, Agendamento[]> = {};
    const allDay: Record<string, Agendamento[]> = {};

    days.forEach(dia => {
      const key = format(dia, 'yyyy-MM-dd');
      const ags = agendamentosPorDia[key] || [];
      timed[key] = [];
      allDay[key] = [];

      ags.forEach(ag => {
        const hour = parseHour(ag.horario);
        if (hour !== null && hour >= 6 && hour <= 20) {
          timed[key].push(ag);
        } else {
          allDay[key].push(ag);
        }
      });
    });

    return { timedByDay: timed, allDayByDay: allDay };
  }, [days, agendamentosPorDia]);

  const hasAnyAllDay = days.some(d => (allDayByDay[format(d, 'yyyy-MM-dd')] || []).length > 0);

  return (
    <div className="flex flex-col overflow-hidden overflow-x-hidden">
      {/* Header row */}
      <div className="flex border-b bg-muted/30 shrink-0">
        <div className="w-12 md:w-16 shrink-0" />
        {days.map(dia => {
          const isDiaHoje = isToday(dia);
          const isSelected_ = isSameDay(dia, selectedDate);
          return (
            <button
              key={dia.toISOString()}
              onClick={() => onDateSelect(dia)}
              className={cn(
                "flex-1 min-w-0 py-2 flex flex-col items-center gap-0.5 transition-colors",
                "hover:bg-accent/50 border-l border-border/30",
                isSelected_ && "bg-primary/5"
              )}
            >
              <span className="text-[10px] md:text-xs text-muted-foreground">
                {WEEK_DAYS[dia.getDay()]}
              </span>
              <span
                className={cn(
                  "text-lg font-semibold w-9 h-9 flex items-center justify-center rounded-full",
                  isDiaHoje && "bg-primary text-primary-foreground",
                  isSelected_ && !isDiaHoje && "bg-primary/20"
                )}
              >
                {format(dia, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      {/* All-day row */}
      {hasAnyAllDay && (
        <div className="flex border-b shrink-0">
          <div className="w-12 md:w-16 shrink-0 flex items-center justify-end pr-1 md:pr-2">
            <span className="text-[10px] text-muted-foreground">Dia todo</span>
          </div>
          {days.map(dia => {
            const key = format(dia, 'yyyy-MM-dd');
            const ags = allDayByDay[key] || [];
            return (
              <div key={key} className="flex-1 min-w-0 border-l border-border/30 p-1 min-h-[36px]">
                {ags.slice(0, 2).map(ag => (
                  <div
                    key={ag.id}
                    className={cn(
                      "text-[10px] text-white rounded px-1 py-0.5 mb-0.5 truncate",
                      STATUS_COLORS[ag.status] || 'bg-gray-500'
                    )}
                  >
                    {ag.nome_cliente}
                  </div>
                ))}
                {ags.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{ags.length - 2}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="overflow-y-auto flex-1" style={{ maxHeight: '600px' }}>
        <div className="flex relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {/* Time gutter */}
          <div className="w-12 md:w-16 shrink-0 relative">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="absolute right-2 text-xs text-muted-foreground"
                style={{ top: (hour - 6) * HOUR_HEIGHT - 6 }}
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(dia => {
            const key = format(dia, 'yyyy-MM-dd');
            const ags = timedByDay[key] || [];
            const isDiaHoje = isToday(dia);

            return (
              <div
                key={key}
                className={cn(
                  "flex-1 min-w-0 relative border-l border-border/30",
                  isDiaHoje && "bg-primary/5"
                )}
              >
                {/* Droppable hour slots */}
                {HOURS.map(hour => (
                  <DroppableSlot key={hour} dayKey={key} hour={hour} />
                ))}

                {/* Draggable appointments */}
                {ags.map(ag => {
                  const hour = parseHour(ag.horario)!;
                  const top = (hour - 6) * HOUR_HEIGHT;
                  return <DraggableAppointment key={ag.id} ag={ag} top={top} />;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
