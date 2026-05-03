import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OnboardingContextType, OnboardingState, Tour, TourStep as TourStepType } from '@/types/onboarding';
import { ONBOARDING_TOURS, getTourById } from '@/utils/onboardingTours';
import { getScreenTourById } from '@/utils/screenTours';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import OnboardingWelcomeModal from './OnboardingWelcomeModal';
import OnboardingChecklist from './OnboardingChecklist';
import TourStepComponent from './TourStep';
import ScreenTourProvider from './ScreenTourProvider';

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export default function OnboardingProvider({ children }: OnboardingProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    progress,
    isLoading,
    markWelcomeSeen: markWelcomeSeenApi,
    completeTour: completeTourApi,
    startTour: startTourApi,
    updateStep,
    resetOnboarding: resetOnboardingApi,
    markScreenVisited: markScreenVisitedApi,
    isScreenVisited: isScreenVisitedApi,
    visitedScreens,
  } = useOnboardingProgress();

  const [state, setState] = useState<OnboardingState>({
    hasSeenWelcome: true,
    completedTours: [],
    currentTour: null,
    currentStep: 0,
    isPaused: false,
  });

  // Sincronizar estado com o banco
  useEffect(() => {
    if (progress) {
      setState({
        hasSeenWelcome: progress.has_seen_welcome ?? true,
        completedTours: progress.completed_tours ?? [],
        currentTour: progress.current_tour ?? null,
        currentStep: progress.current_step ?? 0,
        isPaused: false,
      });
    }
  }, [progress]);

  const getCurrentTour = useCallback((): Tour | null => {
    if (!state.currentTour) return null;
    // Tenta buscar primeiro nos tours de módulo, depois nos tours de tela
    return getTourById(state.currentTour) || getScreenTourById(state.currentTour) || null;
  }, [state.currentTour]);

  const getCurrentStep = useCallback((): TourStepType | null => {
    const tour = getCurrentTour();
    if (!tour) return null;
    return tour.steps[state.currentStep] || null;
  }, [getCurrentTour, state.currentStep]);

  const startTour = useCallback((tourId: string) => {
    const tour = getTourById(tourId);
    if (!tour) return;

    // Navegar para a rota do tour se necessário
    if (location.pathname !== tour.requiredRoute) {
      navigate(tour.requiredRoute);
    }

    setState(prev => ({
      ...prev,
      currentTour: tourId,
      currentStep: 0,
      isPaused: false,
    }));
    startTourApi(tourId);
  }, [location.pathname, navigate, startTourApi]);

  // Função para iniciar tour de tela (não navega, apenas inicia)
  const startScreenTour = useCallback((tourId: string) => {
    const tour = getScreenTourById(tourId);
    if (!tour) return;

    setState(prev => ({
      ...prev,
      currentTour: tourId,
      currentStep: 0,
      isPaused: false,
    }));
  }, []);

  // Wrapper functions for screen visited
  const isScreenVisited = useCallback((route: string): boolean => {
    return isScreenVisitedApi(route);
  }, [isScreenVisitedApi]);

  const markScreenVisited = useCallback((route: string) => {
    markScreenVisitedApi(route);
  }, [markScreenVisitedApi]);

  const nextStep = useCallback(() => {
    const tour = getCurrentTour();
    if (!tour) return;

    const nextStepIndex = state.currentStep + 1;
    
    if (nextStepIndex >= tour.steps.length) {
      // Tour concluído
      completeTourApi(tour.id);
      setState(prev => ({
        ...prev,
        completedTours: [...prev.completedTours, tour.id],
        currentTour: null,
        currentStep: 0,
      }));
    } else {
      // Próximo passo
      const nextStepData = tour.steps[nextStepIndex];
      
      // Navegar se necessário
      if (nextStepData.nextRoute && location.pathname !== nextStepData.nextRoute) {
        navigate(nextStepData.nextRoute);
      }
      
      setState(prev => ({
        ...prev,
        currentStep: nextStepIndex,
      }));
      updateStep(nextStepIndex);
    }
  }, [getCurrentTour, state.currentStep, completeTourApi, location.pathname, navigate, updateStep]);

  const previousStep = useCallback(() => {
    if (state.currentStep > 0) {
      const prevStepIndex = state.currentStep - 1;
      setState(prev => ({
        ...prev,
        currentStep: prevStepIndex,
      }));
      updateStep(prevStepIndex);
    }
  }, [state.currentStep, updateStep]);

  const skipTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTour: null,
      currentStep: 0,
      isPaused: false,
    }));
  }, []);

  const pauseTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  const resumeTour = useCallback((tourId: string) => {
    setState(prev => ({
      ...prev,
      currentTour: tourId,
      isPaused: false,
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    resetOnboardingApi();
    setState({
      hasSeenWelcome: false,
      completedTours: [],
      currentTour: null,
      currentStep: 0,
      isPaused: false,
    });
  }, [resetOnboardingApi]);

  const markWelcomeSeen = useCallback(() => {
    markWelcomeSeenApi();
    setState(prev => ({
      ...prev,
      hasSeenWelcome: true,
    }));
  }, [markWelcomeSeenApi]);

  const getProgress = useCallback(() => ({
    completed: state.completedTours.length,
    total: ONBOARDING_TOURS.length,
  }), [state.completedTours.length]);

  const value: OnboardingContextType = {
    state,
    isLoading,
    startTour,
    startScreenTour,
    nextStep,
    previousStep,
    skipTour,
    pauseTour,
    resumeTour,
    resetOnboarding,
    markWelcomeSeen,
    getCurrentTour,
    getCurrentStep,
    getProgress,
    isScreenVisited,
    markScreenVisited,
    visitedScreens,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      
      {/* Modal de Boas-vindas */}
      {!state.hasSeenWelcome && !isLoading && (
        <OnboardingWelcomeModal />
      )}
      
      {/* Tour ativo */}
      {state.currentTour && !state.isPaused && (
        <TourStepComponent />
      )}
      
      {/* Checklist flutuante */}
      {state.hasSeenWelcome && (
        <OnboardingChecklist />
      )}
    </OnboardingContext.Provider>
  );
}
