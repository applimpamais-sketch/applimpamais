import { cn } from '@/lib/utils';
import type { ElementProps, ElementStyle } from '@/types/lp-document';

interface RenderButtonProps {
  props: ElementProps;
  style?: ElementStyle;
}

export function RenderButton({ props, style }: RenderButtonProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses: Record<string, string> = {
    primary: 'lp-btn-primary',
    secondary: 'lp-surface lp-text border lp-border hover:lp-surface-hover',
    outline: 'bg-transparent border-2 lp-border lp-text hover:lp-surface',
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all',
        sizeClasses[props.size || 'lg'],
        variantClasses[props.variant || 'primary'],
        style?.className,
      )}
    >
      {props.label || 'Clique Aqui'}
    </button>
  );
}
