import { cn } from '@/lib/utils';
import type { ElementProps } from '@/types/lp-document';

interface RenderSpacerProps {
  props: ElementProps;
}

export function RenderSpacer({ props }: RenderSpacerProps) {
  const heightClasses: Record<string, string> = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-16',
    xl: 'h-24',
  };

  return (
    <div className={cn(heightClasses[props.height || 'md'])} />
  );
}
