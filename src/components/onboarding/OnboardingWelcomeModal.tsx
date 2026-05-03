import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  DollarSign, 
  Megaphone, 
  BarChart3, 
  Plug,
  Sparkles,
  Rocket,
  Clock
} from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { ONBOARDING_TOURS } from '@/utils/onboardingTours';
import { useTenantContext } from '@/hooks/useTenantContext';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CalendarDays,
  Users,
  DollarSign,
  Megaphone,
  BarChart3,
  Plug,
};

export default function OnboardingWelcomeModal() {
  const { startTour, markWelcomeSeen, state } = useOnboarding();
  const { tenant } = useTenantContext();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Nome da empresa dinâmico
  const empresaNome = tenant?.nome_fantasia || tenant?.nome_empresa || 'sua plataforma';

  const handleStartTour = () => {
    markWelcomeSeen();
    startTour('dashboard');
  };

  const handleSkip = () => {
    markWelcomeSeen();
  };

  return (
    <Dialog open={!state.hasSeenWelcome} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-4 relative"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Rocket className="h-10 w-10 text-primary-foreground" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2"
            >
              <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1" />
            </motion.div>
          </motion.div>
          
          <DialogTitle className="text-2xl font-bold">
            Bem-vindo à {empresaNome}! 🎉
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Vamos fazer um tour rápido pelo sistema para você conhecer todas as funcionalidades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Tours Disponíveis
          </h4>
          
          <div className="grid gap-3">
            {ONBOARDING_TOURS.map((tour, index) => {
              const Icon = iconMap[tour.icon] || LayoutDashboard;
              
              return (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tour.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{tour.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {tour.estimatedTime}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <Checkbox
            id="dont-show"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
          />
          <label
            htmlFor="dont-show"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Não mostrar novamente
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSkip}
          >
            Pular, já conheço o sistema
          </Button>
          <Button
            className="flex-1"
            onClick={handleStartTour}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Começar Tour
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
