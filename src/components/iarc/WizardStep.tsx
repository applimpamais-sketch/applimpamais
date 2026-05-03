import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  nextLabel?: string;
  children: ReactNode;
  className?: string;
}

export function WizardStep({
  title,
  description,
  icon,
  step,
  totalSteps,
  onBack,
  onNext,
  canGoNext = true,
  isLoading = false,
  loadingText = 'Gerando...',
  nextLabel = 'Continuar',
  children,
  className
}: WizardStepProps) {
  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {icon && <div className="text-primary">{icon}</div>}
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Etapa {step} de {totalSteps}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mt-4">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {children}
        
        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {onBack && step > 1 && (
              <Button variant="ghost" onClick={onBack} disabled={isLoading}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>
          
          <div>
            {onNext && (
              <Button 
                onClick={onNext} 
                disabled={!canGoNext || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {loadingText}
                  </>
                ) : (
                  <>
                    {nextLabel}
                    {step < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
