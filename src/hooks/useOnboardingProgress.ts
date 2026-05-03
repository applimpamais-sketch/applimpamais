import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingProgress {
  id: string;
  user_id: string;
  has_seen_welcome: boolean;
  completed_tours: string[];
  visited_screens: string[];
  current_tour: string | null;
  current_step: number;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'rc_admin_onboarding';

// Fallback para localStorage quando não há usuário logado
const getLocalProgress = (): Partial<OnboardingProgress> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const setLocalProgress = (progress: Partial<OnboardingProgress>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    console.error('Erro ao salvar progresso local');
  }
};

export function useOnboardingProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['onboarding-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return getLocalProgress() as OnboardingProgress;
      }

      const { data, error } = await supabase
        .from('admin_onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar progresso:', error);
        return getLocalProgress() as OnboardingProgress;
      }

      if (!data) {
        // Criar registro inicial
        const { data: newData, error: insertError } = await supabase
          .from('admin_onboarding_progress')
          .insert({
            user_id: user.id,
            has_seen_welcome: false,
            completed_tours: [],
            visited_screens: [],
            current_tour: null,
            current_step: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar progresso:', insertError);
          return getLocalProgress() as OnboardingProgress;
        }

        return newData as OnboardingProgress;
      }

      return data as OnboardingProgress;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const updateProgress = useMutation({
    mutationFn: async (updates: Partial<OnboardingProgress>) => {
      if (!user?.id) {
        const current = getLocalProgress();
        const updated = { ...current, ...updates };
        setLocalProgress(updated);
        return updated as OnboardingProgress;
      }

      const { data, error } = await supabase
        .from('admin_onboarding_progress')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as OnboardingProgress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress', user?.id] });
    },
  });

  const markWelcomeSeen = () => {
    updateProgress.mutate({ has_seen_welcome: true });
  };

  const completeTour = (tourId: string) => {
    const currentTours = progress?.completed_tours || [];
    if (!currentTours.includes(tourId)) {
      updateProgress.mutate({
        completed_tours: [...currentTours, tourId],
        current_tour: null,
        current_step: 0,
      });
    }
  };

  const startTour = (tourId: string) => {
    updateProgress.mutate({
      current_tour: tourId,
      current_step: 0,
    });
  };

  const updateStep = (step: number) => {
    updateProgress.mutate({ current_step: step });
  };

  const pauseTour = () => {
    // Mantém o tour atual mas não avança
  };

  const resetOnboarding = () => {
    updateProgress.mutate({
      has_seen_welcome: false,
      completed_tours: [],
      visited_screens: [],
      current_tour: null,
      current_step: 0,
    });
  };

  const markScreenVisited = (route: string) => {
    const currentScreens = progress?.visited_screens || [];
    if (!currentScreens.includes(route)) {
      updateProgress.mutate({
        visited_screens: [...currentScreens, route],
      });
    }
  };

  const isScreenVisited = (route: string): boolean => {
    return (progress?.visited_screens || []).includes(route);
  };

  return {
    progress,
    isLoading,
    markWelcomeSeen,
    completeTour,
    startTour,
    updateStep,
    pauseTour,
    resetOnboarding,
    markScreenVisited,
    isScreenVisited,
    visitedScreens: progress?.visited_screens || [],
  };
}
