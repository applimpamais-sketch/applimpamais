import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TourPosition } from '@/types/onboarding';
import { cn } from '@/lib/utils';

interface TourTooltipProps {
  targetSelector: string;
  title: string;
  content: string;
  position: TourPosition;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function TourTooltip({
  targetSelector,
  title,
  content,
  position,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  isFirstStep,
  isLastStep,
}: TourTooltipProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      const tooltip = tooltipRef.current;
      
      if (!element || !tooltip) return;

      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const padding = 16;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - tooltipRect.height - padding;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = rect.bottom + padding;
          left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.left - tooltipRect.width - padding;
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
          left = rect.right + padding;
          break;
      }

      // Garantir que não saia da tela
      const maxLeft = window.innerWidth - tooltipRect.width - 16;
      const maxTop = window.innerHeight - tooltipRect.height - 16;

      left = Math.max(16, Math.min(left, maxLeft));
      top = Math.max(16, Math.min(top, maxTop));

      setCoords({ top, left });
    };

    // Delay para garantir que o tooltip foi renderizado
    const timeoutId = setTimeout(updatePosition, 50);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetSelector, position]);

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed z-[10000] w-80 bg-background border rounded-2xl shadow-2xl overflow-hidden"
      style={{
        top: coords.top,
        left: coords.left,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Passo {currentStep + 1} de {totalSteps}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onSkip}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress */}
      <Progress value={progressPercent} className="h-1 rounded-none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        <h4 className="font-semibold text-lg">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={isFirstStep}
          className={cn(isFirstStep && "invisible")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        <Button
          size="sm"
          onClick={onNext}
        >
          {isLastStep ? 'Concluir' : 'Próximo'}
          {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>

      {/* Arrow indicator */}
      <div
        className={cn(
          "absolute w-4 h-4 bg-background border rotate-45",
          position === 'top' && "bottom-[-8px] left-1/2 -translate-x-1/2 border-t-0 border-l-0",
          position === 'bottom' && "top-[-8px] left-1/2 -translate-x-1/2 border-b-0 border-r-0",
          position === 'left' && "right-[-8px] top-1/2 -translate-y-1/2 border-l-0 border-b-0",
          position === 'right' && "left-[-8px] top-1/2 -translate-y-1/2 border-r-0 border-t-0",
        )}
      />
    </motion.div>
  );
}
