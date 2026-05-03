import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useOrcamentos, useOrcamentosStats, Orcamento } from '@/hooks/useOrcamentos';
import { OrcamentosStatsCards } from '@/components/admin/OrcamentosStatsCards';
import { OrcamentosTable } from '@/components/admin/OrcamentosTable';
import { OrcamentoFormModal } from '@/components/admin/OrcamentoFormModal';
import { OrcamentoDetailsModal } from '@/components/admin/OrcamentoDetailsModal';

export default function OrcamentosPage() {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  
  const { data: orcamentos, isLoading } = useOrcamentos();
  const { data: stats, isLoading: isLoadingStats } = useOrcamentosStats();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Orçamentos"
        description="Crie e gerencie orçamentos profissionais para seus clientes"
        actions={
          <Button onClick={() => setFormModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        }
      />

      {/* KPIs */}
      <OrcamentosStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Tabela */}
      <OrcamentosTable
        orcamentos={orcamentos}
        isLoading={isLoading}
        onViewDetails={setSelectedOrcamento}
      />

      {/* Modais */}
      <OrcamentoFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
      />

      <OrcamentoDetailsModal
        orcamento={selectedOrcamento}
        open={!!selectedOrcamento}
        onOpenChange={open => !open && setSelectedOrcamento(null)}
      />
    </div>
  );
}
