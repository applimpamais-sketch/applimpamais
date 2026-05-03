import { cn } from '@/lib/utils';
import type { ElementProps, ElementStyle } from '@/types/lp-document';
import { Check, X, ArrowRight, Circle } from 'lucide-react';

interface RenderListProps {
  props: ElementProps;
  style?: ElementStyle;
}

export function RenderList({ props, style }: RenderListProps) {
  const items = props.items || [];
  
  const IconComponent = {
    check: Check,
    x: X,
    arrow: ArrowRight,
    bullet: Circle,
  }[props.listIcon || 'check'];

  const iconColorClass = props.listIcon === 'x' ? 'text-red-500' : 'lp-accent';

  return (
    <ul className={cn('space-y-3', style?.className)}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <IconComponent 
            className={cn(
              'w-5 h-5 mt-0.5 flex-shrink-0',
              iconColorClass,
              props.listIcon === 'bullet' && 'w-2 h-2 mt-2 fill-current',
            )} 
          />
          <span className="lp-text-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}
