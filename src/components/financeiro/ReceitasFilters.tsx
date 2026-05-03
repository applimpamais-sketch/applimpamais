import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, X, CalendarIcon, SlidersHorizontal } from 'lucide-react';
import { ReceitasFilters } from '@/hooks/useReceitas';
import { STATUS_PAGAMENTO, FORMAS_PAGAMENTO, CATEGORIAS_RECEITA } from '@/utils/financeiroHelpers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface ReceitasFiltersProps {
  filters: ReceitasFilters;
  onFiltersChange: (filters: ReceitasFilters) => void;
}

export function ReceitasFiltersComponent({ filters, onFiltersChange }: ReceitasFiltersProps) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  
  const handleClear = () => {
    onFiltersChange({});
  };

  const hasFilters = () => {
    return (
      filters.busca ||
      (filters.origem && filters.origem !== 'all') ||
      (filters.categoriaReceita && filters.categoriaReceita !== 'all') ||
      (filters.statusPagamento && filters.statusPagamento !== 'all') ||
      (filters.formaPagamento && filters.formaPagamento !== 'all') ||
      filters.dataInicio ||
      filters.dataFim
    );
  };

  const hasSecondaryFilters = () => {
    return (
      (filters.categoriaReceita && filters.categoriaReceita !== 'all') ||
      (filters.formaPagamento && filters.formaPagamento !== 'all')
    );
  };

  const dateRange: DateRange | undefined = filters.dataInicio || filters.dataFim
    ? { from: filters.dataInicio, to: filters.dataFim }
    : undefined;

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dataInicio: range?.from,
      dataFim: range?.to,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      {/* Busca */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          className="pl-10 h-9"
          value={filters.busca || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, busca: e.target.value || undefined })
          }
        />
      </div>

      {/* Status */}
      <Select
        value={filters.statusPagamento || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            statusPagamento: value === 'all' ? undefined : value,
          })
        }
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos status</SelectItem>
          {STATUS_PAGAMENTO.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Origem */}
      <Select
        value={filters.origem || 'all'}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, origem: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas origens</SelectItem>
          <SelectItem value="site">Site</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start text-left font-normal min-w-[200px]",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* More Filters Popover */}
      <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "h-9 gap-2",
              hasSecondaryFilters() && "border-primary text-primary"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            + Filtros
            {hasSecondaryFilters() && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {(filters.categoriaReceita ? 1 : 0) + (filters.formaPagamento ? 1 : 0)}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select
                value={filters.categoriaReceita || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    categoriaReceita: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {CATEGORIAS_RECEITA.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select
                value={filters.formaPagamento || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    formaPagamento: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas formas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas formas</SelectItem>
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <SelectItem key={forma.value} value={forma.value}>
                      {forma.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasFilters() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-9 px-2"
          title="Limpar filtros"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
