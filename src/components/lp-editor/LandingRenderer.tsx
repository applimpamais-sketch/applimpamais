import React from 'react';
import { cn } from '@/lib/utils';
import type { 
  LandingPageDocument, 
  LPSection, 
  LPRow, 
  LPColumn, 
  LPElement 
} from '@/types/lp-document';
import { getThemeStyle, type LPThemeId } from '@/styles/lp-css-themes';
import '@/styles/lp-theme.css';

// Element renderers
import { RenderHeading } from './elements/RenderHeading';
import { RenderText } from './elements/RenderText';
import { RenderImage } from './elements/RenderImage';
import { RenderButton } from './elements/RenderButton';
import { RenderList } from './elements/RenderList';
import { RenderFaq } from './elements/RenderFaq';
import { RenderTestimonial } from './elements/RenderTestimonial';
import { RenderPricing } from './elements/RenderPricing';
import { RenderBio } from './elements/RenderBio';
import { RenderSpacer } from './elements/RenderSpacer';
import { RenderBadge } from './elements/RenderBadge';
import { RenderVideo } from './elements/RenderVideo';

interface LandingRendererProps {
  document: LandingPageDocument;
  mode?: 'view' | 'edit';
  selectedId?: string | null;
  onSelect?: (id: string, type: 'section' | 'row' | 'column' | 'element') => void;
  onElementUpdate?: (elementId: string, props: Record<string, unknown>) => void;
}

export function LandingRenderer({
  document: lpDocument,
  mode = 'view',
  selectedId,
  onSelect,
  onElementUpdate,
}: LandingRendererProps) {
  const themeStyle = getThemeStyle(lpDocument.theme_id as LPThemeId);
  const mobileStack = lpDocument.settings?.mobile_stack_columns ?? true;

  return (
    <div style={themeStyle} className="min-h-screen lp-bg lp-text">
      {lpDocument.sections
        .filter(section => mode === 'edit' || section.visible)
        .map(section => (
          <SectionRenderer
            key={section.id}
            section={section}
            mode={mode}
            isSelected={selectedId === section.id}
            selectedId={selectedId}
            onSelect={onSelect}
            onElementUpdate={onElementUpdate}
            mobileStack={mobileStack}
          />
        ))}
    </div>
  );
}

// Section Renderer
interface SectionRendererProps {
  section: LPSection;
  mode: 'view' | 'edit';
  isSelected: boolean;
  selectedId?: string | null;
  mobileStack?: boolean;
  onSelect?: (id: string, type: 'section' | 'row' | 'column' | 'element') => void;
  onElementUpdate?: (elementId: string, props: Record<string, unknown>) => void;
}

function SectionRenderer({
  section,
  mode,
  isSelected,
  selectedId,
  mobileStack = true,
  onSelect,
  onElementUpdate,
}: SectionRendererProps) {
  const paddingClasses: Record<string, string> = {
    none: 'py-0',
    sm: 'py-8',
    md: 'py-16',
    lg: 'py-24',
    xl: 'py-32',
  };

  const maxWidthClasses: Record<string, string> = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  const overrideStyle: React.CSSProperties = {
    ...(section.themeOverrides || {}),
    ...(section.style.background ? { backgroundColor: section.style.background } : {}),
    ...(section.style.backgroundImage ? { 
      backgroundImage: `url(${section.style.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : {}),
  };

  const handleClick = (e: React.MouseEvent) => {
    if (mode === 'edit') {
      e.stopPropagation();
      onSelect?.(section.id, 'section');
    }
  };

  return (
    <section
      style={overrideStyle}
      onClick={handleClick}
      className={cn(
        'relative',
        paddingClasses[section.style.paddingY || 'lg'],
        !section.visible && mode === 'edit' && 'opacity-50',
        mode === 'edit' && 'cursor-pointer transition-all',
        mode === 'edit' && isSelected && 'ring-2 ring-primary ring-inset',
        mode === 'edit' && !isSelected && 'hover:ring-1 hover:ring-primary/30 hover:ring-inset',
        section.style.className,
      )}
    >
      <div className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        maxWidthClasses[section.style.maxWidth || 'lg'],
      )}>
        {section.rows.map(row => (
          <RowRenderer
            key={row.id}
            row={row}
            mode={mode}
            selectedId={selectedId}
            onSelect={onSelect}
            onElementUpdate={onElementUpdate}
            mobileStack={mobileStack}
          />
        ))}
      </div>
    </section>
  );
}

// Row Renderer
interface RowRendererProps {
  row: LPRow;
  mode: 'view' | 'edit';
  selectedId?: string | null;
  onSelect?: (id: string, type: 'section' | 'row' | 'column' | 'element') => void;
  onElementUpdate?: (elementId: string, props: Record<string, unknown>) => void;
  mobileStack?: boolean;
}

function RowRenderer({
  row,
  mode,
  selectedId,
  onSelect,
  onElementUpdate,
  mobileStack = true,
}: RowRendererProps) {
  const gapClasses: Record<string, string> = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const alignClasses: Record<string, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div
      className={cn(
        'grid grid-cols-12',
        gapClasses[row.style?.gap || 'md'],
        alignClasses[row.style?.alignItems || 'start'],
        mobileStack && 'max-md:flex max-md:flex-col',
        row.style?.reverseOnMobile && 'max-md:flex-col-reverse',
      )}
    >
      {row.columns.map(column => (
        <ColumnRenderer
          key={column.id}
          column={column}
          mode={mode}
          selectedId={selectedId}
          onSelect={onSelect}
          onElementUpdate={onElementUpdate}
        />
      ))}
    </div>
  );
}

// Column Renderer
interface ColumnRendererProps {
  column: LPColumn;
  mode: 'view' | 'edit';
  selectedId?: string | null;
  onSelect?: (id: string, type: 'section' | 'row' | 'column' | 'element') => void;
  onElementUpdate?: (elementId: string, props: Record<string, unknown>) => void;
}

function ColumnRenderer({
  column,
  mode,
  selectedId,
  onSelect,
  onElementUpdate,
}: ColumnRendererProps) {
  const colSpanClasses: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
  };

  const textAlignClasses: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      className={cn(
        colSpanClasses[column.width] || 'col-span-12',
        'max-md:col-span-12',
        textAlignClasses[column.style?.textAlign || 'left'],
        'flex flex-col gap-4',
      )}
      style={{ padding: column.style?.padding }}
    >
      {column.elements
        .filter(el => mode === 'edit' || el.visible)
        .map(element => (
          <ElementRenderer
            key={element.id}
            element={element}
            mode={mode}
            isSelected={selectedId === element.id}
            onSelect={onSelect}
            onUpdate={onElementUpdate}
          />
        ))}
    </div>
  );
}

// Element Renderer
interface ElementRendererProps {
  element: LPElement;
  mode: 'view' | 'edit';
  isSelected: boolean;
  onSelect?: (id: string, type: 'section' | 'row' | 'column' | 'element') => void;
  onUpdate?: (elementId: string, props: Record<string, unknown>) => void;
}

function ElementRenderer({
  element,
  mode,
  isSelected,
  onSelect,
  onUpdate,
}: ElementRendererProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (mode === 'edit') {
      e.stopPropagation();
      onSelect?.(element.id, 'element');
    }
  };

  const handleUpdate = (props: Record<string, unknown>) => {
    onUpdate?.(element.id, props);
  };

  const wrapperClasses = cn(
    'relative',
    !element.visible && mode === 'edit' && 'opacity-50',
    mode === 'edit' && 'cursor-pointer transition-all rounded',
    mode === 'edit' && isSelected && 'ring-2 ring-primary',
    mode === 'edit' && !isSelected && 'hover:ring-1 hover:ring-primary/30',
  );

  const styleProps: React.CSSProperties = {
    marginTop: element.style?.marginTop,
    marginBottom: element.style?.marginBottom,
    color: element.style?.color,
    backgroundColor: element.style?.backgroundColor,
  };

  const renderElement = () => {
    switch (element.type) {
      case 'heading':
        return (
          <RenderHeading 
            props={element.props} 
            style={element.style} 
            mode={mode} 
            onUpdate={handleUpdate} 
          />
        );
      case 'text':
        return (
          <RenderText 
            props={element.props} 
            style={element.style} 
            mode={mode} 
            onUpdate={handleUpdate} 
          />
        );
      case 'image':
        return <RenderImage props={element.props} style={element.style} />;
      case 'button':
        return <RenderButton props={element.props} style={element.style} />;
      case 'list':
        return <RenderList props={element.props} style={element.style} />;
      case 'faq-accordion':
        return <RenderFaq props={element.props} />;
      case 'testimonial-card':
        return <RenderTestimonial props={element.props} />;
      case 'pricing-card':
        return <RenderPricing props={element.props} />;
      case 'bio-card':
        return <RenderBio props={element.props} />;
      case 'spacer':
        return <RenderSpacer props={element.props} />;
      case 'badge':
        return <RenderBadge props={element.props} />;
      case 'video':
        return <RenderVideo props={element.props} style={element.style} />;
      default:
        return (
          <div className="p-4 border border-dashed lp-border rounded-lg lp-text-muted text-sm">
            Elemento: {element.type}
          </div>
        );
    }
  };

  return (
    <div 
      className={wrapperClasses} 
      style={styleProps}
      onClick={handleClick}
    >
      {renderElement()}
    </div>
  );
}

export default LandingRenderer;
