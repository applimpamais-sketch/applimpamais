import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, RefreshCw, Filter, Download, FileSpreadsheet, FileText, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgendamentoFilters } from '@/hooks/useAgendamentos';
import { useTecnicos } from '@/hooks/useTecnicos';
import PeriodFilter, { type PeriodType } from '@/components/admin/PeriodFilter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AgendamentosFiltersProps {
  busca: string;
  setBusca: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  filters: AgendamentoFilters;
  setFilters: (filters: AgendamentoFilters) => void;
  onSearch: () => void;
  onClear: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  period: PeriodType;
  setPeriod: (value: PeriodType) => void;
  customRange: { start: Date; end: Date };
  setCustomRange: (range: { start: Date; end: Date }) => void;
}

export default function AgendamentosFilters({
  busca,
  setBusca,
  statusFilter,
  setStatusFilter,
  filters,
  setFilters,
  onSearch,
  onClear,
  onExportExcel,
  onExportPDF,
  period,
  setPeriod,
  customRange,
  setCustomRange
}: AgendamentosFiltersProps) {
  const { data: tecnicos } = useTecnicos();

  const hasActiveFilters = filters.dataInicio || filters.dataFim || filters.bairro || 
                            filters.tecnicoId || filters.valorMinimo || filters.valorMaximo ||
                            filters.origemTipo;

  return (
    <Card className="backdrop-blur-md bg-background/60 rounded-xl shadow-md border-border/50 p-3 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Busca */}
        <div className="flex gap-1.5 flex-1 min-w-[200px]">
          <Input 
            placeholder="Buscar cliente ou telefone..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="h-8 text-sm"
          />
          <Button onClick={onSearch} size="icon" className="h-8 w-8 flex-shrink-0">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Status */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        {/* Técnico - Movido para linha principal */}
        <Select 
          value={filters.tecnicoId || 'todos'} 
          onValueChange={(value) => setFilters({ ...filters, tecnicoId: value === 'todos' ? undefined : value })}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs hidden md:flex">
            <SelectValue placeholder="Técnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Técnico</SelectItem>
            {tecnicos?.map((tecnico) => (
              <SelectItem key={tecnico.id} value={tecnico.id}>
                {tecnico.nome_completo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Período */}
        <div className="hidden md:flex">
          <PeriodFilter
            value={period}
            onChange={setPeriod}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
          />
        </div>

        {/* + Mais Filtros */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 text-xs gap-1",
                hasActiveFilters && "border-primary text-primary"
              )}
            >
              <Filter className="h-3 w-3" />
              <span className="hidden sm:inline">+ Filtros</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <div className="space-y-3">
              <p className="text-sm font-medium">Filtros Avançados</p>
              
              {/* Origem */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Origem</label>
                <Select 
                  value={filters.origemTipo || 'todas'} 
                  onValueChange={(value) => setFilters({ ...filters, origemTipo: value === 'todas' ? undefined : value as any })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <Link className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas Origens</SelectItem>
                    <SelectItem value="parceiro">Parceiros</SelectItem>
                    <SelectItem value="canal">Canais Orgânicos</SelectItem>
                    <SelectItem value="bot">Bot WhatsApp</SelectItem>
                    <SelectItem value="atendente">Atendente</SelectItem>
                    <SelectItem value="manual">Manual (Admin)</SelectItem>
                    <SelectItem value="direto">Direto (Site)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bairro */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Bairro</label>
                <Input
                  placeholder="Filtrar por bairro..."
                  value={filters.bairro || ''}
                  onChange={(e) => setFilters({ ...filters, bairro: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              {/* Valor */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor Mín</label>
                  <Input
                    type="number"
                    placeholder="R$ 0"
                    value={filters.valorMinimo || ''}
                    onChange={(e) => setFilters({ ...filters, valorMinimo: e.target.value ? Number(e.target.value) : undefined })}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor Máx</label>
                  <Input
                    type="number"
                    placeholder="R$ 999"
                    value={filters.valorMaximo || ''}
                    onChange={(e) => setFilters({ ...filters, valorMaximo: e.target.value ? Number(e.target.value) : undefined })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={onClear} className="w-full h-8 text-xs">
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Limpar Filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Exportar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Limpar (somente se tiver filtros) */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8 text-xs gap-1">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Card>
  );
}
