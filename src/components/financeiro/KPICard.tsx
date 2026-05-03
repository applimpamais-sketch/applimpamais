import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  isPercentage?: boolean;
  isCurrency?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  isPercentage = false,
  isCurrency = true,
  variant = 'default'
}: KPICardProps) {
  const displayValue = isCurrency 
    ? formatCurrency(value)
    : isPercentage 
    ? `${value.toFixed(1)}%`
    : value.toLocaleString();

  const variantStyles = {
    default: "",
    success: "border-green-500/30 bg-green-50/50 dark:bg-green-950/20",
    warning: "border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20",
    danger: "border-red-500/30 bg-red-50/50 dark:bg-red-950/20"
  };

  const iconVariantStyles = {
    default: "text-muted-foreground",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600"
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium truncate">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 flex-shrink-0", iconVariantStyles[variant])} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-lg sm:text-xl md:text-2xl font-bold truncate" title={displayValue}>
          {displayValue}
        </div>
        {trend !== undefined && (
          <p className={cn(
            "text-[10px] sm:text-xs mt-1 truncate flex items-center gap-1",
            trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
          )}>
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}% vs mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}
