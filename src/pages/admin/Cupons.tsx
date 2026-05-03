import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, MoreVertical, Ticket, Sparkles, TrendingUp, Award, Percent } from 'lucide-react';
import { useCupons, type Cupom } from '@/hooks/useCupons';
import { useCuponsStats } from '@/hooks/useCuponsStats';
import DashboardKPICard from '@/components/admin/DashboardKPICard';
import TopCuponsChart from '@/components/admin/TopCuponsChart';
import { format } from 'date-fns';
import AdminContainer from '@/components/admin/AdminContainer';

const TIPO_APLICACAO_LABELS = {
  todos: 'Todos',
  servicos_limpeza: 'Serviços de Limpeza',
  combos: 'Combos',
  alugueis: 'Aluguéis',
};

const CATEGORIA_LABELS = {
  home: 'Para Casa',
  business: 'Para Empresa',
};

export default function Cupons() {
  const { cupons, isLoading, createCupom, updateCupom, deleteCupom } = useCupons();
  const { data: stats } = useCuponsStats();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCupom, setEditingCupom] = useState<Cupom | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    desconto_percentual: 10,
    tipo_aplicacao: 'servicos_limpeza',
    categorias_aplicaveis: ['home'] as string[],
    auto_aplicar: false,
    data_validade_inicio: '',
    data_validade_fim: '',
    uso_maximo: null as number | null,
  });

  const handleOpenCreate = () => {
    setEditingCupom(null);
    setFormData({
      codigo: '',
      desconto_percentual: 10,
      tipo_aplicacao: 'servicos_limpeza',
      categorias_aplicaveis: ['home'],
      auto_aplicar: false,
      data_validade_inicio: '',
      data_validade_fim: '',
      uso_maximo: null,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (cupom: Cupom) => {
    setEditingCupom(cupom);
    setFormData({
      codigo: cupom.codigo,
      desconto_percentual: cupom.desconto_percentual,
      tipo_aplicacao: cupom.tipo_aplicacao,
      categorias_aplicaveis: cupom.categorias_aplicaveis,
      auto_aplicar: cupom.auto_aplicar,
      data_validade_inicio: cupom.data_validade_inicio || '',
      data_validade_fim: cupom.data_validade_fim || '',
      uso_maximo: cupom.uso_maximo,
    });
    setShowCreateModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo.trim() || formData.categorias_aplicaveis.length === 0) {
      return;
    }

    const data: any = {
      codigo: formData.codigo.toUpperCase(),
      desconto_percentual: formData.desconto_percentual,
      tipo_aplicacao: formData.tipo_aplicacao,
      categorias_aplicaveis: formData.categorias_aplicaveis,
      auto_aplicar: formData.auto_aplicar,
      data_validade_inicio: formData.data_validade_inicio || null,
      data_validade_fim: formData.data_validade_fim || null,
      uso_maximo: formData.uso_maximo,
    };

    if (editingCupom) {
      updateCupom({ id: editingCupom.id, updates: data });
    } else {
      createCupom(data);
    }
    
    setShowCreateModal(false);
  };

  const handleToggleStatus = (id: string, status: 'ativo' | 'inativo') => {
    updateCupom({ id, updates: { status } });
  };

  const handleDelete = (id: string) => {
    deleteCupom(id);
    setDeleteConfirm(null);
  };

  const toggleCategoria = (categoria: string) => {
    const cats = formData.categorias_aplicaveis;
    setFormData({
      ...formData,
      categorias_aplicaveis: cats.includes(categoria)
        ? cats.filter(c => c !== categoria)
        : [...cats, categoria]
    });
  };

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <AdminContainer>
      <PageHeader
        title="Cupons de Desconto" 
        subtitle="Gerencie códigos promocionais e descontos"
        actions={
          <Button onClick={handleOpenCreate} data-tour="cupons-novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cupom
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div data-tour="cupons-ativos">
          <DashboardKPICard
            title="Cupons Ativos"
            value={stats?.totalAtivos || 0}
            icon={Ticket}
          />
        </div>
        <div data-tour="cupons-usos">
          <DashboardKPICard
            title="Total de Usos"
            value={stats?.totalUsos || 0}
            icon={TrendingUp}
          />
        </div>
        <DashboardKPICard
          title="Mais Usado"
          value={stats?.cupomMaisUsado?.codigo || '-'}
          icon={Award}
        />
        <DashboardKPICard
          title="Desconto Médio"
          value={stats?.descontoMedio ? `${stats.descontoMedio.toFixed(0)}%` : '0%'}
          icon={Percent}
        />
      </div>

      {/* Top Cupons Chart */}
      {stats?.topCupons && stats.topCupons.length > 0 && (
        <div className="mb-6">
          <TopCuponsChart data={stats.topCupons} />
        </div>
      )}

      <Card>
        <div className="overflow-x-auto" data-tour="cupons-tabela">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categorias</TableHead>
                <TableHead>Auto-aplicar</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cupons.map((cupom) => (
                <TableRow key={cupom.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {cupom.codigo}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {cupom.desconto_percentual}%
                  </TableCell>
                  <TableCell className="text-sm">
                    {TIPO_APLICACAO_LABELS[cupom.tipo_aplicacao]}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cupom.categorias_aplicaveis.map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {CATEGORIA_LABELS[cat as keyof typeof CATEGORIA_LABELS]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {cupom.auto_aplicar ? (
                      <Badge className="bg-green-500">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {cupom.data_validade_fim 
                      ? format(new Date(cupom.data_validade_fim), 'dd/MM/yyyy')
                      : 'Sem limite'
                    }
                  </TableCell>
                  <TableCell>
                    {cupom.uso_maximo ? (
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {cupom.uso_atual} / {cupom.uso_maximo}
                          </span>
                          <span className="font-medium">
                            {Math.round((cupom.uso_atual / cupom.uso_maximo) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(cupom.uso_atual / cupom.uso_maximo) * 100}
                          className={`h-2 ${
                            cupom.uso_atual >= cupom.uso_maximo 
                              ? '[&>div]:bg-red-500' 
                              : (cupom.uso_atual / cupom.uso_maximo) > 0.8 
                              ? '[&>div]:bg-orange-500' 
                              : (cupom.uso_atual / cupom.uso_maximo) > 0.5
                              ? '[&>div]:bg-yellow-500'
                              : '[&>div]:bg-green-500'
                          }`}
                        />
                        {cupom.uso_atual >= cupom.uso_maximo && (
                          <Badge variant="destructive" className="text-xs">
                            Esgotado
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline">Ilimitado</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={cupom.status === 'ativo'}
                      onCheckedChange={(checked) => 
                        handleToggleStatus(cupom.id, checked ? 'ativo' : 'inativo')
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background">
                        <DropdownMenuItem onClick={() => handleEdit(cupom)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteConfirm(cupom.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {cupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    Nenhum cupom cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCupom ? 'Editar Cupom' : 'Novo Cupom'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="codigo">Código do Cupom*</Label>
              <Input 
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
                placeholder="Ex: PROMO2024"
                className="font-mono"
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Apenas letras e números, sem espaços
              </p>
            </div>

            <div>
              <Label htmlFor="desconto">Desconto (%)*</Label>
              <Input 
                id="desconto"
                type="number"
                min="1"
                max="100"
                value={formData.desconto_percentual}
                onChange={(e) => setFormData({...formData, desconto_percentual: Number(e.target.value)})}
                required
              />
            </div>

            <div>
              <Label>Aplicável em*</Label>
              <Select 
                value={formData.tipo_aplicacao}
                onValueChange={(value: any) => setFormData({...formData, tipo_aplicacao: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os serviços</SelectItem>
                  <SelectItem value="servicos_limpeza">Apenas Serviços de Limpeza</SelectItem>
                  <SelectItem value="combos">Apenas Combos</SelectItem>
                  <SelectItem value="alugueis">Apenas Aluguéis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Categorias*</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="cat-home"
                    checked={formData.categorias_aplicaveis.includes('home')}
                    onCheckedChange={() => toggleCategoria('home')}
                  />
                  <Label htmlFor="cat-home" className="font-normal">Para Casa</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="cat-business"
                    checked={formData.categorias_aplicaveis.includes('business')}
                    onCheckedChange={() => toggleCategoria('business')}
                  />
                  <Label htmlFor="cat-business" className="font-normal">Para Empresa</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label>Aplicar Automaticamente</Label>
                <p className="text-xs text-muted-foreground">
                  Cupom será aplicado sem precisar digitar código
                </p>
              </div>
              <Switch
                checked={formData.auto_aplicar}
                onCheckedChange={(checked) => setFormData({...formData, auto_aplicar: checked})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data-inicio">Data Início</Label>
                <Input 
                  id="data-inicio"
                  type="date"
                  value={formData.data_validade_inicio}
                  onChange={(e) => setFormData({...formData, data_validade_inicio: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="data-fim">Data Fim</Label>
                <Input 
                  id="data-fim"
                  type="date"
                  value={formData.data_validade_fim}
                  onChange={(e) => setFormData({...formData, data_validade_fim: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="uso-maximo">Limite de Uso</Label>
              <Input 
                id="uso-maximo"
                type="number"
                min="1"
                value={formData.uso_maximo || ''}
                onChange={(e) => setFormData({...formData, uso_maximo: e.target.value ? Number(e.target.value) : null})}
                placeholder="Deixe vazio para ilimitado"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCupom ? 'Atualizar' : 'Criar Cupom'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminContainer>
  );
}
