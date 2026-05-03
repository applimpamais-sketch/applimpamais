import { useState } from 'react';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NotaFiscalStatsCards from '@/components/admin/NotaFiscalStatsCards';
import NotaFiscalTable from '@/components/admin/NotaFiscalTable';
import EmitirNotaModal from '@/components/admin/EmitirNotaModal';
import NotaFiscalDetailsModal from '@/components/admin/NotaFiscalDetailsModal';
import {
  useNotasFiscais,
  useNotasFiscaisStats,
  NotaFiscal,
  NotasFiscaisFilters,
} from '@/hooks/useNotasFiscais';

export default function NotasFiscais() {
  const [showEmitirModal, setShowEmitirModal] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
  const [filters, setFilters] = useState<NotasFiscaisFilters>({
    status: 'todos',
    tipo: 'todos',
    searchTerm: '',
  });

  const { data: notas, isLoading: loadingNotas } = useNotasFiscais(filters);
  const { data: stats, isLoading: loadingStats } = useNotasFiscaisStats();

  const handleFilterChange = (key: keyof NotasFiscaisFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Notas Fiscais"
        description="Gerencie as notas fiscais emitidas para os serviços"
        icon={FileText}
        actions={
          <Button onClick={() => setShowEmitirModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Nota
          </Button>
        }
      />

      {/* KPIs */}
      <div className="mb-6">
        <NotaFiscalStatsCards stats={stats} isLoading={loadingStats} />
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou número..."
                className="pl-9"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="emitida">Emitida</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.tipo}
              onValueChange={(value) => handleFilterChange('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="nfse">NFS-e</SelectItem>
                <SelectItem value="nfce">NFC-e</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Data início"
              value={filters.dataInicio || ''}
              onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <NotaFiscalTable
            notas={notas}
            isLoading={loadingNotas}
            onViewDetails={setSelectedNota}
          />
        </CardContent>
      </Card>

      {/* Modais */}
      <EmitirNotaModal
        open={showEmitirModal}
        onOpenChange={setShowEmitirModal}
      />

      <NotaFiscalDetailsModal
        nota={selectedNota}
        open={!!selectedNota}
        onOpenChange={(open) => !open && setSelectedNota(null)}
      />
    </AdminContainer>
  );
}
