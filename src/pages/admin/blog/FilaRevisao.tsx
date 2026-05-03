import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useBlogPosts, useUpdateBlogPost, useDeleteBlogPost, BlogPost } from '@/hooks/useBlogPosts';
import { useBlogGeneration } from '@/hooks/useBlogGeneration';
import { 
  Eye, CheckCircle, Trash2, ExternalLink, Loader2, 
  FileText, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; className: string }> = {
    queued: { label: 'Na Fila', className: 'bg-muted text-muted-foreground' },
    generating: { label: 'Gerando', className: 'bg-primary text-primary-foreground' },
    generated: { label: 'Gerado', className: 'bg-amber-500 text-white' },
    processing_images: { label: 'Gerando Imagens', className: 'bg-purple-500 text-white' },
    reviewed: { label: 'Revisado', className: 'bg-orange-400 text-white' },
    ready: { label: 'Pronto', className: 'bg-emerald-500 text-white' },
    publishing: { label: 'Publicando', className: 'bg-purple-500 text-white' },
    published: { label: 'Publicado', className: 'bg-emerald-600 text-white' },
    failed: { label: 'Erro', className: 'bg-destructive text-destructive-foreground' },
  };
  return configs[status] || configs.queued;
};


export default function FilaRevisao() {
  const { user, loading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data: posts, isLoading } = useBlogPosts({ status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined }, !!user);
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const { processAndPublish, isProcessingAndPublishing } = useBlogGeneration();
  
  const handleSelectAll = (checked: boolean) => {
    if (checked && posts) {
      setSelectedIds(posts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };
  
  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, postId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== postId));
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Tem certeza que deseja excluir ${selectedIds.length} post(s)?`)) return;
    
    setIsDeleting(true);
    
    try {
      // Delete all selected posts directly via Supabase
      const { error } = await supabase
        .from('blog_posts_queue')
        .delete()
        .in('id', selectedIds);
      
      if (error) throw error;
      
      toast.success(`${selectedIds.length} post(s) excluído(s)`);
      setSelectedIds([]);
      
      // Force refetch
      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir posts:', error);
      toast.error('Erro ao excluir posts');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleApprove = async (post: BlogPost) => {
    await updatePost.mutateAsync({ id: post.id, status: 'ready' });
    toast.success('Post aprovado e pronto para publicar');
  };
  
  const handlePublish = async (post: BlogPost, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await processAndPublish.mutateAsync(post.id);
  };
  
  
  const handleDelete = async (post: BlogPost) => {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      await deletePost.mutateAsync(post.id);
      toast.success('Post excluído');
    }
  };
   
   // Guard: mostrar loading enquanto auth não resolver
   if (authLoading || !user) {
     return (
       <AdminContainer>
         <div className="flex items-center justify-center py-12">
           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
       </AdminContainer>
     );
   }
 
   return (
    <AdminContainer>
       <PageHeader
         title="Fila & Revisão"
         description="Revise, aprove e publique posts gerados"
       />
       
       {/* Filtros */}
       <div className="flex items-center gap-4">
         <Select value={statusFilter} onValueChange={setStatusFilter}>
           <SelectTrigger className="w-[200px]">
             <SelectValue placeholder="Todos os status" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">Todos</SelectItem>
             {Object.entries(statusConfig).map(([key, config]) => (
               <SelectItem key={key} value={key}>{config.label}</SelectItem>
             ))}
           </SelectContent>
         </Select>
         
         <span className="text-sm text-muted-foreground">
           {posts?.length || 0} posts
         </span>
       </div>
        
        {/* Bulk Actions */}
        {posts && posts.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={selectedIds.length === posts.length && posts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedIds.length > 0 ? `${selectedIds.length} selecionado(s)` : 'Selecionar todos'}
                </span>
              </div>
              
              {selectedIds.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Excluir {selectedIds.length}
                </Button>
              )}
            </div>
          </Card>
        )}
        
        {/* Lista de Posts */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum post encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {posts?.map(post => {
                  const status = statusConfig[post.status] || statusConfig.queued;
                  const isSelected = selectedIds.includes(post.id);
                  
                  return (
                    <div key={post.id} className={`p-4 hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectPost(post.id, !!checked)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {post.title || post.chosen_keyword}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {post.chosen_keyword}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">{post.cluster}</Badge>
                              <Badge variant="secondary" className="text-xs">{post.objective}</Badge>
                              {post.region_city && (
                                <Badge variant="outline" className="text-xs">{post.region_city}</Badge>
                              )}
                              <Badge className={`text-xs ${getStatusConfig(post.status).className}`}>
                                {['generating', 'publishing', 'processing_images'].includes(post.status) ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                <span>{getStatusConfig(post.status).label}</span>
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Criado em {format(new Date(post.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              {post.published_at && (
                                <> • Publicado em {format(new Date(post.published_at), "dd/MM/yyyy", { locale: ptBR })}</>
                              )}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                {post.seo_score}/100
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {post.word_count} palavras
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedPost(post)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {post.status === 'generated' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleApprove(post)}
                                  title="Aprovar post"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              
                              
                              {(post.status === 'ready' || post.status === 'generated') && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => handlePublish(post, e)}
                                  disabled={isProcessingAndPublishing}
                                  title="Publicar no WordPress"
                                >
                                  {isProcessingAndPublishing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4 text-primary" />
                                  )}
                                </Button>
                              )}
                              
                              {post.wp_post_url && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  asChild
                                >
                                  <a href={post.wp_post_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(post)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
       
       {/* Modal Preview */}
       <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
         <DialogContent className="max-w-4xl max-h-[90vh]">
           <DialogHeader>
             <DialogTitle>{selectedPost?.title || 'Preview do Post'}</DialogTitle>
           </DialogHeader>
           <ScrollArea className="max-h-[70vh]">
             <div className="space-y-4 p-4">
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="text-muted-foreground">Keyword:</span>
                   <p className="font-medium">{selectedPost?.chosen_keyword}</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground">Slug:</span>
                   <p className="font-medium">{selectedPost?.slug}</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground">Meta Title:</span>
                   <p className="font-medium">{selectedPost?.meta_title}</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground">Meta Description:</span>
                   <p className="font-medium">{selectedPost?.meta_description}</p>
                 </div>
               </div>
               
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Conteúdo</h4>
                  <div 
                    className="blog-preview bg-white p-6 rounded-lg border shadow-sm"
                    dangerouslySetInnerHTML={{ __html: selectedPost?.content_html || '' }}
                  />
               </div>
               
               {selectedPost?.faqs_json && Array.isArray(selectedPost.faqs_json) && selectedPost.faqs_json.length > 0 && (
                 <div className="border-t pt-4">
                   <h4 className="font-medium mb-2">FAQs</h4>
                   <div className="space-y-2">
                     {(selectedPost.faqs_json as Array<{ pergunta: string; resposta: string }>).map((faq, i) => (
                       <div key={i} className="p-3 bg-muted rounded-lg">
                         <p className="font-medium">{faq.pergunta}</p>
                         <p className="text-sm text-muted-foreground mt-1">{faq.resposta}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           </ScrollArea>
         </DialogContent>
       </Dialog>
    </AdminContainer>
   );
 }