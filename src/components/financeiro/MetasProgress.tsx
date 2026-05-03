import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/format";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface MetasProgressProps {
  metaReceita: number;
  receitaAtual: number;
  progressoReceita: number;
  metaLucro: number;
  lucroAtual: number;
  progressoLucro: number;
}

export function MetasProgress({ 
  metaReceita, 
  receitaAtual, 
  progressoReceita,
  metaLucro,
  lucroAtual,
  progressoLucro
}: MetasProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas do Mês</CardTitle>
        <CardDescription>
          {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Receita</span>
            <span className="font-semibold">
              {formatCurrency(receitaAtual)} / {formatCurrency(metaReceita)}
            </span>
          </div>
          <Progress value={Math.min(progressoReceita, 100)} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">
            {progressoReceita.toFixed(1)}% atingido
          </p>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Lucro</span>
            <span className="font-semibold">
              {formatCurrency(lucroAtual)} / {formatCurrency(metaLucro)}
            </span>
          </div>
          <Progress value={Math.min(progressoLucro, 100)} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">
            {progressoLucro.toFixed(1)}% atingido
          </p>
        </div>
        
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/admin/financeiro/metas">Gerenciar Metas</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
