import { useState } from 'react';
import { Plus, Package, RefreshCw, Truck, ShoppingBag, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useServicosAdmin, Servico, ServicoInput } from '@/hooks/useServicosAdmin';
import { useAlugueisAdmin, Aluguel, AluguelInput } from '@/hooks/useAlugueisAdmin';
import { useUpsellsAdmin, Upsell, UpsellInput } from '@/hooks/useUpsellsAdmin';
import { ServicosTable } from '@/components/admin/servicos/ServicosTable';
import { LocacoesTable } from '@/components/admin/servicos/LocacoesTable';
import { UpsellsTable } from '@/components/admin/servicos/UpsellsTable';
import { ServicoFormModal } from '@/components/admin/servicos/ServicoFormModal';
import { LocacaoFormModal } from '@/components/admin/servicos/LocacaoFormModal';
import { UpsellFormModal } from '@/components/admin/servicos/UpsellFormModal';
import { ImportCSVModal } from '@/components/admin/servicos/ImportCSVModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { exportServicosToCSV, exportAlugueisToCSV } from '@/utils/exportServicosCSV';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ServicosPage() {
  const [activeTab, setActiveTab] = useState('servicos');
  
  // Servicos state
  const [servicoModalOpen, setServicoModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);

  // Locações state
  const [locacaoModalOpen, setLocacaoModalOpen] = useState(false);
  const [editingLocacao, setEditingLocacao] = useState<Aluguel | null>(null);

  // Upsells state
  const [upsellModalOpen, setUpsellModalOpen] = useState(false);
  const [editingUpsell, setEditingUpsell] = useState<Upsell | null>(null);

  // Import CSV state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'servicos' | 'locacoes'>('servicos');

  const {
    servicos,
    isLoading: isLoadingServicos,
    refetch: refetchServicos,
    createServico,
    updateServico,
    deleteServico,
    categorias,
    subcategorias,
    servicosPorCategoria,
  } = useServicosAdmin();

  const {
    alugueis,
    isLoading: isLoadingAlugueis,
    refetch: refetchAlugueis,
    createAluguel,
    updateAluguel,
    deleteAluguel,
    equipamentos,
    alugueisPorEquipamento,
  } = useAlugueisAdmin();

  const {
    upsells,
    isLoading: isLoadingUpsells,
    refetch: refetchUpsells,
    createUpsell,
    updateUpsell,
    deleteUpsell,
    toggleUpsellAtivo,
  } = useUpsellsAdmin();

  // Servicos handlers
  const handleOpenCreateServico = () => {
    setEditingServico(null);
    setServicoModalOpen(true);
  };

  const handleOpenEditServico = (servico: Servico) => {
    setEditingServico(servico);
    setServicoModalOpen(true);
  };

  const handleCloseServicoModal = () => {
    setServicoModalOpen(false);
    setEditingServico(null);
  };

  const handleSubmitServico = (data: ServicoInput) => {
    if (editingServico) {
      updateServico.mutate(
        { id: editingServico.id, ...data },
        { onSuccess: handleCloseServicoModal }
      );
    } else {
      createServico.mutate(data, { onSuccess: handleCloseServicoModal });
    }
  };

  // Locações handlers
  const handleOpenCreateLocacao = () => {
    setEditingLocacao(null);
    setLocacaoModalOpen(true);
  };

  const handleOpenEditLocacao = (aluguel: Aluguel) => {
    setEditingLocacao(aluguel);
    setLocacaoModalOpen(true);
  };

  const handleCloseLocacaoModal = () => {
    setLocacaoModalOpen(false);
    setEditingLocacao(null);
  };

  const handleSubmitLocacao = (data: AluguelInput) => {
    if (editingLocacao) {
      updateAluguel.mutate(
        { id: editingLocacao.id, ...data },
        { onSuccess: handleCloseLocacaoModal }
      );
    } else {
      createAluguel.mutate(data, { onSuccess: handleCloseLocacaoModal });
    }
  };

  // Upsells handlers
  const handleOpenCreateUpsell = () => {
    setEditingUpsell(null);
    setUpsellModalOpen(true);
  };

  const handleOpenEditUpsell = (upsell: Upsell) => {
    setEditingUpsell(upsell);
    setUpsellModalOpen(true);
  };

  const handleCloseUpsellModal = () => {
    setUpsellModalOpen(false);
    setEditingUpsell(null);
  };

  const handleSubmitUpsell = (data: UpsellInput) => {
    if (editingUpsell) {
      updateUpsell.mutate(
        { id: editingUpsell.id, ...data },
        { onSuccess: handleCloseUpsellModal }
      );
    } else {
      createUpsell.mutate(data, { onSuccess: handleCloseUpsellModal });
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'servicos') refetchServicos();
    else if (activeTab === 'locacoes') refetchAlugueis();
    else refetchUpsells();
  };

  const handleAddNew = () => {
    if (activeTab === 'servicos') handleOpenCreateServico();
    else if (activeTab === 'locacoes') handleOpenCreateLocacao();
    else handleOpenCreateUpsell();
  };

  const getAddButtonLabel = () => {
    if (activeTab === 'servicos') return 'Novo Serviço';
    if (activeTab === 'locacoes') return 'Nova Locação';
    return 'Novo Upsell';
  };

  const handleExportCSV = () => {
    if (activeTab === 'servicos') {
      exportServicosToCSV(servicos);
      toast.success('CSV de serviços exportado!');
    } else if (activeTab === 'locacoes') {
      exportAlugueisToCSV(alugueis);
      toast.success('CSV de locações exportado!');
    }
  };

  const handleOpenImport = () => {
    setImportType(activeTab as 'servicos' | 'locacoes');
    setImportModalOpen(true);
  };

  const handleUpdateServicoCSV = async (id: string, data: Partial<Servico>) => {
    const { error } = await supabase
      .from('servicos')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  };

  const handleUpdateAluguelCSV = async (id: string, data: Partial<Aluguel>) => {
    const { error } = await supabase
      .from('alugueis')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  };

  const handleImportClose = (open: boolean) => {
    setImportModalOpen(open);
    if (!open) {
      refetchServicos();
      refetchAlugueis();
    }
  };

  const isLoading = isLoadingServicos || isLoadingAlugueis || isLoadingUpsells;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-80" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meus Serviços</h1>
          <p className="text-muted-foreground">
            Configure os serviços, locações e valores da sua loja online
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          {activeTab !== 'upsells' && (
            <>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenImport}>
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
            </>
          )}
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            {getAddButtonLabel()}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="servicos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Serviços</span>
            <Badge variant="secondary" className="ml-1">{servicos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="locacoes" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Locações</span>
            <Badge variant="secondary" className="ml-1">{alugueis.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upsells" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Upsells</span>
            <Badge variant="secondary" className="ml-1">{upsells.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Serviços Tab */}
        <TabsContent value="servicos" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Serviços</CardDescription>
                <CardTitle className="text-3xl">{servicos.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Categorias</CardDescription>
                <CardTitle className="text-3xl">{categorias.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {servicos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Comece adicionando serviços para exibir na sua loja online.
                </p>
                <Button onClick={handleOpenCreateServico}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Serviço
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ServicosTable
              servicosPorCategoria={servicosPorCategoria}
              onEdit={handleOpenEditServico}
              onDelete={(id) => deleteServico.mutate(id)}
              isDeleting={deleteServico.isPending}
            />
          )}
        </TabsContent>

        {/* Locações Tab */}
        <TabsContent value="locacoes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Locações</CardDescription>
                <CardTitle className="text-3xl">{alugueis.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Equipamentos</CardDescription>
                <CardTitle className="text-3xl">{equipamentos.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {alugueis.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma locação cadastrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione equipamentos para aluguel.
                </p>
                <Button onClick={handleOpenCreateLocacao}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Locação
                </Button>
              </CardContent>
            </Card>
          ) : (
            <LocacoesTable
              alugueisPorEquipamento={alugueisPorEquipamento}
              onEdit={handleOpenEditLocacao}
              onDelete={(id) => deleteAluguel.mutate(id)}
              isDeleting={deleteAluguel.isPending}
            />
          )}
        </TabsContent>

        {/* Upsells Tab */}
        <TabsContent value="upsells" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Upsells</CardDescription>
                <CardTitle className="text-3xl">{upsells.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Ativos</CardDescription>
                <CardTitle className="text-3xl">{upsells.filter(u => u.ativo).length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {upsells.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum upsell cadastrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione produtos adicionais para vender junto com seus serviços.
                </p>
                <Button onClick={handleOpenCreateUpsell}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Upsell
                </Button>
              </CardContent>
            </Card>
          ) : (
            <UpsellsTable
              upsells={upsells}
              onEdit={handleOpenEditUpsell}
              onDelete={(id) => deleteUpsell.mutate(id)}
              onToggleAtivo={(id, ativo) => toggleUpsellAtivo.mutate({ id, ativo })}
              isDeleting={deleteUpsell.isPending}
              isToggling={toggleUpsellAtivo.isPending}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ServicoFormModal
        open={servicoModalOpen}
        onOpenChange={handleCloseServicoModal}
        servico={editingServico}
        onSubmit={handleSubmitServico}
        isLoading={createServico.isPending || updateServico.isPending}
        existingCategorias={categorias}
        existingSubcategorias={subcategorias}
      />

      <LocacaoFormModal
        open={locacaoModalOpen}
        onOpenChange={handleCloseLocacaoModal}
        aluguel={editingLocacao}
        onSubmit={handleSubmitLocacao}
        isLoading={createAluguel.isPending || updateAluguel.isPending}
        existingEquipamentos={equipamentos}
      />

      <UpsellFormModal
        open={upsellModalOpen}
        onOpenChange={handleCloseUpsellModal}
        upsell={editingUpsell}
        onSubmit={handleSubmitUpsell}
        isLoading={createUpsell.isPending || updateUpsell.isPending}
      />

      <ImportCSVModal
        open={importModalOpen}
        onOpenChange={handleImportClose}
        type={importType}
        servicos={servicos}
        alugueis={alugueis}
        onUpdateServico={handleUpdateServicoCSV}
        onUpdateAluguel={handleUpdateAluguelCSV}
      />
    </div>
  );
}
