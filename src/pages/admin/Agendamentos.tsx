import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Eye, ExternalLink, MapPin, Plus, List, Calendar as CalendarIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import GoogleAgendaTab from '@/components/admin/agendamentos/GoogleAgendaTab';
import { OrigemAgendamentoBadge } from '@/components/admin/OrigemAgendamentoBadge';
import AgendamentoStatusTags from '@/components/admin/AgendamentoStatusTags';
import { useAgendamentos, Agendamento, AgendamentoFilters } from '@/hooks/useAgendamentos';
import StatusDropdown from '@/components/admin/StatusDropdown';
import AgendamentoDetailsModal from '@/components/admin/AgendamentoDetailsModal';
import AgendamentosFilters from '@/components/admin/AgendamentosFilters';
import AgendamentosBulkActions from '@/components/admin/AgendamentosBulkActions';
import AgendamentosStatsHeader from '@/components/admin/AgendamentosStatsHeader';
import CriarAgendamentoManualModal from '@/components/admin/CriarAgendamentoManualModal';
import ConfirmarPagamentoModal from '@/components/admin/ConfirmarPagamentoModal';
import AgendamentosCalendar from '@/components/admin/agendamentos/AgendamentosCalendar';
import AgendamentosOverview from '@/components/admin/agendamentos/AgendamentosOverview';
import SelectedDayAgendamentos from '@/components/admin/agendamentos/SelectedDayAgendamentos';
import { formatCurrency, formatPhone, formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import AdminContainer from '@/components/admin/AdminContainer';
import { useIsMobile } from '@/hooks/use-mobile';
import { startOfDay, isToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { type PeriodType } from '@/components/admin/PeriodFilter';
import { usePeriodDateRange } from '@/hooks/usePeriodDateRange';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF, formatCurrencyForExport, formatDateForExport, formatPhoneForExport } from '@/utils/exportHelpers';

export default function Agendamentos() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [filters, setFilters] = useState<AgendamentoFilters>({});
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCriarModal, setShowCriarModal] = useState(false);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [agendamentoParaPagar, setAgendamentoParaPagar] = useState<Agendamento | null>(null);
  const [sortField, setSortField] = useState<'created_at' | 'data_agendamento'>('data_agendamento');
  const [sortAscending, setSortAscending] = useState(false);
  // Estado do filtro de período
  const [period, setPeriod] = useState<PeriodType>('maximo');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
  const dateRange = usePeriodDateRange(period, customRange);

  // Sincronizar período com filtros de data
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      dataInicio: dateRange?.start,
      dataFim: dateRange?.end,
      sortField,
      sortAscending
    }));
  }, [dateRange?.start?.getTime(), dateRange?.end?.getTime(), sortField, sortAscending]);

  const toggleSort = (field: 'created_at' | 'data_agendamento') => {
    if (sortField === field) {
      setSortAscending(prev => !prev);
    } else {
      setSortField(field);
      setSortAscending(false);
    }
  };

  const SortIcon = ({ field }: { field: 'created_at' | 'data_agendamento' }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortAscending ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  // Estados para visualização do calendário
  const [viewType, setViewType] = useState<'list' | 'calendar' | 'google'>('list');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  const { agendamentos, loading, updateStatus } = useAgendamentos(filters);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const hoje = startOfDay(new Date());
    const semanaInicio = startOfWeek(hoje, { weekStartsOn: 0 });
    const semanaFim = endOfWeek(hoje, { weekStartsOn: 0 });
    const mesInicio = startOfMonth(hoje);
    const mesFim = endOfMonth(hoje);

    const statsHoje = agendamentos.reduce((acc, ag) => {
      const dataAg = startOfDay(new Date(ag.created_at));
      if (isToday(dataAg)) {
        acc.total++;
        acc.valor += ag.valor_total;
        if (ag.status === 'concluido') acc.concluidos++;
        if (ag.status === 'pendente') acc.pendentes++;
      }
      return acc;
    }, { total: 0, valor: 0, concluidos: 0, pendentes: 0 });

    const statsSemana = agendamentos.reduce((acc, ag) => {
      const dataAg = new Date(ag.created_at);
      if (dataAg >= semanaInicio && dataAg <= semanaFim) {
        acc.total++;
        acc.valor += ag.valor_total;
      }
      return acc;
    }, { total: 0, valor: 0 });

    const statsMes = agendamentos.reduce((acc, ag) => {
      const dataAg = new Date(ag.created_at);
      if (dataAg >= mesInicio && dataAg <= mesFim) {
        acc.total++;
        acc.valor += ag.valor_total;
      }
      return acc;
    }, { total: 0, valor: 0 });

    return { statsHoje, statsSemana, statsMes };
  }, [agendamentos]);

  const handleSearch = () => {
    setFilters({ ...filters, busca });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === 'todos') {
      const { status, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({ ...filters, status: [value] });
    }
  };

  const handleClearFilters = () => {
    setBusca('');
    setStatusFilter('todos');
    setFilters({});
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(agendamentos.map(ag => ag.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      for (const id of selectedIds) {
        await updateStatus(id, newStatus);
      }
      toast({ title: `${selectedIds.length} agendamento(s) atualizado(s) com sucesso!` });
      setSelectedIds([]);
    } catch (error) {
      toast({ title: 'Erro ao atualizar agendamentos', variant: 'destructive' });
    }
  };

  const handleBulkExport = () => {
    const selectedAgendamentos = agendamentos.filter(ag => selectedIds.includes(ag.id));
    
    const headers = ['Código', 'Cliente', 'Telefone', 'Data', 'Status', 'Valor', 'Bairro'];
    const rows = selectedAgendamentos.map(ag => [
      ag.id.slice(0, 8).toUpperCase(),
      ag.nome_cliente,
      ag.telefone,
      formatDate(ag.data_agendamento),
      ag.status,
      ag.valor_total,
      ag.bairro || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamentos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({ title: 'Exportação concluída!' });
  };

  const handleExportExcel = () => {
    const headers = ['ID', 'Cliente', 'Telefone', 'Data Agendamento', 'Status', 'Valor Total', 'Bairro', 'Cidade', 'Endereço', 'Forma Pagamento'];
    const rows = agendamentos.map(ag => [
      ag.id.slice(0, 8).toUpperCase(),
      ag.nome_cliente,
      formatPhoneForExport(ag.telefone),
      formatDateForExport(ag.data_agendamento),
      ag.status,
      formatCurrencyForExport(ag.valor_total),
      ag.bairro || '-',
      ag.cidade || '-',
      ag.endereco || '-',
      ag.forma_pagamento || '-'
    ]);

    exportToExcel({
      headers,
      rows,
      fileName: `agendamentos-${new Date().toISOString().split('T')[0]}`
    });

    toast({ title: 'Exportação para Excel concluída!' });
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'Cliente', 'Telefone', 'Data', 'Status', 'Valor'];
    const rows = agendamentos.map(ag => [
      ag.id.slice(0, 8).toUpperCase(),
      ag.nome_cliente,
      formatPhoneForExport(ag.telefone),
      formatDateForExport(ag.data_agendamento),
      ag.status,
      formatCurrencyForExport(ag.valor_total)
    ]);

    exportToPDF({
      headers,
      rows,
      fileName: `agendamentos-${new Date().toISOString().split('T')[0]}`,
      title: 'Relatório de Agendamentos'
    });

    toast({ title: 'Exportação para PDF concluída!' });
  };

  // Interceptar mudança de status para 'pago' e abrir modal de pagamento
  const handleStatusChange = (agendamento: Agendamento, newStatus: string) => {
    if (newStatus === 'pago') {
      // Abrir modal para coletar forma de pagamento
      setAgendamentoParaPagar(agendamento);
      setShowPagamentoModal(true);
    } else {
      // Outros status podem ser alterados diretamente
      updateStatus(agendamento.id, newStatus);
    }
  };

  return (
    <AdminContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Gerencie todos os agendamentos em tempo real</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle Lista/Calendário */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewType === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('list')}
              className="gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </Button>
           <Button
              variant={viewType === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('calendar')}
              className="gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Calendário</span>
            </Button>
            <Button
              variant={viewType === 'google' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('google')}
              className="gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <img 
                src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" 
                alt="" 
                className="h-4 w-4"
              />
              <span className="hidden sm:inline">Google</span>
            </Button>
          </div>
          
          <Button 
            onClick={() => setShowCriarModal(true)}
            className="gap-1 sm:gap-2"
            size="sm"
            data-tour="novo-agendamento"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Agendamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      <div data-tour="stats-header">
        <AgendamentosStatsHeader 
          statsHoje={stats.statsHoje}
          statsSemana={stats.statsSemana}
          statsMes={stats.statsMes}
          loading={loading}
        />
      </div>

      {/* Renderização condicional: Lista, Calendário ou Google */}
      {viewType === 'google' ? (
        <GoogleAgendaTab />
      ) : viewType === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <div className="flex flex-col gap-6">
            <AgendamentosCalendar
              agendamentos={agendamentos}
              selectedDate={selectedCalendarDate}
              onDateSelect={setSelectedCalendarDate}
              viewMode={calendarViewMode}
              onViewModeChange={setCalendarViewMode}
              onAgendamentoClick={setSelectedAgendamento}
            />
            {/* Mobile: agendamentos do dia logo abaixo do calendário */}
            <div className="lg:hidden">
              <SelectedDayAgendamentos
                agendamentos={agendamentos}
                selectedDate={selectedCalendarDate}
                onAgendamentoClick={setSelectedAgendamento}
              />
            </div>
          </div>
          <AgendamentosOverview
            agendamentos={agendamentos}
            selectedDate={selectedCalendarDate}
            onAgendamentoClick={setSelectedAgendamento}
            
          />
        </div>
      ) : (
        <>
          <div data-tour="filters">
            <AgendamentosFilters
              busca={busca}
              setBusca={setBusca}
              statusFilter={statusFilter}
              setStatusFilter={handleStatusFilterChange}
              filters={filters}
              setFilters={setFilters}
              onSearch={handleSearch}
              onClear={handleClearFilters}
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              period={period}
              setPeriod={setPeriod}
              customRange={customRange}
              setCustomRange={setCustomRange}
            />
          </div>

          <div data-tour="bulk-actions">
            <AgendamentosBulkActions
              agendamentos={agendamentos}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              onBulkExport={handleBulkExport}
            />
          </div>
          
          <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50 overflow-hidden">
            {isMobile ? (
              <div className="divide-y divide-border/50">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Carregando agendamentos...
                  </div>
                ) : agendamentos.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum agendamento encontrado
                  </div>
                ) : (
                  agendamentos.map((agendamento) => (
                    <div 
                      key={agendamento.id} 
                      className={cn(
                        "p-4 space-y-3 relative",
                        agendamento.isNew && "bg-primary/5 animate-pulse border-l-4 border-l-primary"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Checkbox
                          checked={selectedIds.includes(agendamento.id)}
                          onCheckedChange={(checked) => handleSelectOne(agendamento.id, checked as boolean)}
                        />
                        <AgendamentoStatusTags 
                          agendamento={agendamento} 
                          trackingStatus={agendamento.tracking_status}
                        />
                        <OrigemAgendamentoBadge
                          origem={agendamento.origem}
                          criadoPorFuncionarioBotId={agendamento.criado_por_funcionario_bot}
                          criadoManualmente={agendamento.criado_manualmente}
                          parceiroCodigo={agendamento.parceiro_codigo}
                          canalOrigem={agendamento.canal_origem}
                          compact
                        />
                      </div>

                      <div className="flex justify-between items-start">
                        <p className="text-xs text-muted-foreground">
                          #{agendamento.id.slice(0, 8).toUpperCase()}
                        </p>
                        <StatusDropdown
                          value={agendamento.status}
                          onChange={(newStatus) => handleStatusChange(agendamento, newStatus)}
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">{agendamento.nome_cliente}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{formatPhone(agendamento.telefone)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Data: </span>
                          <span>{formatDate(agendamento.data_agendamento)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valor: </span>
                          <span className="font-semibold">{formatCurrency(agendamento.valor_total)}</span>
                        </div>
                      </div>

                      {agendamento.bairro && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {agendamento.bairro} - {agendamento.cidade}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(
                            `https://wa.me/55${agendamento.telefone.replace(/\D/g, '')}`,
                            '_blank'
                          )}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedAgendamento(agendamento)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedIds.length === agendamentos.length && agendamentos.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead 
                      className="cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => toggleSort('created_at')}
                    >
                      <span className="flex items-center">Criado <SortIcon field="created_at" /></span>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => toggleSort('data_agendamento')}
                    >
                      <span className="flex items-center">Serviço <SortIcon field="data_agendamento" /></span>
                    </TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Localização</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        Carregando agendamentos...
                      </TableCell>
                    </TableRow>
                  ) : agendamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        Nenhum agendamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    agendamentos.map((agendamento, index) => (
                      <TableRow 
                        key={agendamento.id}
                        className={cn(
                          "transition-colors hover:bg-muted/50",
                          index % 2 === 1 && "bg-muted/20",
                          agendamento.isNew && "bg-primary/5 animate-pulse border-l-4 border-l-primary"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(agendamento.id)}
                            onCheckedChange={(checked) => handleSelectOne(agendamento.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{agendamento.order_code || agendamento.id.slice(0, 8).toUpperCase()}
                            </span>
                            <OrigemAgendamentoBadge
                              origem={agendamento.origem}
                              criadoPorFuncionarioBotId={agendamento.criado_por_funcionario_bot}
                              criadoManualmente={agendamento.criado_manualmente}
                              parceiroCodigo={agendamento.parceiro_codigo}
                              canalOrigem={agendamento.canal_origem}
                              compact
                              className="text-[10px]"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {agendamento.created_at ? new Date(agendamento.created_at).toLocaleDateString('pt-BR') : '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{formatDate(agendamento.data_agendamento)}</span>
                            <AgendamentoStatusTags 
                              agendamento={agendamento} 
                              trackingStatus={agendamento.tracking_status}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{agendamento.nome_cliente}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formatPhone(agendamento.telefone)}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(
                                `https://wa.me/55${agendamento.telefone.replace(/\D/g, '')}`,
                                '_blank'
                              )}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {agendamento.bairro && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {agendamento.bairro}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(agendamento.valor_total)}
                        </TableCell>
                        <TableCell>
                          <StatusDropdown
                            value={agendamento.status}
                            onChange={(newStatus) => handleStatusChange(agendamento, newStatus)}
                          />
                        </TableCell>
                        <TableCell className="text-sm">
                          {agendamento.tecnico_id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                ✓
                              </div>
                              <span className="text-muted-foreground">Atribuído</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAgendamento(agendamento)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}

      <AgendamentoDetailsModal
        agendamento={selectedAgendamento ? agendamentos.find(a => a.id === selectedAgendamento.id) || selectedAgendamento : null}
        onClose={() => setSelectedAgendamento(null)}
        onUpdateStatus={updateStatus}
      />

      <CriarAgendamentoManualModal
        open={showCriarModal}
        onOpenChange={setShowCriarModal}
        onSuccess={() => {
          toast({ title: '✅ Agendamento criado com sucesso!' });
        }}
      />

      {agendamentoParaPagar && (
        <ConfirmarPagamentoModal
          open={showPagamentoModal}
          onOpenChange={setShowPagamentoModal}
          servico={agendamentoParaPagar as any}
          onSuccess={() => {
            setShowPagamentoModal(false);
            setAgendamentoParaPagar(null);
            toast({ title: '✅ Pagamento confirmado com sucesso!' });
          }}
        />
      )}
    </AdminContainer>
  );
}
