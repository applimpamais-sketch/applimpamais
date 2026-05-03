import { useState, useEffect } from 'react';
 import { useAuth } from '@/hooks/useAuth';
 import AdminContainer from '@/components/admin/AdminContainer';
 import PageHeader from '@/components/admin/PageHeader';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
 import { useBlogKeywords } from '@/hooks/useBlogKeywords';
 import { useBlogGeneration } from '@/hooks/useBlogGeneration';
 import { CLUSTERS, FUNNEL_STAGES, SERVICOS_POR_CLUSTER, CIDADES_ATENDIDAS } from '@/data/blog-templates';
 import { Loader2, Wand2, Search, CheckCircle2 } from 'lucide-react';
 import { toast } from 'sonner';
 
interface GenerationProgress {
  current: number;
  total: number;
  currentKeyword: string;
}

 export default function GerarPosts() {
   const { user, loading: authLoading } = useAuth();
   const [cluster, setCluster] = useState<string>('');
   const [servico, setServico] = useState<string>('');
   const [cidade, setCidade] = useState<string>('');
   const [funnelStage, setFunnelStage] = useState<string>('');
   const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({ current: 0, total: 0, currentKeyword: '' });
   
  const { data: keywords, isLoading, refetch, error } = useBlogKeywords({
     cluster: cluster && cluster !== 'all' ? cluster : undefined,
     funnel_stage: funnelStage && funnelStage !== 'all' ? funnelStage : undefined,
     city: cidade && cidade !== 'all' ? cidade : undefined,
     used: false,
   }, !!user);
   
  const { generateContent } = useBlogGeneration();
   
  // Mostrar erro se a query falhar
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar keywords:', error);
      toast.error('Erro ao carregar keywords. Verifique suas permissões.');
    }
  }, [error]);
  
   const availableServicos = cluster ? SERVICOS_POR_CLUSTER[cluster] || [] : [];
   
   const toggleKeyword = (id: string) => {
     const newSelected = new Set(selectedKeywords);
     if (newSelected.has(id)) {
       newSelected.delete(id);
     } else {
       newSelected.add(id);
     }
     setSelectedKeywords(newSelected);
   };
   
   const selectTop = (n: number) => {
     const topKeywords = (keywords || []).slice(0, n);
     setSelectedKeywords(new Set(topKeywords.map(k => k.id)));
   };
   
   const handleGenerate = async () => {
     if (selectedKeywords.size === 0) {
       toast.error('Selecione pelo menos uma keyword');
       return;
     }
     
    const keywordsToGenerate = (keywords || []).filter(k => selectedKeywords.has(k.id));
    const total = keywordsToGenerate.length;
    
    setIsProcessing(true);
    setProgress({ current: 0, total, currentKeyword: '' });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < keywordsToGenerate.length; i++) {
      const keyword = keywordsToGenerate[i];
      setProgress({ current: i + 1, total, currentKeyword: keyword.keyword });
      
      try {
        await generateContent.mutateAsync({
          cluster: keyword.cluster,
          servico_item: keyword.servico_item || undefined,
          objective: keyword.funnel_stage,
          region_city: keyword.city || undefined,
          region_bairro: keyword.bairro || undefined,
          keyword: keyword.keyword,
          keyword_id: keyword.id,
        });
        
        // Remover keyword da seleção conforme é processada
        setSelectedKeywords(prev => {
          const next = new Set(prev);
          next.delete(keyword.id);
          return next;
        });
        
        successCount++;
      } catch (error) {
        console.error('Erro ao gerar post:', error);
        errorCount++;
       }
    }
    
    setIsProcessing(false);
    setProgress({ current: 0, total: 0, currentKeyword: '' });
    
    // Toast final com resumo
    if (successCount > 0 && errorCount === 0) {
      toast.success(`${successCount} posts gerados com sucesso!`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} posts gerados, ${errorCount} erros`);
    } else if (errorCount > 0) {
      toast.error(`Falha ao gerar ${errorCount} posts`);
     }
    
    refetch();
   };
   
   const getDifficultyColor = (score: number) => {
     if (score <= 33) return 'bg-green-500';
     if (score <= 66) return 'bg-yellow-500';
     return 'bg-red-500';
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
         title="Gerar Posts"
         description="Selecione keywords e gere conteúdo otimizado em lote"
       />
       
       {/* Filtros */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg">Filtros</CardTitle>
         </CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="space-y-2">
             <Label>Cluster</Label>
             <Select value={cluster} onValueChange={setCluster}>
               <SelectTrigger>
                 <SelectValue placeholder="Todos" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Todos</SelectItem>
                 {CLUSTERS.map(c => (
                   <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           
           <div className="space-y-2">
             <Label>Serviço</Label>
             <Select value={servico} onValueChange={setServico} disabled={!cluster}>
               <SelectTrigger>
                 <SelectValue placeholder="Todos" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Todos</SelectItem>
                 {availableServicos.map(s => (
                   <SelectItem key={s} value={s}>{s}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           
           <div className="space-y-2">
             <Label>Cidade</Label>
             <Select value={cidade} onValueChange={setCidade}>
               <SelectTrigger>
                 <SelectValue placeholder="Todas" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Todas</SelectItem>
                 {CIDADES_ATENDIDAS.map(c => (
                   <SelectItem key={c} value={c}>{c}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           
           <div className="space-y-2">
             <Label>Funil</Label>
             <Select value={funnelStage} onValueChange={setFunnelStage}>
               <SelectTrigger>
                 <SelectValue placeholder="Todos" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Todos</SelectItem>
                 {FUNNEL_STAGES.map(f => (
                   <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
         </CardContent>
       </Card>
       
       {/* Keywords Disponíveis */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between">
           <div>
             <CardTitle className="text-lg">Keywords Disponíveis</CardTitle>
             <p className="text-sm text-muted-foreground mt-1">
               {keywords?.length || 0} keywords encontradas • {selectedKeywords.size} selecionadas
             </p>
           </div>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={() => selectTop(5)}>
               Top 5
             </Button>
             <Button variant="outline" size="sm" onClick={() => selectTop(10)}>
               Top 10
             </Button>
             <Button 
               onClick={handleGenerate} 
              disabled={selectedKeywords.size === 0 || isProcessing}
             >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando {progress.current}/{progress.total}...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Gerar {selectedKeywords.size} Posts
                </>
              )}
             </Button>
           </div>
         </CardHeader>
         <CardContent>
          {isProcessing && (
            <div className="mb-4 space-y-2">
              <Progress value={(progress.current / progress.total) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Processando: {progress.currentKeyword}
              </p>
            </div>
          )}
           {isLoading ? (
             <div className="flex items-center justify-center py-8">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
           ) : keywords?.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p>Nenhuma keyword disponível.</p>
               <p className="text-sm">Gere keywords no Dashboard primeiro.</p>
             </div>
           ) : (
             <div className="space-y-2 max-h-[500px] overflow-y-auto">
               {keywords?.map(keyword => (
                 <div 
                   key={keyword.id}
                   className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                     selectedKeywords.has(keyword.id) ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                   }`}
                   onClick={() => toggleKeyword(keyword.id)}
                 >
                   <Checkbox 
                     checked={selectedKeywords.has(keyword.id)}
                     onCheckedChange={() => toggleKeyword(keyword.id)}
                   />
                   <div className="flex-1">
                     <p className="font-medium">{keyword.keyword}</p>
                     <div className="flex items-center gap-2 mt-1">
                       <Badge variant="outline" className="text-xs">{keyword.cluster}</Badge>
                       <Badge variant="secondary" className="text-xs">{keyword.funnel_stage}</Badge>
                       {keyword.city && (
                         <Badge variant="outline" className="text-xs">{keyword.city}</Badge>
                       )}
                     </div>
                   </div>
                   <div className="flex items-center gap-4 text-sm">
                     <div className="text-center">
                     <div className={`w-8 h-2 rounded-full ${getDifficultyColor(keyword.difficulty_score)}`} title={`Dificuldade: ${keyword.difficulty_score}`} />
                       <span className="text-xs text-muted-foreground">Dif.</span>
                     </div>
                     <div className="text-center">
                       <span className="font-bold text-primary">{keyword.opportunity_score}</span>
                       <p className="text-xs text-muted-foreground">Score</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>
    </AdminContainer>
   );
 }