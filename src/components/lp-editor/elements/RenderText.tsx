import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ElementProps, ElementStyle } from '@/types/lp-document';

interface RenderTextProps {
  props: ElementProps;
  style?: ElementStyle;
  mode?: 'view' | 'edit';
  onUpdate?: (props: Record<string, unknown>) => void;
}

export function RenderText({ props, style, mode, onUpdate }: RenderTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(props.content || '');

  const fontSizeClasses: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };

  const handleDoubleClick = useCallback(() => {
    if (mode === 'edit') {
      setIsEditing(true);
      setLocalContent(props.content || '');
    }
  }, [mode, props.content]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (localContent !== props.content) {
      onUpdate?.({ content: localContent });
    }
  }, [localContent, props.content, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalContent(props.content || '');
      setIsEditing(false);
    }
  }, [props.content]);

  const classes = cn(
    fontSizeClasses[style?.fontSize || 'lg'],
    'lp-text-muted leading-relaxed',
    style?.className,
  );

  if (isEditing && mode === 'edit') {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={(e) => setLocalContent(e.currentTarget.textContent || '')}
        className={cn(classes, 'outline-none ring-2 ring-primary/50 rounded px-1 min-h-[1.5em]')}
        dangerouslySetInnerHTML={{ __html: localContent }}
      />
    );
  }

  return (
    <p className={classes} onDoubleClick={handleDoubleClick}>
      {props.content || 'Texto aqui...'}
    </p>
  );
}
