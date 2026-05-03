import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

interface ConsolidadoKPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export function ConsolidadoKPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  isCurrency = true,
  isPercentage = false 
}: ConsolidadoKPICardProps) {
  const displayValue = isCurrency 
    ? formatCurrency(value)
    : isPercentage 
    ? `${value.toFixed(1)}%`
    : value.toLocaleString();

  const trendColor = trend >= 0 ? "text-green-600" : "text-red-600";
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        <div className={cn("flex items-center text-xs mt-1", trendColor)}>
          <TrendIcon className="h-3 w-3 mr-1" />
          <span>{Math.abs(trend).toFixed(1)}% vs mês anterior</span>
        </div>
      </CardContent>
    </Card>
  );
}
