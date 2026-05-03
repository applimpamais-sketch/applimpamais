import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogKeyword {
  id: string;
  cluster: string;
  servico_item: string | null;
  keyword: string;
  funnel_stage: 'topo' | 'meio' | 'fundo';
  intent: 'info' | 'comparativo' | 'transacional' | 'local' | 'question' | 'trending' | null;
  city: string | null;
  bairro: string | null;
  difficulty_score: number;
  opportunity_score: number;
  trend_score?: number;
  competitor_gap_score?: number;
  used: boolean;
  post_id: string | null;
  created_at: string;
  // New fields for import
  source?: string;
  search_volume?: number;
  competition?: string;
  cpc?: number;
  import_batch_id?: string;
}

interface KeywordFilters {
  cluster?: string;
  funnel_stage?: string;
  city?: string;
  bairro?: string;
  used?: boolean;
  search?: string;
  intent?: string;
  source?: string;
  sortBy?: 'opportunity' | 'difficulty' | 'trend' | 'gap' | 'recent' | 'volume';
  minOpportunity?: number;
  maxDifficulty?: number;
}

export function useBlogKeywords(filters?: KeywordFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['blog-keywords', filters],
    enabled,
    retry: false,
    queryFn: async () => {
      let query = supabase
        .from('blog_keywords_bank')
        .select('*')
        .limit(500);
      
      // Apply sorting
      if (filters?.sortBy === 'difficulty') {
        query = query.order('difficulty_score', { ascending: true });
      } else if (filters?.sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (filters?.sortBy === 'volume') {
        query = query.order('search_volume', { ascending: false, nullsFirst: false });
      } else if (filters?.sortBy === 'trend') {
        query = query.order('opportunity_score', { ascending: false });
      } else if (filters?.sortBy === 'gap') {
        query = query.order('opportunity_score', { ascending: false });
      } else {
        query = query.order('opportunity_score', { ascending: false });
      }
      
      if (filters?.cluster) {
        query = query.eq('cluster', filters.cluster);
      }
      if (filters?.funnel_stage) {
        query = query.eq('funnel_stage', filters.funnel_stage);
      }
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.bairro) {
        query = query.ilike('bairro', `%${filters.bairro}%`);
      }
      if (filters?.used !== undefined) {
        query = query.eq('used', filters.used);
      }
      if (filters?.search) {
        query = query.ilike('keyword', `%${filters.search}%`);
      }
      if (filters?.intent) {
        query = query.eq('intent', filters.intent);
      }
      if (filters?.source && filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }
      if (filters?.minOpportunity) {
        query = query.gte('opportunity_score', filters.minOpportunity);
      }
      if (filters?.maxDifficulty) {
        query = query.lte('difficulty_score', filters.maxDifficulty);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as BlogKeyword[];
    },
  });
}

export function useBlogKeywordsCount(enabled: boolean = true) {
  return useQuery({
    queryKey: ['blog-keywords-count'],
    enabled,
    retry: false,
    queryFn: async () => {
      const { count: total } = await supabase
        .from('blog_keywords_bank')
        .select('*', { count: 'exact', head: true });
      
      const { count: used } = await supabase
        .from('blog_keywords_bank')
        .select('*', { count: 'exact', head: true })
        .eq('used', true);
      
      const { count: unused } = await supabase
        .from('blog_keywords_bank')
        .select('*', { count: 'exact', head: true })
        .eq('used', false);
      
      return {
        total: total || 0,
        used: used || 0,
        unused: unused || 0,
      };
    },
  });
}

// Advanced SEO Stats
export function useBlogKeywordsStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['blog-keywords-stats'],
    enabled,
    retry: false,
    queryFn: async () => {
      // Get keywords by city
      const { data: byCity } = await supabase
        .from('blog_keywords_bank')
        .select('city')
        .not('city', 'is', null);
      
      const cityCounts: Record<string, number> = {};
      byCity?.forEach(k => {
        if (k.city) {
          cityCounts[k.city] = (cityCounts[k.city] || 0) + 1;
        }
      });
      
      // Get keywords by funnel
      const { data: byFunnel } = await supabase
        .from('blog_keywords_bank')
        .select('funnel_stage');
      
      const funnelCounts: Record<string, number> = { topo: 0, meio: 0, fundo: 0 };
      byFunnel?.forEach(k => {
        if (k.funnel_stage) {
          funnelCounts[k.funnel_stage] = (funnelCounts[k.funnel_stage] || 0) + 1;
        }
      });
      
      // Get keywords by cluster
      const { data: byCluster } = await supabase
        .from('blog_keywords_bank')
        .select('cluster');
      
      const clusterCounts: Record<string, number> = {};
      byCluster?.forEach(k => {
        if (k.cluster) {
          clusterCounts[k.cluster] = (clusterCounts[k.cluster] || 0) + 1;
        }
      });
      
      // Get keywords by intent
      const { data: byIntent } = await supabase
        .from('blog_keywords_bank')
        .select('intent');
      
      const intentCounts: Record<string, number> = {};
      byIntent?.forEach(k => {
        if (k.intent) {
          intentCounts[k.intent] = (intentCounts[k.intent] || 0) + 1;
        }
      });
      
      // Count with bairro
      const { count: withBairro } = await supabase
        .from('blog_keywords_bank')
        .select('*', { count: 'exact', head: true })
        .not('bairro', 'is', null);
      
      // High opportunity keywords (score >= 80)
      const { count: highOpportunity } = await supabase
        .from('blog_keywords_bank')
        .select('*', { count: 'exact', head: true })
        .gte('opportunity_score', 80)
        .eq('used', false);
      
      // Low difficulty keywords (score <= 30)
      const { count: lowDifficulty } = await supabase
        .from('blog_keywords_bank')
        .select('*', { count: 'exact', head: true })
        .lte('difficulty_score', 30)
        .eq('used', false);
      
      // Question-based keywords (by intent OR by keyword pattern)
      const { count: questionsByIntent } = await supabase
        .from('blog_keywords_bank')
        .select('*', { count: 'exact', head: true })
        .eq('intent', 'question');
      
      // Also count keywords that start with question words
      const { data: allKeywords } = await supabase
        .from('blog_keywords_bank')
        .select('keyword')
        .limit(50000);
      
      const questionPatterns = /^(como|o que|quando|onde|por que|porque|qual|quais|quanto|quantos|quantas|quem|é possível|dá pra|pode|posso|vale|precisa|devo)/i;
      const questionsByPattern = allKeywords?.filter(k => 
        questionPatterns.test(k.keyword) || k.keyword.includes('?')
      ).length || 0;
      
      const questions = Math.max(questionsByIntent || 0, questionsByPattern);
      
      // Local keywords
      const { count: localKeywords } = await supabase
        .from('blog_keywords_bank')
        .select('*', { count: 'exact', head: true })
        .eq('intent', 'local');
      
      // Get average scores
      const { data: scoreData } = await supabase
        .from('blog_keywords_bank')
        .select('opportunity_score, difficulty_score')
        .limit(5000);
      
      const avgOpportunity = scoreData?.length 
        ? Math.round(scoreData.reduce((sum, k) => sum + (k.opportunity_score || 0), 0) / scoreData.length) 
        : 0;
      const avgDifficulty = scoreData?.length 
        ? Math.round(scoreData.reduce((sum, k) => sum + (k.difficulty_score || 0), 0) / scoreData.length) 
        : 0;
      
      return {
        byCity: Object.entries(cityCounts).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count),
        byFunnel: Object.entries(funnelCounts).map(([stage, count]) => ({ stage, count })),
        byCluster: Object.entries(clusterCounts).map(([cluster, count]) => ({ cluster, count })).sort((a, b) => b.count - a.count),
        byIntent: Object.entries(intentCounts).map(([intent, count]) => ({ intent, count })).sort((a, b) => b.count - a.count),
        withBairro: withBairro || 0,
        highOpportunity: highOpportunity || 0,
        lowDifficulty: lowDifficulty || 0,
        questions: questions || 0,
        localKeywords: localKeywords || 0,
        avgOpportunity,
        avgDifficulty,
      };
    },
  });
}

// Get top opportunity keywords
export function useTopOpportunityKeywords(limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: ['blog-keywords-top-opportunity', limit],
    enabled,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_keywords_bank')
        .select('*')
        .eq('used', false)
        .order('opportunity_score', { ascending: false })
        .order('difficulty_score', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data as BlogKeyword[];
    },
  });
}

export function useMarkKeywordUsed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ keywordId, postId }: { keywordId: string; postId?: string }) => {
      const { error } = await supabase
        .from('blog_keywords_bank')
        .update({ used: true, post_id: postId || null })
        .eq('id', keywordId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-keywords'] });
      queryClient.invalidateQueries({ queryKey: ['blog-keywords-count'] });
      queryClient.invalidateQueries({ queryKey: ['blog-keywords-stats'] });
      queryClient.invalidateQueries({ queryKey: ['blog-keywords-top-opportunity'] });
    },
  });
}
