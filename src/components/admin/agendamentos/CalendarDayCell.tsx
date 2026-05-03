import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Agendamento } from '@/hooks/useAgendamentos';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface CalendarDayCellProps {
  date: Date;
  agendamentos: Agendamento[];
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}

const STATUS_BORDER_COLORS: Record<string, string> = {
  confirmado: 'border-l-green-500',
  em_andamento: 'border-l-blue-500',
};

function DraggableMiniCard({ ag }: { ag: Agendamento }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ag.id,
    data: { agendamento: ag },
  });

  const style: React.CSSProperties = {
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
      style={style}
      className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[11px] leading-tight",
        "border-l-2 bg-muted/50 truncate cursor-grab active:cursor-grabbing",
        STATUS_BORDER_COLORS[ag.status] || 'border-l-gray-400'
      )}
    >
      <span className="font-medium text-muted-foreground shrink-0">
        {ag.horario || '—'}
      </span>
      <span className="truncate text-foreground">
        {ag.nome_cliente}
      </span>
    </div>
  );
}

export default function CalendarDayCell({
  date,
  agendamentos,
  isSelected,
  isToday: isTodayProp,
  isCurrentMonth,
  onClick
}: CalendarDayCellProps) {
  const dayNumber = format(date, 'd');
  const MAX_VISIBLE = 3;
  const dayKey = format(date, 'yyyy-MM-dd');

  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayKey}`,
    data: { dayKey },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-b border-r border-border/30 transition-all duration-200",
        "flex flex-col items-start hover:bg-accent/50 text-left cursor-pointer",
        isSelected && "bg-primary/10 ring-2 ring-primary ring-inset",
        isTodayProp && !isSelected && "bg-accent/30",
        !isCurrentMonth && "opacity-40 bg-muted/20",
        isOver && "bg-primary/15 ring-2 ring-primary/50 ring-inset"
      )}
    >
      <span 
        className={cn(
          "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
          isTodayProp && "bg-primary text-primary-foreground",
          isSelected && !isTodayProp && "bg-primary/20"
        )}
      >
        {dayNumber}
      </span>
      
      {agendamentos.length > 0 && (
        <div className="flex flex-col gap-0.5 w-full overflow-hidden flex-1">
          {agendamentos.slice(0, MAX_VISIBLE).map(ag => (
            <DraggableMiniCard key={ag.id} ag={ag} />
          ))}
          {agendamentos.length > MAX_VISIBLE && (
            <span className="text-[10px] text-muted-foreground pl-1">
              +{agendamentos.length - MAX_VISIBLE} mais
            </span>
          )}
        </div>
      )}
    </div>
  );
}
