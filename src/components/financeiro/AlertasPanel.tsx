import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, DollarSign, TrendingDown, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";
import { AlertaFluxo } from "@/hooks/useFluxoCaixa";

interface AlertasPanelProps {
  alertas: AlertaFluxo[];
}

const iconMap = {
  vencimento: Clock,
  saldo_baixo: DollarSign,
  inadimplencia: AlertTriangle,
  projecao_negativa: TrendingDown,
};

export function AlertasPanel({ alertas }: AlertasPanelProps) {
  if (alertas.length === 0) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Alertas (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum alerta no momento. Tudo está em ordem! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Alertas ({alertas.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {alertas.map(alerta => {
              const Icon = iconMap[alerta.tipo];
              return (
                <div 
                  key={alerta.id} 
                  className={cn(
                    "p-3 rounded-lg border",
                    alerta.severidade === 'alta' && "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900",
                    alerta.severidade === 'media' && "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900",
                    alerta.severidade === 'baixa' && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn(
                      "h-5 w-5 mt-0.5",
                      alerta.severidade === 'alta' && "text-red-600",
                      alerta.severidade === 'media' && "text-yellow-600",
                      alerta.severidade === 'baixa' && "text-blue-600"
                    )} />
                    
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{alerta.titulo}</p>
                      <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
                      {alerta.valor !== undefined && (
                        <p className="text-sm font-semibold mt-2">
                          {formatCurrency(alerta.valor)}
                        </p>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
