import { useState } from 'react';
import { 
  Link2, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink,
  BarChart3,
  Pause,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { useParceiro } from '@/hooks/useParceiro';
import { useParceiroLinks, ParceiroLink } from '@/hooks/useParceiroLinks';
import { cn } from '@/lib/utils';

export default function ParceiroLinks() {
  const { parceiro } = useParceiro();
  const { 
    links, 
    loading, 
    createLink, 
    updateLink, 
    deleteLink,
    totalConversoes 
  } = useParceiroLinks();

  // Total de cliques vem direto do parceiro (inclui link principal + links campanha)
  const totalCliques = parceiro?.total_cliques || 0;

  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<ParceiroLink | null>(null);
  const [creating, setCreating] = useState(false);

  const [newLink, setNewLink] = useState({
    codigo: '',
    nome_campanha: '',
    cupom_vinculado: '',
  });

  const baseUrl = window.location.origin;

  const copyToClipboard = (code: string) => {
    const url = `${baseUrl}/p/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(code);
    toast.success('Link copiado!');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCreateLink = async () => {
    if (!newLink.codigo) {
      toast.error('Código do link é obrigatório');
      return;
    }

    setCreating(true);
    const { error } = await createLink({
      codigo: `${parceiro?.codigo_referencia}-${newLink.codigo}`.toUpperCase(),
      nome_campanha: newLink.nome_campanha || undefined,
      cupom_vinculado: newLink.cupom_vinculado || undefined,
    });

    if (error) {
      toast.error(error.message || 'Erro ao criar link');
    } else {
      toast.success('Link criado com sucesso!');
      setCreateDialogOpen(false);
      setNewLink({ codigo: '', nome_campanha: '', cupom_vinculado: '' });
    }
    setCreating(false);
  };

  const handleToggleStatus = async (link: ParceiroLink) => {
    const newStatus = link.status === 'ativo' ? 'pausado' : 'ativo';
    const { error } = await updateLink(link.id, { status: newStatus });
    
    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success(`Link ${newStatus === 'ativo' ? 'ativado' : 'pausado'}`);
    }
  };

  const handleDeleteLink = async () => {
    if (!linkToDelete) return;
    
    const { error } = await deleteLink(linkToDelete.id);
    
    if (error) {
      toast.error('Erro ao excluir link');
    } else {
      toast.success('Link excluído');
    }
    
    setDeleteDialogOpen(false);
    setLinkToDelete(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Meus Links</h1>
          <p className="text-muted-foreground">
            Gerencie seus links de divulgação
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={parceiro?.status !== 'ativo'} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Link
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 sm:mx-auto max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Link</DialogTitle>
              <DialogDescription>
                Crie um link personalizado para uma campanha específica
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Código do link *</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">
                    {parceiro?.codigo_referencia}-
                  </span>
                  <Input
                    placeholder="SOFA"
                    value={newLink.codigo}
                    onChange={(e) => setNewLink({ ...newLink, codigo: e.target.value.toUpperCase() })}
                    className="uppercase"
                  />
                </div>
                <p className="text-xs text-muted-foreground break-all">
                  Link final: {baseUrl}/p/{parceiro?.codigo_referencia}-{newLink.codigo || 'CODIGO'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Nome da campanha</Label>
                <Input
                  placeholder="Ex: Stories Janeiro"
                  value={newLink.nome_campanha}
                  onChange={(e) => setNewLink({ ...newLink, nome_campanha: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Cupom vinculado (opcional)</Label>
                <Input
                  placeholder="CUPOM10"
                  value={newLink.cupom_vinculado}
                  onChange={(e) => setNewLink({ ...newLink, cupom_vinculado: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-muted-foreground">
                  Se preenchido, o cupom será aplicado automaticamente
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateLink} disabled={creating}>
                {creating ? 'Criando...' : 'Criar Link'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold">{links.length}</p>
            <p className="text-xs text-muted-foreground">Links ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold">{totalCliques}</p>
            <p className="text-xs text-muted-foreground">Total de cliques</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold">{totalConversoes}</p>
            <p className="text-xs text-muted-foreground">Total conversões</p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Link */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Link Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-2 sm:px-3 py-2 bg-background rounded text-xs sm:text-sm truncate break-all">
              {baseUrl}/p/{parceiro?.codigo_referencia}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(parceiro?.codigo_referencia || '')}
            >
              {copiedLink === parceiro?.codigo_referencia ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(`/p/${parceiro?.codigo_referencia}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links de Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum link de campanha criado</p>
              <p className="text-xs">Crie links específicos para rastrear suas campanhas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div 
                  key={link.id}
                  className={cn(
                    "p-3 sm:p-4 rounded-lg border",
                    link.status === 'pausado' && "opacity-60"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono font-medium text-sm break-all">/p/{link.codigo}</span>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            link.status === 'ativo' && "bg-green-50 text-green-700 border-green-200",
                            link.status === 'pausado' && "bg-yellow-50 text-yellow-700 border-yellow-200"
                          )}
                        >
                          {link.status}
                        </Badge>
                        {link.cupom_vinculado && (
                          <Badge variant="secondary" className="text-xs">
                            Cupom: {link.cupom_vinculado}
                          </Badge>
                        )}
                      </div>
                      {link.nome_campanha && (
                        <p className="text-sm text-muted-foreground">{link.nome_campanha}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(link.codigo)}
                      >
                        {copiedLink === link.codigo ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(link)}
                      >
                        {link.status === 'ativo' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setLinkToDelete(link);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 pt-3 border-t text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>{link.cliques} cliques</span>
                    </div>
                    <div>
                      <span className="text-green-600">{link.conversoes} conversões</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {formatCurrency(link.receita_gerada)} gerado
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir link?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O link /p/{linkToDelete?.codigo} será 
              permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLink}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
