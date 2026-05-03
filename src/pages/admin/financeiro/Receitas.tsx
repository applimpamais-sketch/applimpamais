import { useState, useCallback, useMemo } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminContainer from '@/components/admin/AdminContainer';
import { KPICard } from '@/components/financeiro/KPICard';
import { ReceitasFiltersComponent } from '@/components/financeiro/ReceitasFilters';
import { PagamentoFormModal } from '@/components/financeiro/PagamentoFormModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Percent,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  MessageCircle,
  Tag,
  Globe,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportReceitasToExcel, exportReceitasToPDF } from '@/utils/financeiroExport';
import { useReceitas, ReceitasFilters, Pagamento, AgendamentoComPagamento } from '@/hooks/useReceitas';
import { useRealtimeReceitas } from '@/hooks/useRealtimeReceitas';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/format';
import { getStatusPagamentoInfo, getCategoriaReceitaInfo } from '@/utils/financeiroHelpers';
import { Skeleton } from '@/components/ui/skeleton';
import { EditarCategoriaModal } from '@/components/financeiro/EditarCategoriaModal';
import { cn } from '@/lib/utils';
import { PaginationControls } from '@/components/ui/pagination-controls';

export default function FinanceiroReceitas() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReceitasFilters>({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    dataFim: new Date(),
  });

  const { agendamentos, kpis, loading, criarPagamento, atualizarPagamento, deletarPagamento, atualizarCategoriaReceita } =
    useReceitas(filters);

  // Realtime para atualização automática
  const handleRealtimeUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["receitas"] });
  }, [queryClient]);
  
  useRealtimeReceitas(handleRealtimeUpdate);

  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoComPagamento | null>(
    null
  );
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pagamentoToDelete, setPagamentoToDelete] = useState<Pagamento | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Paginação
  const totalItems = agendamentos.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedAgendamentos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return agendamentos.slice(start, start + pageSize);
  }, [agendamentos, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedRows(new Set()); // Reset expanded rows on page change
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleNovoPagamento = (agendamento: AgendamentoComPagamento) => {
    setSelectedAgendamento(agendamento);
    setSelectedPagamento(null);
    setPagamentoModalOpen(true);
  };

  const handleEditarPagamento = (agendamento: AgendamentoComPagamento, pagamento: Pagamento) => {
    setSelectedAgendamento(agendamento);
    setSelectedPagamento(pagamento);
    setPagamentoModalOpen(true);
  };

  const handleDeleteClick = (pagamento: Pagamento) => {
    setPagamentoToDelete(pagamento);
    setDeleteDialogOpen(true);
  };

  const handleEditarCategoria = (agendamento: AgendamentoComPagamento) => {
    setSelectedAgendamento(agendamento);
    setCategoriaModalOpen(true);
  };

  const handleSalvarCategoria = async (categoriaReceita: string) => {
    if (selectedAgendamento) {
      await atualizarCategoriaReceita(selectedAgendamento.id, categoriaReceita);
    }
  };

  const handleConfirmDelete = async () => {
    if (pagamentoToDelete) {
      await deletarPagamento(pagamentoToDelete.id, pagamentoToDelete.comprovante_url);
      setDeleteDialogOpen(false);
      setPagamentoToDelete(null);
    }
  };

  const handleSubmitPagamento = async (data: Partial<Pagamento>, file?: File) => {
    if (selectedPagamento) {
      return await atualizarPagamento(selectedPagamento.id, data, file);
    } else {
      return await criarPagamento(data, file);
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = getStatusPagamentoInfo(status);
    return (
      <Badge
        variant="outline"
        style={{
          borderColor: statusInfo.color,
          color: statusInfo.color,
        }}
      >
        {statusInfo.label}
      </Badge>
    );
  };

  const openWhatsApp = (telefone: string, nome: string) => {
    const mensagem = `Olá ${nome}, tudo bem? Estamos entrando em contato sobre o pagamento do seu agendamento.`;
    const url = `https://wa.me/55${telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
      mensagem
    )}`;
    window.open(url, '_blank');
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Receitas"
        description="Controle de recebimentos e pagamentos"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportReceitasToExcel(agendamentos)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportReceitasToPDF(agendamentos)}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Receita Esperada"
            value={kpis.totalEsperado}
            icon={DollarSign}
            isCurrency
          />
          <KPICard
            title="Receita Realizada"
            value={kpis.totalRealizado}
            icon={TrendingUp}
            isCurrency
          />
          <KPICard
            title="Pendente"
            value={kpis.totalPendente}
            icon={Clock}
            isCurrency
          />
          <KPICard
            title="Taxa de Recebimento"
            value={kpis.taxaRecebimento}
            icon={Percent}
            isPercentage
            isCurrency={false}
          />
        </div>
      )}

      {/* Filtros */}
      <ReceitasFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {/* Tabela de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos e Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum agendamento encontrado no período selecionado
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Valor Pago</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAgendamentos.map((agendamento, index) => (
                    <Collapsible
                      key={agendamento.id}
                      open={expandedRows.has(agendamento.id)}
                      onOpenChange={() => toggleRow(agendamento.id)}
                      asChild
                    >
                      <>
                        <TableRow className={cn(
                          "transition-colors hover:bg-muted/50",
                          index % 2 === 1 && "bg-muted/20"
                        )}>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    expandedRows.has(agendamento.id) ? 'rotate-180' : ''
                                  }`}
                                />
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{agendamento.nome_cliente}</div>
                              <div className="text-sm text-muted-foreground">
                                {agendamento.telefone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(agendamento.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {agendamento.origem === 'manual' ? (
                              <Badge variant="outline">
                                <Pencil className="h-3 w-3 mr-1" />
                                Manual
                              </Badge>
                            ) : agendamento.origem === 'whatsapp' ? (
                              <Badge variant="outline">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Globe className="h-3 w-3 mr-1" />
                                Site
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: getCategoriaReceitaInfo(agendamento.categoria_receita).color,
                                  color: getCategoriaReceitaInfo(agendamento.categoria_receita).color,
                                }}
                              >
                                {getCategoriaReceitaInfo(agendamento.categoria_receita).label}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditarCategoria(agendamento);
                                }}
                                title="Editar categoria"
                              >
                                <Tag className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(agendamento.valor_total)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(agendamento.valor_pago)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(agendamento.saldo_pendente)}
                          </TableCell>
                          <TableCell>{getStatusBadge(agendamento.status_pagamento)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNovoPagamento(agendamento)}
                                title="Registrar Pagamento"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  openWhatsApp(agendamento.telefone, agendamento.nome_cliente)
                                }
                                title="WhatsApp"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/50">
                              <div className="p-4">
                                <h4 className="font-semibold mb-3">Pagamentos Registrados</h4>
                                {agendamento.pagamentos.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    Nenhum pagamento registrado
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {agendamento.pagamentos.map((pagamento) => (
                                      <div
                                        key={pagamento.id}
                                        className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                      >
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                          <div>
                                            <p className="text-sm text-muted-foreground">Data</p>
                                            <p className="font-medium">
                                              {new Date(
                                                pagamento.data_pagamento
                                              ).toLocaleDateString('pt-BR')}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Valor</p>
                                            <p className="font-medium">
                                              {formatCurrency(pagamento.valor_pago)}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Forma</p>
                                            <p className="font-medium">
                                              {pagamento.forma_pagamento || 'N/A'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">
                                              Comprovante
                                            </p>
                                            {pagamento.comprovante_url ? (
                                              <a
                                                href={pagamento.comprovante_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1"
                                              >
                                                Ver <ExternalLink className="h-3 w-3" />
                                              </a>
                                            ) : (
                                              <p className="text-muted-foreground">Não anexado</p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex gap-1 ml-4">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleEditarPagamento(agendamento, pagamento)
                                            }
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(pagamento)}
                                          >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Paginação */}
            {totalItems > 0 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Pagamento */}
      {selectedAgendamento && (
        <PagamentoFormModal
          open={pagamentoModalOpen}
          onOpenChange={setPagamentoModalOpen}
          onSubmit={handleSubmitPagamento}
          pagamento={selectedPagamento || undefined}
          agendamentoId={selectedAgendamento.id}
          valorTotal={selectedAgendamento.valor_total}
          valorPago={selectedAgendamento.valor_pago}
        />
      )}

      {/* Modal de Editar Categoria */}
      {selectedAgendamento && (
        <EditarCategoriaModal
          open={categoriaModalOpen}
          onClose={() => {
            setCategoriaModalOpen(false);
            setSelectedAgendamento(null);
          }}
          onSave={handleSalvarCategoria}
          agendamento={selectedAgendamento}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminContainer>
  );
}
