import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminContainerProps {
  children: ReactNode;
  className?: string;
}

export default function AdminContainer({ children, className }: AdminContainerProps) {
  return (
    <div className={cn(
      // Padding horizontal responsivo
      "px-4 sm:px-6 lg:px-8",
      // Padding vertical
      "py-6 md:py-8",
      // Padding bottom extra para mobile nav
      "pb-24 md:pb-8",
      // Espaçamento entre seções
      "space-y-6 md:space-y-8",
      className
    )}>
      {children}
    </div>
  );
}
