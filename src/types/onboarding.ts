export type TourAction = 'view' | 'click' | 'input';
export type TourPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  action: TourAction;
  position: TourPosition;
  nextRoute?: string;
  highlightPadding?: number;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedTime: string;
  steps: TourStep[];
  requiredRoute: string;
}

export interface OnboardingState {
  hasSeenWelcome: boolean;
  completedTours: string[];
  currentTour: string | null;
  currentStep: number;
  isPaused: boolean;
}

export interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface OnboardingContextType {
  state: OnboardingState;
  isLoading: boolean;
  startTour: (tourId: string) => void;
  startScreenTour: (tourId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  pauseTour: () => void;
  resumeTour: (tourId: string) => void;
  resetOnboarding: () => void;
  markWelcomeSeen: () => void;
  getCurrentTour: () => Tour | null;
  getCurrentStep: () => TourStep | null;
  getProgress: () => { completed: number; total: number };
  // Screen-level tour functions
  isScreenVisited: (route: string) => boolean;
  markScreenVisited: (route: string) => void;
  visitedScreens: string[];
}
