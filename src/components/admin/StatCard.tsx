import { LucideIcon, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const cardVariants = {
  default: '',
  success: 'border-green-500/20',
  warning: 'border-yellow-500/20',
  danger: 'border-red-500/20',
};

const iconVariants = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-green-500/10 text-green-600',
  warning: 'bg-yellow-500/10 text-yellow-600',
  danger: 'bg-red-500/10 text-red-600',
};

export default function StatCard({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  variant = 'default' 
}: StatCardProps) {
  return (
    <Card className={cn(
      'backdrop-blur-md bg-background/60 border border-border/50 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
      cardVariants[variant]
    )}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl md:text-3xl font-bold">{value}</p>
            {trend && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> {trend}
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl backdrop-blur-sm', iconVariants[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
