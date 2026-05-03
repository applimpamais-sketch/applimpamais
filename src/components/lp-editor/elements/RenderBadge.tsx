import { cn } from '@/lib/utils';
import type { ElementProps } from '@/types/lp-document';

interface RenderBadgeProps {
  props: ElementProps;
}

export function RenderBadge({ props }: RenderBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-4 py-1.5 text-sm font-medium rounded-full',
        'lp-gradient-bg lp-text-inverse',
      )}
    >
      {props.badgeText || 'Badge'}
    </span>
  );
}
