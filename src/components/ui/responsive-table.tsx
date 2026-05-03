import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTableWrapperProps {
  children: ReactNode;
  className?: string;
  minWidth?: string;
}

/**
 * Wrapper para tabelas responsivas com scroll horizontal em mobile
 * Usa margin negativa para permitir scroll edge-to-edge
 */
export function ResponsiveTableWrapper({ 
  children, 
  className,
  minWidth = '600px'
}: ResponsiveTableWrapperProps) {
  return (
    <div className={cn(
      "overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0",
      className
    )}>
      <div style={{ minWidth }} className="md:min-w-0">
        {children}
      </div>
    </div>
  );
}
