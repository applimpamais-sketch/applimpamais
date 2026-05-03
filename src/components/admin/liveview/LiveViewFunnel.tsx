import { Eye, ShoppingCart, FileCheck, CheckCircle2, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FunnelData {
  views: number;
  addToCart: number;
  checkout: number;
  purchases: number;
  viewToCartRate: number;
  cartToCheckoutRate: number;
  checkoutToPurchaseRate: number;
  overallRate: number;
}

interface LiveViewFunnelProps {
  data: FunnelData;
  loading?: boolean;
  period?: string;
}

export function LiveViewFunnel({ data, loading = false, period = '30d' }: LiveViewFunnelProps) {
  const steps = [
    { 
      label: 'Visualizações', 
      value: data.views, 
      icon: Eye, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      nextRate: data.viewToCartRate,
    },
    { 
      label: 'Add ao Carrinho', 
      value: data.addToCart, 
      icon: ShoppingCart, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      nextRate: data.cartToCheckoutRate,
    },
    { 
      label: 'Checkout', 
      value: data.checkout, 
      icon: FileCheck, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      nextRate: data.checkoutToPurchaseRate,
    },
    { 
      label: 'Compras', 
      value: data.purchases, 
      icon: CheckCircle2, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      nextRate: null,
    },
  ];

  const maxValue = Math.max(...steps.map(s => s.value), 1);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funil de Comportamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Funil de Comportamento</CardTitle>
          <Badge variant="outline" className="text-xs">{period}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const widthPercent = (step.value / maxValue) * 100;
            
            return (
              <div key={step.label}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", step.bgColor)}>
                    <Icon className={cn("h-5 w-5", step.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{step.label}</span>
                      <span className="text-sm font-bold">{step.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", step.bgColor.replace('100', '500').replace('/30', ''))}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {step.nextRate !== null && (
                  <div className="flex items-center gap-3 py-1">
                    <div className="w-10 flex justify-center">
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      step.nextRate >= 50 ? "text-green-600" : 
                      step.nextRate >= 20 ? "text-orange-600" : "text-red-500"
                    )}>
                      {step.nextRate.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Taxa geral */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Taxa geral (view → compra)</span>
            <Badge variant={data.overallRate >= 2 ? "default" : "secondary"}>
              {data.overallRate.toFixed(2)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
