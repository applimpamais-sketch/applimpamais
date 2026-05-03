import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminContainer from '@/components/admin/AdminContainer';
import { Button } from '@/components/ui/button';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { useMetas } from '@/hooks/useMetas';
import MetaCard from '@/components/admin/MetaCard';
import MetaFormModal from '@/components/admin/MetaFormModal';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FinanceiroMetas() {
  const { metas, isLoading, createMeta, updateMeta, deleteMeta, isCreating, isUpdating } = useMetas();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<any>(null);

  const handleSubmit = (data: any) => {
    if (editingMeta) {
      updateMeta({ id: editingMeta.id, updates: data });
    } else {
      createMeta(data);
    }
    setIsModalOpen(false);
    setEditingMeta(null);
  };

  const handleEdit = (meta: any) => {
    setEditingMeta(meta);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteMeta(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const metasAtingidas = metas?.filter(m => m.status === 'atingida').length || 0;
  const totalMetas = metas?.length || 0;
  const taxaSucesso = totalMetas > 0 ? ((metasAtingidas / totalMetas) * 100).toFixed(1) : '0';

  return (
    <AdminContainer>
      <PageHeader 
        title="Metas Financeiras" 
        description="Defina e acompanhe suas metas de receita"
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Atingidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{metasAtingidas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaSucesso}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {metas && metas.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metas.map((meta) => (
            <MetaCard
              key={meta.id}
              meta={meta}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Nenhuma meta cadastrada ainda
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}

      <MetaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMeta(null);
        }}
        onSubmit={handleSubmit}
        meta={editingMeta}
        isLoading={isCreating || isUpdating}
      />
    </AdminContainer>
  );
}
