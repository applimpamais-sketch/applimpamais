import { useState, useCallback } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminContainer from '@/components/admin/AdminContainer';
import { useRealtimeCanais } from '@/hooks/useRealtimeCanais';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from '@/components/ui/dialog';
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
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import {
   Plus,
   MousePointer,
   Target,
   TrendingUp,
   DollarSign,
   MoreHorizontal,
   Copy,
   Power,
   Trash2,
   Pencil,
   ExternalLink,
   Instagram,
   Search,
   ShoppingCart,
   Mail,
   Globe,
  Youtube,
  Music2,
 } from 'lucide-react';
 import { useCanaisEmpresa, CanalEmpresa, CanalFormData } from '@/hooks/useCanaisEmpresa';
 import { useToast } from '@/hooks/use-toast';
 import { SITE_DOMAIN } from '@/lib/constants';
 
 const tipoIcons: Record<string, any> = {
   instagram: Instagram,
   google: Search,
   blog: Globe,
   marketplace: ShoppingCart,
   email: Mail,
  tiktok: Music2,
  youtube: Youtube,
   outro: Globe,
 };
 
 const tipoColors: Record<string, string> = {
   instagram: 'bg-pink-500/10 text-pink-500',
   google: 'bg-blue-500/10 text-blue-500',
   blog: 'bg-green-500/10 text-green-500',
   marketplace: 'bg-orange-500/10 text-orange-500',
   email: 'bg-purple-500/10 text-purple-500',
   outro: 'bg-gray-500/10 text-gray-500',
  tiktok: 'bg-slate-800/10 text-slate-700',
  youtube: 'bg-red-500/10 text-red-500',
 };
 
export default function Canais() {
  const { canais, isLoading, totais, createCanal, updateCanal, toggleStatus, deleteCanal, refetch } = useCanaisEmpresa();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCanal, setEditingCanal] = useState<CanalEmpresa | null>(null);
  const [formData, setFormData] = useState<CanalFormData>({
    codigo: '',
    nome: '',
    descricao: '',
    tipo: 'outro',
  });

  // Ativa realtime - qualquer mudança dispara refetch
  const handleRealtimeUpdate = useCallback(() => {
    refetch();
  }, [refetch]);
  
  useRealtimeCanais(handleRealtimeUpdate);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (editingCanal) {
       await updateCanal.mutateAsync({ id: editingCanal.id, ...formData });
     } else {
       await createCanal.mutateAsync(formData);
     }
     
     setIsModalOpen(false);
     setEditingCanal(null);
     setFormData({ codigo: '', nome: '', descricao: '', tipo: 'outro' });
   };
 
   const handleEdit = (canal: CanalEmpresa) => {
     setEditingCanal(canal);
     setFormData({
       codigo: canal.codigo,
       nome: canal.nome,
       descricao: canal.descricao || '',
       tipo: canal.tipo,
     });
     setIsModalOpen(true);
   };
 
   const handleCopyLink = (codigo: string) => {
     const url = `${window.location.origin}/?ref=${codigo}`;
     navigator.clipboard.writeText(url);
     toast({
       title: 'Link copiado!',
       description: url,
     });
   };
 
   const handleCopyShortLink = (codigo: string) => {
     const url = `${window.location.origin}/${codigo}`;
     navigator.clipboard.writeText(url);
     toast({
       title: 'Link curto copiado!',
       description: url,
     });
   };
 
   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('pt-BR', {
       style: 'currency',
       currency: 'BRL',
     }).format(value);
   };
 
    return (
    <AdminContainer>
      <div className="space-y-6">
        <PageHeader
         title="Canais de Origem"
         subtitle="Rastreie a origem dos seus clientes por canais orgânicos"
       />
 
       {/* KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-primary/10">
                 <MousePointer className="h-6 w-6 text-primary" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Cliques</p>
                 <p className="text-2xl font-bold">{totais.cliques.toLocaleString()}</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-green-500/10">
                 <Target className="h-6 w-6 text-green-500" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Conversões</p>
                 <p className="text-2xl font-bold">{totais.conversoes.toLocaleString()}</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-blue-500/10">
                 <TrendingUp className="h-6 w-6 text-blue-500" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                 <p className="text-2xl font-bold">{totais.taxaConversao.toFixed(1)}%</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="pt-6">
             <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-amber-500/10">
                 <DollarSign className="h-6 w-6 text-amber-500" />
               </div>
               <div>
                 <p className="text-sm text-muted-foreground">Receita Gerada</p>
                 <p className="text-2xl font-bold">{formatCurrency(totais.receita)}</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Tabela de Canais */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle>Canais Cadastrados</CardTitle>
           <Dialog open={isModalOpen} onOpenChange={(open) => {
             setIsModalOpen(open);
             if (!open) {
               setEditingCanal(null);
               setFormData({ codigo: '', nome: '', descricao: '', tipo: 'outro' });
             }
           }}>
             <DialogTrigger asChild>
               <Button>
                 <Plus className="h-4 w-4 mr-2" />
                 Novo Canal
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>
                   {editingCanal ? 'Editar Canal' : 'Novo Canal'}
                 </DialogTitle>
               </DialogHeader>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="codigo">Código (usado na URL)</Label>
                   <Input
                     id="codigo"
                     placeholder="ex: bio, stories, blog"
                     value={formData.codigo}
                     onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                     disabled={!!editingCanal}
                     required
                   />
                   <p className="text-xs text-muted-foreground">
                     Link: {window.location.origin}/?ref={formData.codigo || 'codigo'}
                   </p>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="nome">Nome</Label>
                   <Input
                     id="nome"
                     placeholder="ex: Bio Instagram"
                     value={formData.nome}
                     onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                     required
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="tipo">Tipo</Label>
                   <Select
                     value={formData.tipo}
                     onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                   >
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                       <SelectItem value="google">Google</SelectItem>
                       <SelectItem value="blog">Blog</SelectItem>
                       <SelectItem value="marketplace">Marketplace</SelectItem>
                       <SelectItem value="email">E-mail</SelectItem>
                       <SelectItem value="outro">Outro</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="descricao">Descrição (opcional)</Label>
                   <Input
                     id="descricao"
                     placeholder="Descrição do canal"
                     value={formData.descricao}
                     onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                   />
                 </div>
 
                 <Button type="submit" className="w-full" disabled={createCanal.isPending || updateCanal.isPending}>
                   {editingCanal ? 'Salvar Alterações' : 'Criar Canal'}
                 </Button>
               </form>
             </DialogContent>
           </Dialog>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="space-y-3">
               {[1, 2, 3].map((i) => (
                 <Skeleton key={i} className="h-16 w-full" />
               ))}
             </div>
           ) : canais.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               Nenhum canal cadastrado. Crie seu primeiro canal!
             </div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Canal</TableHead>
                   <TableHead>Tipo</TableHead>
                   <TableHead className="text-right">Cliques</TableHead>
                   <TableHead className="text-right">Conversões</TableHead>
                   <TableHead className="text-right">Taxa</TableHead>
                   <TableHead className="text-right">Receita</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="w-[50px]"></TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {canais.map((canal) => {
                   const Icon = tipoIcons[canal.tipo] || Globe;
                   return (
                     <TableRow key={canal.id}>
                       <TableCell>
                         <div>
                           <p className="font-medium">{canal.nome}</p>
                           <p className="text-xs text-muted-foreground font-mono">
                             /?ref={canal.codigo}
                           </p>
                         </div>
                       </TableCell>
                       <TableCell>
                         <Badge variant="outline" className={tipoColors[canal.tipo]}>
                           <Icon className="h-3 w-3 mr-1" />
                           {canal.tipo}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-right font-medium">
                         {canal.total_cliques.toLocaleString()}
                       </TableCell>
                       <TableCell className="text-right">
                         {canal.conversoes?.toLocaleString() || 0}
                       </TableCell>
                       <TableCell className="text-right">
                         <span className={canal.taxa_conversao && canal.taxa_conversao > 5 ? 'text-green-600' : ''}>
                           {canal.taxa_conversao?.toFixed(1) || 0}%
                         </span>
                       </TableCell>
                       <TableCell className="text-right font-medium">
                         {formatCurrency(canal.receita_gerada || 0)}
                       </TableCell>
                       <TableCell>
                         <Badge variant={canal.status === 'ativo' ? 'default' : 'secondary'}>
                           {canal.status}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon">
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handleCopyLink(canal.codigo)}>
                               <Copy className="h-4 w-4 mr-2" />
                               Copiar Link
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleEdit(canal)}>
                               <Pencil className="h-4 w-4 mr-2" />
                               Editar
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                               onClick={() => toggleStatus.mutate({ 
                                 id: canal.id, 
                                 status: canal.status === 'ativo' ? 'inativo' : 'ativo' 
                               })}
                             >
                               <Power className="h-4 w-4 mr-2" />
                               {canal.status === 'ativo' ? 'Desativar' : 'Ativar'}
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                               onClick={() => deleteCanal.mutate(canal.id)}
                               className="text-red-600"
                             >
                               <Trash2 className="h-4 w-4 mr-2" />
                               Excluir
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </TableCell>
                     </TableRow>
                   );
                 })}
               </TableBody>
             </Table>
           )}
         </CardContent>
       </Card>
 
       {/* Instruções */}
       <Card>
         <CardHeader>
           <CardTitle className="text-base">Como usar</CardTitle>
         </CardHeader>
         <CardContent className="text-sm text-muted-foreground space-y-3">
           <p>
             <strong>1.</strong> Crie um canal para cada fonte de tráfego que deseja rastrear
           </p>
           <p>
             <strong>2.</strong> Use o link gerado em cada plataforma:
           </p>
           <ul className="list-disc list-inside ml-4 space-y-1">
             <li>Bio do Instagram: <code className="bg-muted px-1 rounded">{`${SITE_DOMAIN}/?ref=bio`}</code></li>
             <li>Google My Business: <code className="bg-muted px-1 rounded">{`${SITE_DOMAIN}/?ref=google-maps`}</code></li>
             <li>Blog: <code className="bg-muted px-1 rounded">{`${SITE_DOMAIN}/?ref=blog`}</code></li>
           </ul>
           <p>
             <strong>3.</strong> Os cliques e conversões serão rastreados automaticamente
           </p>
         </CardContent>
       </Card>
      </div>
    </AdminContainer>
  );
}
