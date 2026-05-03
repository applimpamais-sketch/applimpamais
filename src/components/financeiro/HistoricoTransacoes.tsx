import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getCategoriaInfo, getCategoriaReceitaInfo } from "@/utils/financeiroHelpers";
import { cn } from "@/lib/utils";

interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

interface HistoricoTransacoesProps {
  transacoes: Transacao[];
}

export function HistoricoTransacoes({ transacoes }: HistoricoTransacoesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhuma transação recente encontrada
                </TableCell>
              </TableRow>
            ) : (
              transacoes.slice(0, 10).map((transacao, index) => {
                const categoriaInfo = transacao.tipo === 'despesa' 
                  ? getCategoriaInfo(transacao.categoria)
                  : { label: transacao.categoria, color: 'hsl(var(--chart-2))' };
                
                return (
                  <TableRow 
                    key={transacao.id}
                    className={cn(
                      "transition-colors hover:bg-muted/50",
                      index % 2 === 1 && "bg-muted/20"
                    )}
                  >
                    <TableCell>
                      <Badge 
                        variant={transacao.tipo === 'receita' ? 'default' : 'destructive'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {transacao.tipo === 'receita' ? (
                          <><ArrowUpRight className="h-3 w-3" /> Entrada</>
                        ) : (
                          <><ArrowDownRight className="h-3 w-3" /> Saída</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{transacao.descricao}</TableCell>
                    <TableCell>
                      {format(new Date(transacao.data), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: categoriaInfo.color }}>
                        {categoriaInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                        {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
