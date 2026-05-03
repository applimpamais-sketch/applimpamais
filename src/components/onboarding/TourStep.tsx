import { AnimatePresence } from 'framer-motion';
import { useOnboarding } from './OnboardingProvider';
import TourOverlay from './TourOverlay';
import TourTooltip from './TourTooltip';

export default function TourStep() {
  const { 
    getCurrentTour, 
    getCurrentStep, 
    nextStep, 
    previousStep, 
    skipTour,
    state,
  } = useOnboarding();

  const tour = getCurrentTour();
  const step = getCurrentStep();

  if (!tour || !step) return null;

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === tour.steps.length - 1;

  return (
    <AnimatePresence>
      <TourOverlay
        targetSelector={step.targetSelector}
        padding={step.highlightPadding}
        onElementNotFound={nextStep}
      >
        <TourTooltip
          targetSelector={step.targetSelector}
          title={step.title}
          content={step.content}
          position={step.position}
          currentStep={state.currentStep}
          totalSteps={tour.steps.length}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTour}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      </TourOverlay>
    </AnimatePresence>
  );
}
