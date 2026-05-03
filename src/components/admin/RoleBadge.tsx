import { Badge } from '@/components/ui/badge';
import { Shield, User, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    variant: 'default' as const,
    icon: Shield,
  },
  operador: {
    label: 'Operador',
    variant: 'secondary' as const,
    icon: User,
  },
  visualizador: {
    label: 'Visualizador',
    variant: 'outline' as const,
    icon: Eye,
  },
};

export default function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.visualizador;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className={cn('flex items-center gap-1 w-fit', className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
