 import { useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 interface GeneratePostParams {
   cluster: string;
   servico_item?: string;
   objective: 'topo' | 'meio' | 'fundo';
   region_city?: string;
   region_bairro?: string;
   keyword: string;
   keyword_id?: string;
 }
 
 export function useBlogGeneration() {
   const queryClient = useQueryClient();
   
   const generateContent = useMutation({
     mutationFn: async (params: GeneratePostParams) => {
       const { data, error } = await supabase.functions.invoke('blog-generate-content', {
         body: params,
       });
       
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
       queryClient.invalidateQueries({ queryKey: ['blog-posts-stats'] });
       // Toast removido - será exibido um resumo final no componente
     },
     onError: (error: Error) => {
       // Log apenas - toast será tratado no componente
       console.error('Erro ao gerar post:', error.message);
     },
   });
   
   const seedKeywords = useMutation({
     mutationFn: async (cluster?: string) => {
       const { data, error } = await supabase.functions.invoke('blog-seed-keywords', {
         body: { cluster },
       });
       
       if (error) throw error;
       return data;
     },
      onSuccess: (data) => {
        // Invalidar todas as queries relacionadas a keywords para forçar atualização
        queryClient.invalidateQueries({ queryKey: ['blog-keywords'] });
        queryClient.invalidateQueries({ queryKey: ['blog-keywords-count'] });
        queryClient.invalidateQueries({ queryKey: ['blog-keywords-stats'] });
        queryClient.invalidateQueries({ queryKey: ['blog-keywords-top-opportunity'] });
        toast.success(`${data.inserted || 0} keywords geradas!`);
      },
      onError: (error: Error) => {
        toast.error(`Erro ao gerar keywords: ${error.message}`);
      },
    });
   
  
   const publishToWordPress = useMutation({
     mutationFn: async (postId: string) => {
       const { data, error } = await supabase.functions.invoke('blog-publish-wordpress', {
         body: { post_id: postId },
       });
       
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
       toast.success('Post publicado no WordPress!');
     },
     onError: (error: Error) => {
       toast.error(`Erro ao publicar: ${error.message}`);
     },
   });
   
  // Direct publish to WordPress (no image processing)
  const processAndPublish = useMutation({
    mutationFn: async (postId: string) => {
      toast.info('Publicando no WordPress...');
      const { data, error } = await supabase.functions.invoke('blog-publish-wordpress', {
        body: { post_id: postId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Post publicado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
  
  return {
    generateContent,
    seedKeywords,
    publishToWordPress,
    processAndPublish,
    isGenerating: generateContent.isPending,
    isSeeding: seedKeywords.isPending,
    isPublishing: publishToWordPress.isPending,
    isProcessingAndPublishing: processAndPublish.isPending,
  };
}