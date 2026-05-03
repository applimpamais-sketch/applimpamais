import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Clock, CalendarDays, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProjecaoFluxo } from "@/hooks/useFluxoCaixa";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjecaoCardProps extends ProjecaoFluxo {
  variant?: 'primary' | 'secondary';
}

export function ProjecaoCard({ 
  periodo, 
  dataFim, 
  saldoProjetado, 
  entradasProjetadas, 
  saidasProjetadas, 
  confianca,
  variant = periodo === '7dias' ? 'primary' : 'secondary'
}: ProjecaoCardProps) {
  const periodoLabel = periodo === '7dias' ? '7 dias' : periodo === '30dias' ? '30 dias' : '90 dias';
  const percentualEntradas = entradasProjetadas + saidasProjetadas > 0 
    ? (entradasProjetadas / (entradasProjetadas + saidasProjetadas)) * 100 
    : 50;

  const isPrimary = variant === 'primary';
  
  const PeriodoIcon = periodo === '7dias' ? Clock : periodo === '30dias' ? CalendarDays : Calendar;

  return (
    <TooltipProvider>
      <Card className={cn(
        "relative overflow-hidden transition-all hover:shadow-md",
        isPrimary && "border-primary/30 bg-primary/5 ring-1 ring-primary/20",
        !isPrimary && "opacity-90"
      )}>
        {/* Badge de prioridade para 7 dias */}
        {isPrimary && (
          <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-br-lg font-medium">
            Próximo
          </div>
        )}
        
        {/* Badge de confiança */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={cn(
                "absolute top-3 right-3 cursor-help",
                confianca >= 80 ? "bg-green-500" : confianca >= 60 ? "bg-yellow-500" : "bg-red-500"
              )} 
              variant="secondary"
            >
              {confianca}% confiança
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Baseado em dados históricos e padrões de receita/despesa</p>
          </TooltipContent>
        </Tooltip>
        
        <CardHeader className={cn(isPrimary && "pt-8")}>
          <CardTitle className={cn(
            "flex items-center gap-2",
            isPrimary ? "text-lg" : "text-base"
          )}>
            <PeriodoIcon className={cn(
              "text-primary",
              isPrimary ? "h-5 w-5" : "h-4 w-4"
            )} />
            Projeção {periodoLabel}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Indicador visual de saldo */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "font-bold",
              saldoProjetado >= 0 ? "text-green-600" : "text-red-600",
              isPrimary ? "text-3xl" : "text-2xl"
            )}>
              {formatCurrency(saldoProjetado)}
            </div>
            <Badge 
              variant={saldoProjetado >= 0 ? "default" : "destructive"} 
              className="flex items-center gap-1"
            >
              {saldoProjetado >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  Saudável
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  Atenção
                </>
              )}
            </Badge>
          </div>
          
          {/* Barra de progresso entradas vs saídas */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Entradas: {formatCurrency(entradasProjetadas)}
              </span>
              <span className="text-red-600 flex items-center gap-1">
                Saídas: {formatCurrency(saidasProjetadas)}
                <TrendingDown className="h-3 w-3" />
              </span>
            </div>
            <Progress 
              value={percentualEntradas} 
              className={cn(isPrimary ? "h-3" : "h-2")}
            />
          </div>
          
          {/* Data estimada */}
          <p className="text-xs text-muted-foreground">
            Projetado para {format(new Date(dataFim), 'dd/MM/yyyy')}
          </p>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
