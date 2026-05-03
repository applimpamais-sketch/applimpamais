import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface BlogPost {
  id: string;
  cluster: string;
  servico_item: string | null;
  objective: string;
  region_city: string | null;
  region_bairro: string | null;
  seed_keyword: string;
  chosen_keyword: string;
  secondary_keywords: Json | null;
  title: string | null;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  content_html: string | null;
  faqs_json: Json | null;
  faq_schema_jsonld: string | null;
  internal_links: Json | null;
  cta_type: string | null;
  cta_link: string | null;
  images: Json | null;
  word_count: number | null;
  seo_score: number | null;
  difficulty_estimate: string | null;
  status: string;
  wp_post_id: number | null;
  wp_post_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  created_by: string | null;
}
 
 interface PostFilters {
   status?: string;
   cluster?: string;
   objective?: string;
 }
 
 export function useBlogPosts(filters?: PostFilters, enabled: boolean = true) {
   return useQuery({
     queryKey: ['blog-posts', filters],
     enabled,
     retry: false,
     queryFn: async () => {
       let query = supabase
         .from('blog_posts_queue')
         .select('*')
         .order('created_at', { ascending: false });
       
       if (filters?.status) {
         query = query.eq('status', filters.status);
       }
       if (filters?.cluster) {
         query = query.eq('cluster', filters.cluster);
       }
       if (filters?.objective) {
         query = query.eq('objective', filters.objective);
       }
       
       const { data, error } = await query;
       if (error) throw error;
       return data as BlogPost[];
     },
   });
 }
 
 export function useBlogPostsStats(enabled: boolean = true) {
   return useQuery({
     queryKey: ['blog-posts-stats'],
     enabled,
     retry: false,
     queryFn: async () => {
       const { data, error } = await supabase
         .from('blog_posts_queue')
         .select('status, seo_score, cluster');
       
       if (error) throw error;
       
       const stats = {
         total: data.length,
         queued: data.filter(p => p.status === 'queued').length,
         generating: data.filter(p => p.status === 'generating').length,
         generated: data.filter(p => p.status === 'generated').length,
         reviewed: data.filter(p => p.status === 'reviewed').length,
         ready: data.filter(p => p.status === 'ready').length,
         published: data.filter(p => p.status === 'published').length,
         failed: data.filter(p => p.status === 'failed').length,
         avgScore: data.length > 0 
           ? Math.round(data.reduce((acc, p) => acc + (p.seo_score || 0), 0) / data.length) 
           : 0,
         byCluster: Object.entries(
           data.reduce((acc, p) => {
             acc[p.cluster] = (acc[p.cluster] || 0) + 1;
             return acc;
           }, {} as Record<string, number>)
         ).map(([cluster, count]) => ({ cluster, count })),
       };
       
       return stats;
     },
   });
 }
 
 export function useUpdateBlogPost() {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
       const { error } = await supabase
         .from('blog_posts_queue')
         .update(updates)
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
       queryClient.invalidateQueries({ queryKey: ['blog-posts-stats'] });
     },
   });
 }
 
 export function useDeleteBlogPost() {
   const queryClient = useQueryClient();
   
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from('blog_posts_queue')
         .delete()
         .eq('id', id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
       queryClient.invalidateQueries({ queryKey: ['blog-posts-stats'] });
     },
   });
 }