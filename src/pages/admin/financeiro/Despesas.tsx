import { useState, useCallback, useMemo } from "react";
import AdminContainer from "@/components/admin/AdminContainer";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, ExternalLink, MessageCircle, DollarSign, Clock, CheckCircle, AlertTriangle, User, Download, FileSpreadsheet, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportDespesasToExcel, exportDespesasToPDF } from "@/utils/financeiroExport";
import { useDespesas, useDespesasStats } from "@/hooks/useDespesas";
import { useRealtimeDespesas } from "@/hooks/useRealtimeDespesas";
import { useQueryClient } from "@tanstack/react-query";
import { DespesaFormModal } from "@/components/financeiro/DespesaFormModal";
import { DespesasFilters } from "@/components/financeiro/DespesasFilters";
import { formatCurrency, formatDate } from "@/utils/format";
import { CATEGORIAS_DESPESAS, STATUS_DESPESA, FORMAS_PAGAMENTO } from "@/utils/financeiroHelpers";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { KPICard } from "@/components/financeiro/KPICard";
import { cn } from "@/lib/utils";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function Despesas() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [despesaToDelete, setDespesaToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    despesas,
    isLoading,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    uploadComprovante,
    isCreating,
    isUpdating,
  } = useDespesas(filters);

  const { data: stats } = useDespesasStats(filters);

  // Realtime para atualização automática
  const handleRealtimeUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["despesas"] });
    queryClient.invalidateQueries({ queryKey: ["despesas-stats"] });
  }, [queryClient]);
  
  useRealtimeDespesas(handleRealtimeUpdate);

  // Paginação
  const totalItems = despesas.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedDespesas = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return despesas.slice(start, start + pageSize);
  }, [despesas, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleCreateOrUpdate = (data: any) => {
    if (editingDespesa) {
      updateDespesa({ id: editingDespesa.id, despesa: data });
    } else {
      createDespesa(data);
    }
    setModalOpen(false);
    setEditingDespesa(null);
  };

  const handleEdit = (despesa: any) => {
    setEditingDespesa(despesa);
    setModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDespesaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (despesaToDelete) {
      deleteDespesa(despesaToDelete);
    }
    setDeleteDialogOpen(false);
    setDespesaToDelete(null);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <AdminContainer>
        <LoadingSpinner />
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <PageHeader
        title="Despesas"
        description="Gestão completa de despesas operacionais"
        actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportDespesasToExcel(despesas)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportDespesasToPDF(despesas)}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </div>
        }
      />

      {/* KPIs com ícones */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total"
          value={stats?.total || 0}
          icon={DollarSign}
          isCurrency
        />
        <KPICard
          title="Pendentes"
          value={stats?.pendentes || 0}
          icon={Clock}
          isCurrency
          variant="warning"
        />
        <KPICard
          title="Pagas"
          value={stats?.pagas || 0}
          icon={CheckCircle}
          isCurrency
          variant="success"
        />
        <KPICard
          title="Vencidas"
          value={stats?.vencidas || 0}
          icon={AlertTriangle}
          isCurrency
          variant="danger"
        />
      </div>

      {/* Filtros - agora sem card wrapper */}
      <div className="py-2">
        <DespesasFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas ({despesas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Forma Pagamento</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Comprovante</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                      Nenhuma despesa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDespesas.map((despesa, index) => {
                    const statusInfo = STATUS_DESPESA.find(s => s.value === despesa.status);
                    const categoriaInfo = CATEGORIAS_DESPESAS.find(c => c.value === despesa.categoria);
                    const formaPagamentoInfo = FORMAS_PAGAMENTO.find(f => f.value === despesa.forma_pagamento);

                    return (
                      <TableRow 
                        key={despesa.id}
                        className={cn(
                          "transition-colors hover:bg-muted/50",
                          index % 2 === 1 && "bg-muted/20"
                        )}
                      >
                        <TableCell className="whitespace-nowrap">
                          {formatDate(despesa.data_despesa)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={despesa.descricao}>
                            {despesa.descricao}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" style={{ borderColor: categoriaInfo?.color }}>
                            {categoriaInfo?.label || despesa.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(despesa.valor)}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo?.value === "paga" ? "default" : "secondary"}>
                            {statusInfo?.label || despesa.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {despesa.forma_pagamento ? (
                            <Badge variant="outline">
                              {formaPagamentoInfo?.label || despesa.forma_pagamento}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {despesa.origem === 'whatsapp' ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 flex items-center gap-1 w-fit">
                              <MessageCircle className="h-3 w-3" />
                              WhatsApp
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Edit className="h-3 w-3" />
                              Manual
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {despesa.created_by_profile?.nome_completo ? (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <User className="h-3 w-3" />
                              {despesa.created_by_profile.nome_completo}
                            </Badge>
                          ) : despesa.observacoes?.includes('Via WhatsApp por') ? (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <User className="h-3 w-3" />
                              {despesa.observacoes.match(/Via WhatsApp por (.+?) \(/)?.[1] || 'Funcionário'}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {despesa.comprovante_url ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(despesa.comprovante_url, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(despesa)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(despesa.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
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
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <DespesaFormModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingDespesa(null);
        }}
        despesa={editingDespesa}
        onSubmit={handleCreateOrUpdate}
        onUploadComprovante={uploadComprovante}
        isLoading={isCreating || isUpdating}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminContainer>
  );
}
