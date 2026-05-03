import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";
import { DRESimplificado } from "@/hooks/useFluxoCaixa";
import { DollarSign, MinusCircle, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DRETableProps {
  dre: DRESimplificado;
}

export function DRETable({ dre }: DRETableProps) {
  const getPercentage = (valor: number) => {
    if (dre.receitaBruta === 0) return 0;
    return ((valor / dre.receitaBruta) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          DRE - Demonstrativo de Resultado
        </CardTitle>
        <CardDescription>{dre.periodo}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableBody>
              {/* Receita Bruta */}
              <TableRow className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Receita Bruta
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {formatCurrency(dre.receitaBruta)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground w-20">
                  100%
                </TableCell>
                <TableCell className="w-32">
                  <Progress value={100} className="h-2" />
                </TableCell>
              </TableRow>
              
              {/* Descontos */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableRow className="text-red-600 hover:bg-muted/50 transition-colors bg-muted/10 cursor-help">
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-2">
                        <MinusCircle className="h-4 w-4" />
                        (-) Descontos
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(dre.descontos)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getPercentage(dre.descontos).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Progress value={getPercentage(dre.descontos)} className="h-2 [&>div]:bg-red-500" />
                    </TableCell>
                  </TableRow>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Descontos concedidos em agendamentos</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Receita Líquida */}
              <TableRow className="font-semibold border-t-2 bg-primary/5 hover:bg-primary/10 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    = Receita Líquida
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(dre.receitaLiquida)}
                </TableCell>
                <TableCell className="text-right">
                  {getPercentage(dre.receitaLiquida).toFixed(1)}%
                </TableCell>
                <TableCell>
                  <Progress value={getPercentage(dre.receitaLiquida)} className="h-2" />
                </TableCell>
              </TableRow>
              
              {/* Custo dos Serviços */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableRow className="text-red-600 hover:bg-muted/50 transition-colors bg-muted/10 cursor-help">
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-2">
                        <MinusCircle className="h-4 w-4" />
                        (-) Custo dos Serviços
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(dre.custoServicos)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getPercentage(dre.custoServicos).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Progress value={getPercentage(dre.custoServicos)} className="h-2 [&>div]:bg-red-500" />
                    </TableCell>
                  </TableRow>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Custos diretos relacionados aos serviços prestados</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Lucro Operacional */}
              <TableRow className="font-semibold border-t hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={cn("h-4 w-4", dre.lucroOperacional >= 0 ? "text-green-600" : "text-red-600")} />
                    = Lucro Operacional
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-right",
                  dre.lucroOperacional >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(dre.lucroOperacional)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={dre.lucroOperacional >= 0 ? "default" : "destructive"}>
                    {dre.margemBruta.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Progress 
                    value={Math.min(Math.abs(dre.margemBruta), 100)} 
                    className={cn("h-2", dre.lucroOperacional < 0 && "[&>div]:bg-red-500")} 
                  />
                </TableCell>
              </TableRow>
              
              {/* Despesas Operacionais */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableRow className="text-red-600 hover:bg-muted/50 transition-colors bg-muted/10 cursor-help">
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-2">
                        <MinusCircle className="h-4 w-4" />
                        (-) Despesas Operacionais
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(dre.despesasOperacionais)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getPercentage(dre.despesasOperacionais).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Progress value={getPercentage(dre.despesasOperacionais)} className="h-2 [&>div]:bg-red-500" />
                    </TableCell>
                  </TableRow>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Despesas administrativas e operacionais</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Lucro Líquido */}
              <TableRow className={cn(
                "font-bold text-lg border-t-2",
                dre.lucroLiquido >= 0 ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
              )}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {dre.lucroLiquido >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    = LUCRO LÍQUIDO
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-right",
                  dre.lucroLiquido >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(dre.lucroLiquido)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={dre.lucroLiquido >= 0 ? "default" : "destructive"} className="text-sm">
                    {dre.margemLiquida.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Progress 
                    value={Math.min(Math.abs(dre.margemLiquida), 100)} 
                    className={cn("h-3", dre.lucroLiquido < 0 && "[&>div]:bg-red-500")} 
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
