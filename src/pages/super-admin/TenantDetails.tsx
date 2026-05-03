import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenants, SaasTenant } from '@/hooks/useTenants';
import { useTenantModulosAdmin, useModulosCatalogo } from '@/hooks/useTenantModules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  Save,
  Loader2,
  Play,
  Pause,
  XCircle,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { TenantModulosContratados, useModulosTotal } from '@/components/super-admin/TenantModulosContratados';
import { ModuloSelector } from '@/components/super-admin/ModuloSelector';
import { supabase } from '@/integrations/supabase/client';

const statusConfig = {
  trial: { label: 'Trial', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  ativo: { label: 'Ativo', className: 'bg-green-100 text-green-800 border-green-200' },
  inadimplente: { label: 'Inadimplente', className: 'bg-red-100 text-red-800 border-red-200' },
  cancelado: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  pausado: { label: 'Pausado', className: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const planoConfig = {
  starter: { label: 'Starter', preco: 297 },
  professional: { label: 'Professional', preco: 497 },
  enterprise: { label: 'Enterprise', preco: 997 },
};

export default function TenantDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTenantById, updateTenant, activateTenant, pauseTenant, cancelTenant } = useTenants();
  const { ativarModulo, desativarModulo, refetch: refetchModulos } = useTenantModulosAdmin(id);
  const { data: catalogo } = useModulosCatalogo();
  const { totalValor: totalModulos, activeCount: modulosAtivos } = useModulosTotal(id);

  const [tenant, setTenant] = useState<SaasTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<SaasTenant>>({});
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'activate' | 'pause' | 'cancel';
  }>({ open: false, type: 'activate' });
  const [showModuloEditor, setShowModuloEditor] = useState(false);
  const [modulosSelecionados, setModulosSelecionados] = useState<Array<{
    modulo_id: string;
    codigo: string;
    preco_negociado: number | null;
  }>>([]);
  const [savingModulos, setSavingModulos] = useState(false);
  const [syncingModulos, setSyncingModulos] = useState(false);

  useEffect(() => {
    async function loadTenant() {
      if (!id) return;
      setLoading(true);
      const data = await getTenantById(id);
      if (data) {
        setTenant(data);
        setFormData(data);
      } else {
        toast.error('Tenant não encontrado');
        navigate('/super-admin/tenants');
      }
      setLoading(false);
    }
    loadTenant();
  }, [id]);

  const handleChange = (field: keyof SaasTenant, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    
    try {
      await updateTenant.mutateAsync({
        id,
        nome_empresa: formData.nome_empresa,
        nome_fantasia: formData.nome_fantasia || undefined,
        cnpj: formData.cnpj || undefined,
        email_contato: formData.email_contato,
        telefone: formData.telefone || undefined,
        responsavel_nome: formData.responsavel_nome,
        responsavel_email: formData.responsavel_email,
        plano: formData.plano,
        valor_mensal: formData.valor_mensal,
        dominio_customizado: formData.dominio_customizado || undefined,
      });
      
      // Recarregar dados
      const data = await getTenantById(id);
      if (data) {
        setTenant(data);
        setFormData(data);
      }
      setEditMode(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleAction = async () => {
    if (!id) return;
    
    if (actionDialog.type === 'activate') {
      await activateTenant.mutateAsync(id);
    } else if (actionDialog.type === 'pause') {
      await pauseTenant.mutateAsync(id);
    } else if (actionDialog.type === 'cancel') {
      await cancelTenant.mutateAsync(id);
    }
    
    // Recarregar dados
    const data = await getTenantById(id);
    if (data) {
      setTenant(data);
      setFormData(data);
    }
    setActionDialog({ ...actionDialog, open: false });
  };

  // Funções para gerenciar módulos
  const handleOpenModuloEditor = async () => {
    if (!id) return;
    
    // Buscar módulos ativos atuais
    const { data: modulosAtuais } = await supabase
      .from('tenant_modulos')
      .select('modulo_id, preco_negociado, modulo:saas_modulos(codigo)')
      .eq('tenant_id', id)
      .eq('status', 'ativo');
    
    const selected = modulosAtuais?.map(m => ({
      modulo_id: m.modulo_id,
      codigo: (m.modulo as any)?.codigo || '',
      preco_negociado: m.preco_negociado,
    })) || [];
    
    setModulosSelecionados(selected);
    setShowModuloEditor(true);
  };

  const handleSaveModulos = async () => {
    if (!id) return;
    setSavingModulos(true);
    
    try {
      // Buscar módulos atuais
      const { data: modulosAtuais } = await supabase
        .from('tenant_modulos')
        .select('modulo_id')
        .eq('tenant_id', id)
        .eq('status', 'ativo');
      
      const idsAtuais = new Set(modulosAtuais?.map(m => m.modulo_id) || []);
      const idsNovos = new Set(modulosSelecionados.map(m => m.modulo_id));
      
      // Desativar módulos removidos
      for (const atual of modulosAtuais || []) {
        if (!idsNovos.has(atual.modulo_id)) {
          await desativarModulo(atual.modulo_id);
        }
      }
      
      // Ativar/atualizar módulos selecionados
      for (const modulo of modulosSelecionados) {
        await ativarModulo(modulo.modulo_id, modulo.preco_negociado ?? undefined);
      }
      
      // Recalcular valor_mensal manualmente
      const total = modulosSelecionados.reduce((sum, m) => {
        const moduloCatalogo = catalogo?.find(c => c.id === m.modulo_id);
        return sum + (m.preco_negociado ?? moduloCatalogo?.preco_base ?? 0);
      }, 0);
      
      await supabase
        .from('saas_tenants')
        .update({ valor_mensal: total })
        .eq('id', id);
      
      // Recarregar dados
      const data = await getTenantById(id);
      if (data) {
        setTenant(data);
        setFormData(data);
      }
      await refetchModulos();
      
      toast.success('Módulos atualizados com sucesso!');
      setShowModuloEditor(false);
    } catch (error) {
      console.error('Erro ao salvar módulos:', error);
      toast.error('Erro ao salvar módulos');
    } finally {
      setSavingModulos(false);
    }
  };

  const handleSyncModulos = async () => {
    if (!id || !tenant) return;
    setSyncingModulos(true);
    
    try {
      // Buscar módulos do plano e ativar
      const { data: modulosPlano } = await supabase
        .from('plano_modulos_default')
        .select('modulo_id')
        .eq('plano', tenant.plano);
      
      if (modulosPlano && modulosPlano.length > 0) {
        for (const mp of modulosPlano) {
          await ativarModulo(mp.modulo_id);
        }
        
        // Recalcular valor
        const { data: modulosAtualizados } = await supabase
          .from('tenant_modulos')
          .select('preco_negociado, modulo:saas_modulos(preco_base)')
          .eq('tenant_id', id)
          .eq('status', 'ativo');
        
        const total = modulosAtualizados?.reduce((sum, m) => {
          return sum + (m.preco_negociado ?? (m.modulo as any)?.preco_base ?? 0);
        }, 0) || 0;
        
        await supabase
          .from('saas_tenants')
          .update({ valor_mensal: total })
          .eq('id', id);
        
        // Recarregar
        const data = await getTenantById(id);
        if (data) {
          setTenant(data);
          setFormData(data);
        }
        await refetchModulos();
        
        toast.success(`Módulos sincronizados com plano ${tenant.plano}!`);
      } else {
        toast.info('Nenhum módulo padrão definido para este plano');
      }
    } catch (error) {
      console.error('Erro ao sincronizar módulos:', error);
      toast.error('Erro ao sincronizar módulos');
    } finally {
      setSyncingModulos(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  const status = statusConfig[tenant.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/super-admin/tenants')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{tenant.nome_fantasia || tenant.nome_empresa}</h1>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">{tenant.cnpj || 'CNPJ não informado'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>Editar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => { setEditMode(false); setFormData(tenant); }}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={updateTenant.isPending}>
                {updateTenant.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Razão Social</Label>
                {editMode ? (
                  <Input
                    value={formData.nome_empresa || ''}
                    onChange={(e) => handleChange('nome_empresa', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{tenant.nome_empresa}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                {editMode ? (
                  <Input
                    value={formData.nome_fantasia || ''}
                    onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{tenant.nome_fantasia || '-'}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>CNPJ</Label>
                {editMode ? (
                  <Input
                    value={formData.cnpj || ''}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                  />
                ) : (
                  <p className="font-medium">{tenant.cnpj || '-'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                {editMode ? (
                  <Input
                    value={formData.telefone || ''}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                  />
                ) : (
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {tenant.telefone || '-'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email de Contato</Label>
              {editMode ? (
                <Input
                  type="email"
                  value={formData.email_contato || ''}
                  onChange={(e) => handleChange('email_contato', e.target.value)}
                />
              ) : (
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {tenant.email_contato}
                </p>
              )}
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Responsável</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  {editMode ? (
                    <Input
                      value={formData.responsavel_nome || ''}
                      onChange={(e) => handleChange('responsavel_nome', e.target.value)}
                    />
                  ) : (
                    <p className="font-medium">{tenant.responsavel_nome}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  {editMode ? (
                    <Input
                      type="email"
                      value={formData.responsavel_email || ''}
                      onChange={(e) => handleChange('responsavel_email', e.target.value)}
                    />
                  ) : (
                    <p className="font-medium">{tenant.responsavel_email}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plano e Valor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Plano</Label>
                {editMode ? (
                  <Select
                    value={formData.plano}
                    onValueChange={(value) => handleChange('plano', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className="bg-primary">{planoConfig[tenant.plano].label}</Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Valor Mensal</Label>
                {editMode ? (
                  <Input
                    type="number"
                    value={formData.valor_mensal || 0}
                    onChange={(e) => handleChange('valor_mensal', Number(e.target.value))}
                  />
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(totalModulos)}
                    </p>
                    {Math.abs(tenant.valor_mensal - totalModulos) > 0.01 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Banco: {formatCurrency(tenant.valor_mensal)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {tenant.status === 'trial' && tenant.trial_termina_em && (
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-sm text-accent-foreground">
                    <strong>Trial expira em:</strong><br />
                    {formatDate(tenant.trial_termina_em)}
                  </p>
                </div>
              )}

              {/* Botões de gerenciamento de módulos */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={handleOpenModuloEditor}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSyncModulos}
                  disabled={syncingModulos}
                >
                  {syncingModulos ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Módulos contratados */}
              {id && (
                <TenantModulosContratados 
                  tenantId={id} 
                  valorMensalBanco={tenant.valor_mensal}
                  showTotal={true}
                />
              )}
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em:</span>
                <span>{formatDate(tenant.criado_em)}</span>
              </div>
              {tenant.ativado_em && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ativado em:</span>
                  <span>{formatDate(tenant.ativado_em)}</span>
                </div>
              )}
              {tenant.ultimo_pagamento_em && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último pagamento:</span>
                  <span>{formatDate(tenant.ultimo_pagamento_em)}</span>
                </div>
              )}
              {tenant.cancelado_em && (
                <div className="flex justify-between text-destructive">
                  <span>Cancelado em:</span>
                  <span>{formatDate(tenant.cancelado_em)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tenant.status === 'trial' && (
                <Button 
                  className="w-full" 
                  onClick={() => setActionDialog({ open: true, type: 'activate' })}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Ativar Cliente
                </Button>
              )}
              {tenant.status === 'ativo' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActionDialog({ open: true, type: 'pause' })}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
              )}
              {tenant.status !== 'cancelado' && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setActionDialog({ open: true, type: 'cancel' })}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialog */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.type === 'activate' && 'Ativar cliente'}
              {actionDialog.type === 'pause' && 'Pausar cliente'}
              {actionDialog.type === 'cancel' && 'Cancelar cliente'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === 'activate' && 
                `Tem certeza que deseja ativar "${tenant.nome_fantasia || tenant.nome_empresa}"? O cliente passará a ser cobrado normalmente.`
              }
              {actionDialog.type === 'pause' && 
                `Tem certeza que deseja pausar "${tenant.nome_fantasia || tenant.nome_empresa}"? O acesso será suspenso temporariamente.`
              }
              {actionDialog.type === 'cancel' && 
                `Tem certeza que deseja cancelar "${tenant.nome_fantasia || tenant.nome_empresa}"? Esta ação não pode ser desfeita facilmente.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction}
              className={actionDialog.type === 'cancel' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Gerenciamento de Módulos */}
      <Dialog open={showModuloEditor} onOpenChange={setShowModuloEditor}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Módulos</DialogTitle>
            <DialogDescription>
              Selecione os módulos que deseja ativar para {tenant?.nome_fantasia || tenant?.nome_empresa}
            </DialogDescription>
          </DialogHeader>
          
          <ModuloSelector 
            selected={modulosSelecionados} 
            onChange={setModulosSelecionados}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuloEditor(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveModulos} disabled={savingModulos}>
              {savingModulos ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Módulos
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
