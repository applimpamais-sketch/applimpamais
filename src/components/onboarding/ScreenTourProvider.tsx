import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useOnboarding } from './OnboardingProvider';
import { getScreenTourByRoute } from '@/utils/screenTours';

interface ScreenTourProviderProps {
  children: React.ReactNode;
}

/**
 * Provider que detecta mudanças de rota e inicia tours contextuais
 * automaticamente na primeira visita a cada tela
 */
export default function ScreenTourProvider({ children }: ScreenTourProviderProps) {
  const location = useLocation();
  const { 
    state, 
    startScreenTour, 
    isScreenVisited, 
    markScreenVisited 
  } = useOnboarding();
  
  const lastCheckedRoute = useRef<string>('');

  const checkAndStartTour = useCallback(() => {
    const currentPath = location.pathname;
    
    // Evita verificar a mesma rota múltiplas vezes
    if (lastCheckedRoute.current === currentPath) {
      return;
    }
    lastCheckedRoute.current = currentPath;

    // Não inicia tour se já está em um tour ativo
    if (state.currentTour) {
      return;
    }

    // Não inicia tour se o modal de boas-vindas ainda não foi visto
    if (!state.hasSeenWelcome) {
      return;
    }

    // Verifica se existe um tour para esta rota
    const screenTour = getScreenTourByRoute(currentPath);
    if (!screenTour) {
      return;
    }

    // Verifica se a tela já foi visitada
    if (isScreenVisited(currentPath)) {
      return;
    }

    // Aguarda um pouco para a página renderizar antes de iniciar o tour
    const timeoutId = setTimeout(() => {
      // Verifica novamente se ainda não está em um tour
      if (!state.currentTour) {
        markScreenVisited(currentPath);
        startScreenTour(screenTour.id);
      }
    }, 800); // Delay para garantir que elementos estejam renderizados

    return () => clearTimeout(timeoutId);
  }, [
    location.pathname, 
    state.currentTour, 
    state.hasSeenWelcome, 
    isScreenVisited, 
    markScreenVisited, 
    startScreenTour
  ]);

  useEffect(() => {
    checkAndStartTour();
  }, [checkAndStartTour]);

  return <>{children}</>;
}
