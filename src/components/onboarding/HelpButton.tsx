import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { getScreenTourByRoute } from '@/utils/screenTours';
import { getTourById } from '@/utils/onboardingTours';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HelpButtonProps {
  className?: string;
}

/**
 * Botão de ajuda contextual que inicia o tour da tela atual
 */
export default function HelpButton({ className }: HelpButtonProps) {
  const location = useLocation();
  const { startTour, startScreenTour, state } = useOnboarding();
  
  // Verifica se existe um tour de tela para a rota atual
  const screenTour = getScreenTourByRoute(location.pathname);
  
  // Também verifica tours de módulo (os originais do ONBOARDING_TOURS)
  const moduleTour = getTourById(location.pathname.split('/').pop() || '');
  
  // Usa o tour de tela se existir, senão usa o de módulo
  const availableTour = screenTour || moduleTour;
  
  // Não renderiza se não houver tour disponível ou se já está em um tour
  if (!availableTour || state.currentTour) {
    return null;
  }

  const handleClick = () => {
    if (screenTour) {
      startScreenTour(screenTour.id);
    } else if (moduleTour) {
      startTour(moduleTour.id);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={className}
            onClick={handleClick}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ajuda nesta tela</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Iniciar tour guiado desta tela</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
