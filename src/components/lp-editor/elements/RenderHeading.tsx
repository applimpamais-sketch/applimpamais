import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ElementProps, ElementStyle } from '@/types/lp-document';

interface RenderHeadingProps {
  props: ElementProps;
  style?: ElementStyle;
  mode?: 'view' | 'edit';
  onUpdate?: (props: Record<string, unknown>) => void;
}

export function RenderHeading({ props, style, mode, onUpdate }: RenderHeadingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(props.text || '');

  const Tag = props.level || 'h2';

  const sizeClasses: Record<string, string> = {
    h1: 'text-4xl md:text-5xl lg:text-6xl',
    h2: 'text-3xl md:text-4xl lg:text-5xl',
    h3: 'text-2xl md:text-3xl',
    h4: 'text-xl md:text-2xl',
  };

  const fontSizeClasses: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };

  const fontWeightClasses: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const handleDoubleClick = useCallback(() => {
    if (mode === 'edit') {
      setIsEditing(true);
      setLocalText(props.text || '');
    }
  }, [mode, props.text]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (localText !== props.text) {
      onUpdate?.({ text: localText });
    }
  }, [localText, props.text, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === 'Escape') {
      setLocalText(props.text || '');
      setIsEditing(false);
    }
  }, [props.text]);

  const classes = cn(
    style?.fontSize ? fontSizeClasses[style.fontSize] : sizeClasses[Tag],
    fontWeightClasses[style?.fontWeight || 'bold'],
    props.useGradient ? 'lp-gradient-text' : 'lp-text',
    'leading-tight',
    style?.className,
  );

  if (isEditing && mode === 'edit') {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={(e) => setLocalText(e.currentTarget.textContent || '')}
        className={cn(classes, 'outline-none ring-2 ring-primary/50 rounded px-1')}
        dangerouslySetInnerHTML={{ __html: localText }}
      />
    );
  }

  return React.createElement(
    Tag,
    {
      className: classes,
      onDoubleClick: handleDoubleClick,
    },
    props.text || 'Título'
  );
}
