import { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Aluguel } from '@/hooks/useAlugueisAdmin';

interface LocacoesTableProps {
  alugueisPorEquipamento: Record<string, Aluguel[]>;
  onEdit: (aluguel: Aluguel) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function LocacoesTable({
  alugueisPorEquipamento,
  onEdit,
  onDelete,
  isDeleting,
}: LocacoesTableProps) {
  const [expandedEquipamentos, setExpandedEquipamentos] = useState<Set<string>>(
    new Set(Object.keys(alugueisPorEquipamento))
  );

  const toggleEquipamento = (equipamento: string) => {
    const newExpanded = new Set(expandedEquipamentos);
    if (newExpanded.has(equipamento)) {
      newExpanded.delete(equipamento);
    } else {
      newExpanded.add(equipamento);
    }
    setExpandedEquipamentos(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (Object.keys(alugueisPorEquipamento).length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma locação cadastrada</h3>
          <p className="text-muted-foreground text-center">
            Adicione equipamentos para aluguel.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(alugueisPorEquipamento).map(([equipamento, alugueis]) => (
        <Collapsible
          key={equipamento}
          open={expandedEquipamentos.has(equipamento)}
          onOpenChange={() => toggleEquipamento(equipamento)}
        >
          <Card>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  {expandedEquipamentos.has(equipamento) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-medium">{equipamento}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({alugueis.length} {alugueis.length === 1 ? 'período' : 'períodos'})
                  </span>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alugueis.map((aluguel) => (
                      <TableRow key={aluguel.id}>
                        <TableCell className="font-medium">
                          {aluguel.periodo_aluguel}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(aluguel.preco)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(aluguel)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir locação?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O período "{aluguel.periodo_aluguel}" será removido permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(aluguel.id)}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}
