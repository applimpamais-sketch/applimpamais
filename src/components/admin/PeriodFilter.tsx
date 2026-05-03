import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export type PeriodType = 'hoje' | 'maximo' | 'ontem' | '7dias' | 'mes' | 'mes-passado' | 'personalizado';

interface PeriodFilterProps {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
  customRange?: { start: Date; end: Date };
  onCustomRangeChange?: (range: { start: Date; end: Date }) => void;
}

export default function PeriodFilter({ value, onChange, customRange, onCustomRangeChange }: PeriodFilterProps) {
  const [showCustomPickers, setShowCustomPickers] = useState(value === 'personalizado');

  const handlePeriodChange = (newValue: PeriodType) => {
    onChange(newValue);
    setShowCustomPickers(newValue === 'personalizado');
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date && customRange && onCustomRangeChange) {
      onCustomRangeChange({ start: date, end: customRange.end });
    } else if (date && onCustomRangeChange) {
      onCustomRangeChange({ start: date, end: new Date() });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date && customRange && onCustomRangeChange) {
      onCustomRangeChange({ start: customRange.start, end: date });
    } else if (date && onCustomRangeChange) {
      onCustomRangeChange({ start: new Date(), end: date });
    }
  };

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <Select value={value} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-full sm:w-[160px] md:w-[200px] text-xs sm:text-sm">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hoje">Hoje</SelectItem>
          <SelectItem value="maximo">Máximo</SelectItem>
          <SelectItem value="ontem">Ontem</SelectItem>
          <SelectItem value="7dias">Últimos 7 dias</SelectItem>
          <SelectItem value="mes">Esse mês</SelectItem>
          <SelectItem value="mes-passado">Mês passado</SelectItem>
          <SelectItem value="personalizado">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {showCustomPickers && (
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[140px] md:w-[160px] justify-start text-left font-normal text-xs sm:text-sm",
                  !customRange?.start && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {customRange?.start ? (
                  format(customRange.start, 'dd/MM/yy', { locale: ptBR })
                ) : (
                  <span>Início</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customRange?.start}
                onSelect={handleStartDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[140px] md:w-[160px] justify-start text-left font-normal text-xs sm:text-sm",
                  !customRange?.end && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {customRange?.end ? (
                  format(customRange.end, 'dd/MM/yy', { locale: ptBR })
                ) : (
                  <span>Fim</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customRange?.end}
                onSelect={handleEndDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
