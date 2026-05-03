import { motion } from 'framer-motion';
import { Navigation, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingProgressBarProps {
  status: 'em_rota' | 'chegou' | 'servico_em_andamento' | 'concluido' | 'cancelado';
}

// Simplificado para 2 etapas - cliente só precisa saber se técnico está vindo ou chegou
const steps = [
  { key: 'em_rota', label: 'A caminho', icon: Navigation },
  { key: 'chegou', label: 'Chegou', icon: MapPin },
];

const getStepIndex = (status: string): number => {
  // Mapear status internos para as 2 etapas visíveis
  if (status === 'em_rota') return 0;
  // Chegou, em serviço ou concluído = chegou
  return 1;
};

export default function TrackingProgressBar({ status }: TrackingProgressBarProps) {
  const currentIndex = getStepIndex(status);

  if (status === 'cancelado') {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600 dark:text-red-400">
        <span className="text-sm font-medium">Serviço cancelado</span>
      </div>
    );
  }

  return (
    <div className="relative py-4 px-4">
      {/* Background track */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-muted/50 rounded-full mx-16" />
      
      {/* Progress fill */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-16"
        initial={{ width: '0%' }}
        animate={{ width: currentIndex === 0 ? '0%' : '100%' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      
      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = step.icon;
          
          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <motion.div
                className={cn(
                  'relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-muted text-muted-foreground'
                )}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <StepIcon className={cn('h-6 w-6', isCurrent && 'animate-pulse')} />
                
                {/* Pulse ring for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-blue-500"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>
              
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
