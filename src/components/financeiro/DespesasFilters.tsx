import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, X, MessageCircle, Pencil, CalendarIcon, SlidersHorizontal } from "lucide-react";
import { CATEGORIAS_DESPESAS, STATUS_DESPESA, FORMAS_PAGAMENTO } from "@/utils/financeiroHelpers";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface DespesasFiltersProps {
  filters: {
    categoria?: string;
    status?: string;
    dataInicio?: Date;
    dataFim?: Date;
    search?: string;
    origem?: 'manual' | 'whatsapp';
    formaPagamento?: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export function DespesasFilters({ filters, onFiltersChange, onClearFilters }: DespesasFiltersProps) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  
  const hasFilters = filters.categoria || filters.status || filters.dataInicio || filters.dataFim || filters.search || filters.origem || filters.formaPagamento;

  const hasSecondaryFilters = filters.categoria || filters.formaPagamento;

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
    <div className="flex flex-wrap items-center gap-3">
      {/* Busca */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar descrição..."
          value={filters.search || ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9 h-9"
        />
      </div>

      {/* Status */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos status</SelectItem>
          {STATUS_DESPESA.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Origem */}
      <Select
        value={filters.origem || "all"}
        onValueChange={(value) => onFiltersChange({ ...filters, origem: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas origens</SelectItem>
          <SelectItem value="manual">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Manual
            </div>
          </SelectItem>
          <SelectItem value="whatsapp">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </div>
          </SelectItem>
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
              hasSecondaryFilters && "border-primary text-primary"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            + Filtros
            {hasSecondaryFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {(filters.categoria ? 1 : 0) + (filters.formaPagamento ? 1 : 0)}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select
                value={filters.categoria || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, categoria: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {CATEGORIAS_DESPESAS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select
                value={filters.formaPagamento || "all"}
                onValueChange={(value) => onFiltersChange({ ...filters, formaPagamento: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas formas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas formas</SelectItem>
                  {FORMAS_PAGAMENTO.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasFilters && (
        <Button 
          variant="ghost" 
          onClick={onClearFilters} 
          size="sm"
          className="h-9 px-2"
          title="Limpar filtros"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
