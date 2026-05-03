import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenantContext } from './useTenantContext';

export interface AvaliacoesConfig {
  google_reviews_url: string;
  facebook_reviews_url: string;
  nota_minima_review: number;
  mensagem_pedido_nota: string;
  mensagem_nota_alta: string;
  mensagem_nota_baixa: string;
}

export interface Feedback {
  id: string;
  telefone: string;
  nome_cliente: string | null;
  nota_geral: number | null;
  comentario_positivo: string | null;
  comentario_negativo: string | null;
  sugestao_melhoria: string | null;
  created_at: string | null;
  agendamento_id: string | null;
}

interface FeedbackStats {
  total: number;
  media: number;
  positivos: number;
  negativos: number;
}

const DEFAULT_CONFIG: AvaliacoesConfig = {
  google_reviews_url: '',
  facebook_reviews_url: '',
  nota_minima_review: 8,
  mensagem_pedido_nota: 'De 0 a 10, como você avalia nosso serviço?',
  mensagem_nota_alta: 'Ficamos muito felizes! 🎉 Deixe sua avaliação pública aqui: {link}',
  mensagem_nota_baixa: 'Lamentamos que sua experiência não tenha sido perfeita. O que podemos melhorar?'
};

export function useAvaliacoesConfig() {
  const [config, setConfig] = useState<AvaliacoesConfig>(DEFAULT_CONFIG);
  const [sistemaAtivo, setSistemaAtivo] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({ total: 0, media: 0, positivos: 0, negativos: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [integracaoId, setIntegracaoId] = useState<string | null>(null);
  const { toast } = useToast();
  const { tenantId } = useTenantContext();

  const loadConfig = useCallback(async () => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('integracoes' as any)
        .select('*')
        .eq('tipo', 'avaliacoes')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIntegracaoId(data.id);
        setSistemaAtivo(data.status === 'ativo');
        const configData = data.configuracao as Record<string, unknown>;
        setConfig({
          google_reviews_url: (configData?.google_reviews_url as string) || DEFAULT_CONFIG.google_reviews_url,
          facebook_reviews_url: (configData?.facebook_reviews_url as string) || DEFAULT_CONFIG.facebook_reviews_url,
          nota_minima_review: (configData?.nota_minima_review as number) || DEFAULT_CONFIG.nota_minima_review,
          mensagem_pedido_nota: (configData?.mensagem_pedido_nota as string) || DEFAULT_CONFIG.mensagem_pedido_nota,
          mensagem_nota_alta: (configData?.mensagem_nota_alta as string) || DEFAULT_CONFIG.mensagem_nota_alta,
          mensagem_nota_baixa: (configData?.mensagem_nota_baixa as string) || DEFAULT_CONFIG.mensagem_nota_baixa,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive'
      });
    }
  }, [tenantId, toast]);

  const loadFeedbacks = useCallback(async () => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('soft_launch_feedback')
        .select('*, agendamentos!inner(tenant_id)')
        .eq('agendamentos.tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedbacks(data || []);

      // Calcular estatísticas
      const feedbacksComNota = (data || []).filter(f => f.nota_geral !== null);
      const total = feedbacksComNota.length;
      const soma = feedbacksComNota.reduce((acc, f) => acc + (f.nota_geral || 0), 0);
      const media = total > 0 ? soma / total : 0;
      const positivos = feedbacksComNota.filter(f => (f.nota_geral || 0) >= config.nota_minima_review).length;
      const negativos = feedbacksComNota.filter(f => (f.nota_geral || 0) < config.nota_minima_review).length;

      setStats({ total, media, positivos, negativos });
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os feedbacks.',
        variant: 'destructive'
      });
    }
  }, [config.nota_minima_review, tenantId, toast]);

  const saveConfig = useCallback(async (newConfig: AvaliacoesConfig, ativo: boolean) => {
    if (!tenantId) {
      toast({
        title: 'Tenant não identificado',
        description: 'Não foi possível salvar sem tenant ativo.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const configJson = {
        google_reviews_url: newConfig.google_reviews_url,
        facebook_reviews_url: newConfig.facebook_reviews_url,
        nota_minima_review: newConfig.nota_minima_review,
        mensagem_pedido_nota: newConfig.mensagem_pedido_nota,
        mensagem_nota_alta: newConfig.mensagem_nota_alta,
        mensagem_nota_baixa: newConfig.mensagem_nota_baixa,
      };

      if (integracaoId) {
        const { error } = await supabase
          .from('integracoes' as any)
          .update({
            configuracao: configJson,
            status: ativo ? 'ativo' : 'inativo',
            atualizado_em: new Date().toISOString()
          })
          .eq('id', integracaoId)
          .eq('tenant_id', tenantId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('integracoes' as any)
          .insert({
            tenant_id: tenantId,
            tipo: 'avaliacoes',
            nome: 'Configuração de Avaliações',
            configuracao: { ...configJson, tenant_id: tenantId },
            status: ativo ? 'ativo' : 'inativo'
          })
          .select()
          .single();

        if (error) throw error;
        setIntegracaoId(data.id);
      }

      setConfig(newConfig);
      setSistemaAtivo(ativo);

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [integracaoId, tenantId, toast]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadConfig();
      await loadFeedbacks();
      setIsLoading(false);
    };
    if (!tenantId) {
      setIsLoading(false);
      return;
    }
    load();
  }, [loadConfig, loadFeedbacks, tenantId]);

  // Recalcular stats quando threshold mudar
  useEffect(() => {
    const feedbacksComNota = feedbacks.filter(f => f.nota_geral !== null);
    const positivos = feedbacksComNota.filter(f => (f.nota_geral || 0) >= config.nota_minima_review).length;
    const negativos = feedbacksComNota.filter(f => (f.nota_geral || 0) < config.nota_minima_review).length;
    setStats(prev => ({ ...prev, positivos, negativos }));
  }, [config.nota_minima_review, feedbacks]);

  return {
    config,
    sistemaAtivo,
    feedbacks,
    stats,
    isLoading,
    isSaving,
    saveConfig,
    refreshFeedbacks: loadFeedbacks
  };
}
