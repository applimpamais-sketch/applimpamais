import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import HelpButton from '@/components/onboarding/HelpButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  showHelpButton?: boolean;
}

export default function PageHeader({ title, subtitle, description, icon: Icon, actions, showHelpButton = true }: PageHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-8 w-8 text-primary" />}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
          </div>
          {(subtitle || description) && (
            <p className="text-muted-foreground mt-1">{subtitle || description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showHelpButton && <HelpButton />}
          {actions && <div>{actions}</div>}
        </div>
      </div>
    </div>
  );
}
