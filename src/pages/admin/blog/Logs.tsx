 import PageHeader from '@/components/admin/PageHeader';
 import AdminContainer from '@/components/admin/AdminContainer';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 
 interface PublishLog {
   id: string;
   post_queue_id: string | null;
   step: string;
   success: boolean;
   message: string | null;
   duration_ms: number | null;
   raw_response: any;
   created_at: string;
 }
 
 const stepLabels: Record<string, string> = {
   generate_keywords: 'Gerar Keywords',
   generate_outline: 'Gerar Outline',
   generate_content: 'Gerar Conteúdo',
   generate_images: 'Gerar Imagens',
   upload_media: 'Upload Media',
   create_post: 'Criar Post',
   update_post: 'Atualizar Post',
 };
 
 export default function Logs() {
   const { data: logs, isLoading } = useQuery({
     queryKey: ['blog-publish-logs'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('blog_publish_logs')
         .select('*')
         .order('created_at', { ascending: false })
         .limit(100);
       
       if (error) throw error;
       return data as PublishLog[];
     },
   });
   
   return (
    <AdminContainer>
       <PageHeader
         title="Logs de Publicação"
         description="Histórico de execuções do pipeline de geração e publicação"
       />
       
       <Card>
         <CardContent className="p-0">
           {isLoading ? (
             <div className="flex items-center justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
           ) : logs?.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p>Nenhum log encontrado</p>
             </div>
           ) : (
             <Table data-tour="logs-lista">
               <TableHeader>
                 <TableRow>
                   <TableHead>Data/Hora</TableHead>
                   <TableHead>Etapa</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Duração</TableHead>
                   <TableHead>Mensagem</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {logs?.map(log => (
                   <TableRow key={log.id}>
                     <TableCell className="text-sm text-muted-foreground">
                       {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                     </TableCell>
                     <TableCell>
                       <Badge variant="outline">
                         {stepLabels[log.step] || log.step}
                       </Badge>
                     </TableCell>
                      <TableCell data-tour="logs-status">
                        {log.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" data-tour="logs-erro" />
                       )}
                     </TableCell>
                     <TableCell className="text-sm">
                       {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                     </TableCell>
                     <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                       {log.message || '-'}
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
         </CardContent>
       </Card>
    </AdminContainer>
   );
 }