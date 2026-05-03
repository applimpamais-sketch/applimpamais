import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw,
  GraduationCap,
  LayoutDashboard,
  CalendarDays,
  Users,
  DollarSign,
  Megaphone,
  BarChart3,
  Plug,
  X
} from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { ONBOARDING_TOURS } from '@/utils/onboardingTours';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CalendarDays,
  Users,
  DollarSign,
  Megaphone,
  BarChart3,
  Plug,
};

export default function OnboardingChecklist() {
  const isMobile = useIsMobile();
  const { state, startTour, resetOnboarding, getProgress } = useOnboarding();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const progress = getProgress();
  const progressPercent = (progress.completed / progress.total) * 100;
  const isComplete = progress.completed === progress.total;

  // Não exibir em dispositivos móveis
  if (isMobile) {
    return null;
  }

  // Esconder se todos os tours foram completados e está minimizado
  if (!isVisible) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              onClick={() => setIsVisible(true)}
            >
              <GraduationCap className="h-6 w-6" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Abrir Treinamento</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 w-80"
    >
      <div className="bg-background border rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Treinamento</p>
              <p className="text-xs text-muted-foreground">
                {progress.completed}/{progress.total} completos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2 max-h-80 overflow-y-auto">
                {ONBOARDING_TOURS.map((tour) => {
                  const Icon = iconMap[tour.icon] || Circle;
                  const isCompleted = state.completedTours.includes(tour.id);
                  const isActive = state.currentTour === tour.id;

                  return (
                    <button
                      key={tour.id}
                      onClick={() => !isActive && startTour(tour.id)}
                      disabled={isActive}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                        isCompleted && "bg-green-50 dark:bg-green-950/20",
                        isActive && "bg-primary/10 ring-2 ring-primary",
                        !isCompleted && !isActive && "hover:bg-accent/50"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        isCompleted ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium text-sm truncate",
                          isCompleted && "text-green-700 dark:text-green-400"
                        )}>
                          {tour.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tour.estimatedTime}
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Ativo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="border-t p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={resetOnboarding}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reiniciar Treinamento
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebration when complete */}
        {isComplete && !isExpanded && (
          <div className="px-4 pb-3">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center">
              ✨ Treinamento concluído! Parabéns!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
