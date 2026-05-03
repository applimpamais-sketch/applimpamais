import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/format";
import { getCategoriaInfo } from "@/utils/financeiroHelpers";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
}

interface MiniTabelaDespesasProps {
  despesas: Despesa[];
}

export function MiniTabelaDespesas({ despesas }: MiniTabelaDespesasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Despesas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Categoria</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {despesas.slice(0, 5).map((despesa, index) => {
              const categoriaInfo = getCategoriaInfo(despesa.categoria);
              return (
                <TableRow 
                  key={despesa.id}
                  className={cn(
                    "transition-colors hover:bg-muted/50",
                    index % 2 === 1 && "bg-muted/20"
                  )}
                >
                  <TableCell className="font-medium">{despesa.descricao}</TableCell>
                  <TableCell>{formatCurrency(despesa.valor)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" style={{ borderColor: categoriaInfo.color }}>
                      {categoriaInfo.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Button variant="link" size="sm" className="w-full mt-2" asChild>
          <Link to="/admin/financeiro/despesas">Ver Todas as Despesas →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
