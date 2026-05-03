import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ElementProps, ElementStyle } from '@/types/lp-document';
import { ImageIcon } from 'lucide-react';

interface RenderImageProps {
  props: ElementProps;
  style?: ElementStyle;
}

export function RenderImage({ props, style }: RenderImageProps) {
  const [hasError, setHasError] = useState(false);

  const roundedClasses: Record<string, string> = {
    none: 'rounded-none',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const objectFitClasses: Record<string, string> = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
  };

  if (!props.src || hasError) {
    return (
      <div 
        className={cn(
          'w-full aspect-video lp-surface flex items-center justify-center',
          roundedClasses[props.rounded || 'lg'],
          'border-2 border-dashed lp-border',
          style?.className,
        )}
      >
        <div className="text-center lp-text-muted">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{props.alt || 'Imagem'}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={props.src}
      alt={props.alt || 'Imagem'}
      onError={() => setHasError(true)}
      className={cn(
        'w-full',
        objectFitClasses[props.objectFit || 'cover'],
        roundedClasses[props.rounded || 'lg'],
        style?.className,
      )}
    />
  );
}
