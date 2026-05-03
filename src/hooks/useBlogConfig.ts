 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
 export interface BlogConfigItem {
   id: string;
   key: string;
   value: any;
   description: string | null;
   updated_at: string;
   updated_by: string | null;
 }
 
 export function useBlogConfig() {
   return useQuery({
     queryKey: ['blog-config'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('blog_config')
         .select('*')
         .order('key');
       
       if (error) throw error;
       
       // Transform to key-value map
       const configMap: Record<string, any> = {};
      (data || []).forEach(item => {
         configMap[item.key] = item.value;
       });
       
      return { items: (data || []) as BlogConfigItem[], map: configMap };
     },
   });
 }
 
 export function useUpdateBlogConfig() {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async ({ key, value }: { key: string; value: any }) => {
     // First try to update existing record
     const { data: existing } = await supabase
         .from('blog_config')
       .select('id')
       .eq('key', key)
       .maybeSingle();
       
     if (existing) {
       // Update existing record
       const { error } = await supabase
         .from('blog_config')
         .update({ value, updated_at: new Date().toISOString() })
         .eq('key', key);
       
       if (error) throw error;
     } else {
       // Insert new record
       const { error } = await supabase
         .from('blog_config')
         .insert({ key, value, updated_at: new Date().toISOString() });
       
       if (error) throw error;
     }
     },
     onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-config'], refetchType: 'active' });
     },
   });
 }