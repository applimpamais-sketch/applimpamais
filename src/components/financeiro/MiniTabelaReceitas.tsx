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
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Receita {
  id: string;
  nome_cliente: string;
  valor_total: number;
  status_pagamento: string;
}

interface MiniTabelaReceitasProps {
  receitas: Receita[];
}

export function MiniTabelaReceitas({ receitas }: MiniTabelaReceitasProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pago':
        return 'default';
      case 'parcial':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'parcial':
        return 'Parcial';
      default:
        return 'Pendente';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receitas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receitas.slice(0, 5).map((receita, index) => (
              <TableRow 
                key={receita.id}
                className={cn(
                  "transition-colors hover:bg-muted/50",
                  index % 2 === 1 && "bg-muted/20"
                )}
              >
                <TableCell className="font-medium">{receita.nome_cliente}</TableCell>
                <TableCell>{formatCurrency(receita.valor_total)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(receita.status_pagamento)}>
                    {getStatusLabel(receita.status_pagamento)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="link" size="sm" className="w-full mt-2" asChild>
          <Link to="/admin/financeiro/receitas">Ver Todas as Receitas →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
