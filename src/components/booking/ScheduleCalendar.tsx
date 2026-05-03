import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, isSameDay, isBefore, startOfToday, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScheduleSlot, AvailabilityStatus } from "@/types/booking";
import { getAvailabilityStatus, getAvailabilityColor, getAvailabilityTextColor } from "@/data/schedule";
import { DayPicker } from "react-day-picker";
import { useCalendarioDisponibilidade } from "@/hooks/useCalendarioDisponibilidade";
import type { CalendarioDisponibilidade } from "@/services/api";

// Vagas padrão para datas sem registro no banco (média diária informada pelo cliente)
const DEFAULT_VAGAS_DISPONIVEIS = 6;
const DEFAULT_VAGAS_TOTAIS = 10;

interface ScheduleCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
}

export function ScheduleCalendar({ selectedDate, onDateSelect }: ScheduleCalendarProps) {
  const { data: calendarioData, isLoading } = useCalendarioDisponibilidade();
  
  // Retorna o slot do banco ou um slot padrão para datas futuras sem registro
  const getSlotForDate = (date: Date): CalendarioDisponibilidade | undefined => {
    const today = startOfToday();
    if (isBefore(date, today)) return undefined;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dbSlot = calendarioData?.find(slot => slot.data === dateStr);
    
    // Se não tem dado no banco, retorna slot padrão com vagas disponíveis
    if (!dbSlot) {
      return {
        id: `default-${dateStr}`,
        data: dateStr,
        vagas_disponiveis: DEFAULT_VAGAS_DISPONIVEIS,
        vagas_totais: DEFAULT_VAGAS_TOTAIS,
      };
    }
    
    return dbSlot;
  };

  const isDateDisabled = (date: Date): boolean => {
    const today = startOfToday();
    if (isBefore(date, today)) return true;
    
    const slot = getSlotForDate(date);
    return slot ? slot.vagas_disponiveis === 0 : true;
  };
  
  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando disponibilidade...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Selecione a data do agendamento
          </h3>
          <p className="text-sm text-muted-foreground">
            Escolha uma data disponível para o seu serviço
          </p>
        </div>

        <div className="flex flex-col space-y-6 w-full max-w-full overflow-x-hidden">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            disabled={isDateDisabled}
            locale={ptBR}
            className="rounded-lg border border-border bg-card p-2 sm:p-4 pointer-events-auto w-full max-w-full shadow-subtle"
            classNames={{
              months: "flex flex-col space-y-4 w-full max-w-full",
              month: "space-y-4 w-full max-w-full",
              caption: "flex justify-center pt-2 pb-4 relative items-center px-8",
              caption_label: "text-sm sm:text-base font-semibold text-foreground",
              nav: "space-x-2 flex items-center",
              nav_button: cn(
                "h-6 w-6 sm:h-8 sm:w-8 bg-background border border-border hover:bg-accent hover:text-accent-foreground rounded-md transition-colors duration-200 flex items-center justify-center text-xs sm:text-sm"
              ),
              nav_button_previous: "absolute left-1 sm:left-2",
              nav_button_next: "absolute right-1 sm:right-2",
              table: "w-full max-w-full border-collapse",
              head_row: "grid grid-cols-7 gap-1 mb-2 w-full",
              head_cell: "text-muted-foreground font-medium text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center h-6 sm:h-8",
              row: "grid grid-cols-7 gap-1 w-full mb-1",
              cell: "aspect-square p-0.5 relative focus-within:relative focus-within:z-20 w-full max-w-full",
              day: "w-full h-full p-0.5 sm:p-1 font-medium relative overflow-hidden rounded-md text-[10px] sm:text-xs transition-all duration-200 hover:scale-105 hover:shadow-md border border-transparent flex items-center justify-center",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground border-primary shadow-md scale-105",
            }}
            formatters={{
              formatDay: (date) => {
                const slot = getSlotForDate(date);
                if (!slot) return format(date, 'd');
                
                return format(date, 'd');
              }
            }}
            modifiers={{
              available_high: (date) => {
                const slot = getSlotForDate(date);
                return slot ? getAvailabilityStatus(slot.vagas_disponiveis) === 'high' : false;
              },
              available_low: (date) => {
                const slot = getSlotForDate(date);
                return slot ? getAvailabilityStatus(slot.vagas_disponiveis) === 'low' : false;
              },
              unavailable: (date) => {
                const slot = getSlotForDate(date);
                return slot ? getAvailabilityStatus(slot.vagas_disponiveis) === 'unavailable' : true;
              }
            }}
            modifiersStyles={{
              available_high: {
                backgroundColor: 'hsl(var(--available-high))',
                color: 'hsl(var(--available-high-foreground))',
              },
              available_low: {
                backgroundColor: 'hsl(var(--available-low))',
                color: 'hsl(var(--available-low-foreground))',
              },
              unavailable: {
                backgroundColor: 'hsl(var(--unavailable))',
                color: 'hsl(var(--unavailable-foreground))',
              }
            }}
            components={{
              DayContent: ({ date }) => {
                return (
                  <span className="font-semibold text-[10px] sm:text-sm leading-none">{format(date, 'd')}</span>
                );
              }
            }}
          />

          {/* Vagas disponíveis para a data selecionada */}
          {selectedDate && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-accent/30 rounded-lg border border-border mx-auto w-full max-w-full">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-foreground text-center">
                  Vagas disponíveis: {getSlotForDate(selectedDate)?.vagas_disponiveis || 0}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 p-3 sm:p-4 bg-muted/30 rounded-lg border w-full max-w-full flex-wrap-reverse min-h-0">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border shadow-sm flex-shrink-0"
                style={{ backgroundColor: 'hsl(var(--available-high))' }}
              />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">Muitas vagas (4+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border shadow-sm flex-shrink-0"
                style={{ backgroundColor: 'hsl(var(--available-low))' }}
              />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">Poucas vagas (1-3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border shadow-sm flex-shrink-0"
                style={{ backgroundColor: 'hsl(var(--unavailable))' }}
              />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">Sem vagas</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}