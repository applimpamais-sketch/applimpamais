import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, ChevronDown, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Alerta {
  tipo: 'critico' | 'atencao' | 'info';
  titulo: string;
  descricao: string;
  valor?: number;
  link: string;
}

interface AlertasPrioritariosProps {
  alertas: Alerta[];
}

export function AlertasPrioritarios({ alertas }: AlertasPrioritariosProps) {
  const [isOpen, setIsOpen] = useState(alertas.length > 0);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'atencao':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const criticalCount = alertas.filter(a => a.tipo === 'critico').length;
  const warningCount = alertas.filter(a => a.tipo === 'atencao').length;

  // Estado colapsado quando vazio
  if (alertas.length === 0) {
    return (
      <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              ✓ Nenhum alerta pendente — Tudo sob controle!
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        criticalCount > 0 && "border-red-500/30",
        criticalCount === 0 && warningCount > 0 && "border-yellow-500/30"
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Alertas e Ações Prioritárias
                {criticalCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {warningCount} atenção
                  </span>
                )}
              </CardTitle>
              <ChevronDown className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            {alertas.map((alerta, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border-l-4 transition-all hover:shadow-sm",
                  alerta.tipo === 'critico' && "border-red-500 bg-red-50 dark:bg-red-950/20",
                  alerta.tipo === 'atencao' && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
                  alerta.tipo === 'info' && "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  {getIcon(alerta.tipo)}
                  <div>
                    <p className="font-medium text-sm">{alerta.titulo}</p>
                    <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
                    {alerta.valor !== undefined && (
                      <p className="text-sm font-semibold mt-1">
                        {formatCurrency(alerta.valor)}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={alerta.link}>Ver Detalhes</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
