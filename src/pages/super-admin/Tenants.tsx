import { useState } from 'react';
import { useTenants, SaasTenantStatus, SaasPlano } from '@/hooks/useTenants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Pause, 
  Play, 
  XCircle,
  Building2,
  Download,
  Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
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

const statusConfig: Record<SaasTenantStatus, { label: string; className: string }> = {
  trial: { label: 'Trial', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  ativo: { label: 'Ativo', className: 'bg-green-100 text-green-800 border-green-200' },
  inadimplente: { label: 'Inadimplente', className: 'bg-red-100 text-red-800 border-red-200' },
  cancelado: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  pausado: { label: 'Pausado', className: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const planoConfig: Record<SaasPlano, { label: string; className: string }> = {
  starter: { label: 'Starter', className: 'bg-blue-500 text-white' },
  professional: { label: 'Professional', className: 'bg-violet-500 text-white' },
  enterprise: { label: 'Enterprise', className: 'bg-amber-500 text-white' },
};

export default function Tenants() {
  const navigate = useNavigate();
  const { tenants, isLoading, activateTenant, pauseTenant, cancelTenant, resendInvite } = useTenants();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planoFilter, setPlanoFilter] = useState<string>('all');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'activate' | 'pause' | 'cancel' | 'resend';
    tenantId: string;
    tenantName: string;
    tenantEmail?: string;
  }>({ open: false, type: 'activate', tenantId: '', tenantName: '', tenantEmail: '' });

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = 
      tenant.nome_empresa.toLowerCase().includes(search.toLowerCase()) ||
      tenant.nome_fantasia?.toLowerCase().includes(search.toLowerCase()) ||
      tenant.responsavel_nome.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email_contato.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesPlano = planoFilter === 'all' || tenant.plano === planoFilter;
    
    return matchesSearch && matchesStatus && matchesPlano;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const handleAction = async () => {
    const { type, tenantId } = actionDialog;
    
    if (type === 'activate') {
      await activateTenant.mutateAsync(tenantId);
    } else if (type === 'pause') {
      await pauseTenant.mutateAsync(tenantId);
    } else if (type === 'cancel') {
      await cancelTenant.mutateAsync(tenantId);
    } else if (type === 'resend') {
      await resendInvite.mutateAsync(tenantId);
    }
    
    setActionDialog({ ...actionDialog, open: false });
  };

  const exportToCSV = () => {
    const headers = ['Empresa', 'CNPJ', 'Responsável', 'Email', 'Plano', 'Status', 'Valor Mensal', 'Criado em'];
    const rows = filteredTenants.map(t => [
      t.nome_fantasia || t.nome_empresa,
      t.cnpj || '',
      t.responsavel_nome,
      t.email_contato,
      t.plano,
      t.status,
      t.valor_mensal,
      formatDate(t.criado_em),
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tenants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas Clientes</h1>
          <p className="text-muted-foreground">Gerencie todas as empresas que usam a plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => navigate('/super-admin/novo-tenant')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, responsável ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inadimplente">Inadimplente</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planoFilter} onValueChange={setPlanoFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos planos</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{tenant.nome_fantasia || tenant.nome_empresa}</p>
                        <p className="text-xs text-muted-foreground">{tenant.cnpj || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tenant.responsavel_nome}</p>
                        <p className="text-xs text-muted-foreground">{tenant.email_contato}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={planoConfig[tenant.plano].className}>
                        {planoConfig[tenant.plano].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[tenant.status].className}>
                        {statusConfig[tenant.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(tenant.valor_mensal)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tenant.criado_em)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {['trial', 'ativo'].includes(tenant.status) && (
                            <DropdownMenuItem 
                              onClick={() => setActionDialog({
                                open: true,
                                type: 'resend',
                                tenantId: tenant.id,
                                tenantName: tenant.nome_fantasia || tenant.nome_empresa,
                                tenantEmail: tenant.email_contato,
                              })}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Reenviar Convite
                            </DropdownMenuItem>
                          )}
                          {tenant.status === 'trial' && (
                            <DropdownMenuItem 
                              onClick={() => setActionDialog({
                                open: true,
                                type: 'activate',
                                tenantId: tenant.id,
                                tenantName: tenant.nome_fantasia || tenant.nome_empresa,
                              })}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          {tenant.status === 'ativo' && (
                            <DropdownMenuItem 
                              onClick={() => setActionDialog({
                                open: true,
                                type: 'pause',
                                tenantId: tenant.id,
                                tenantName: tenant.nome_fantasia || tenant.nome_empresa,
                              })}
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                          )}
                          {tenant.status !== 'cancelado' && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setActionDialog({
                                open: true,
                                type: 'cancel',
                                tenantId: tenant.id,
                                tenantName: tenant.nome_fantasia || tenant.nome_empresa,
                              })}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.type === 'activate' && 'Ativar cliente'}
              {actionDialog.type === 'pause' && 'Pausar cliente'}
              {actionDialog.type === 'cancel' && 'Cancelar cliente'}
              {actionDialog.type === 'resend' && 'Reenviar convite'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === 'activate' && 
                `Tem certeza que deseja ativar "${actionDialog.tenantName}"? O cliente passará a ser cobrado normalmente.`
              }
              {actionDialog.type === 'pause' && 
                `Tem certeza que deseja pausar "${actionDialog.tenantName}"? O acesso será suspenso temporariamente.`
              }
              {actionDialog.type === 'cancel' && 
                `Tem certeza que deseja cancelar "${actionDialog.tenantName}"? Esta ação não pode ser desfeita facilmente.`
              }
              {actionDialog.type === 'resend' && 
                `Deseja reenviar o convite para "${actionDialog.tenantName}"? Um novo email será enviado para ${actionDialog.tenantEmail}.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction}
              className={actionDialog.type === 'cancel' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {actionDialog.type === 'resend' ? 'Enviar' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
