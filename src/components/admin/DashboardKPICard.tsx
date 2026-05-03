import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatPercentage } from '@/utils/dashboardHelpers';

interface DashboardKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  showChange?: boolean;
}

export default function DashboardKPICard({
  title,
  value,
  icon: Icon,
  change,
  showChange = false,
}: DashboardKPICardProps) {
  // Formatar valor para exibição responsiva
  const displayValue = typeof value === 'string' && value.startsWith('R$') 
    ? value 
    : value;

  return (
    <Card className="group backdrop-blur-md bg-background/60 border border-border/50 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-black/10 hover:scale-[1.02] transition-all duration-300 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="relative p-3 md:p-4">
        <div className="flex items-start justify-between mb-2">
          <Icon className="h-4 w-4 text-primary/70 flex-shrink-0" />
          {showChange && change !== undefined && (
            <span className={cn(
              'text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap',
              change >= 0 ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'
            )}>
              {formatPercentage(change)}
            </span>
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">{title}</p>
        <p className="text-lg sm:text-xl md:text-2xl font-bold truncate" title={String(displayValue)}>
          {displayValue}
        </p>
      </CardContent>
    </Card>
  );
}
