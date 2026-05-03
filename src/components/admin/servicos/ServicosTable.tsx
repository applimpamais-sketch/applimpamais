import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Servico } from '@/hooks/useServicosAdmin';

interface ServicosTableProps {
  servicosPorCategoria: Record<string, Servico[]>;
  onEdit: (servico: Servico) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function ServicosTable({
  servicosPorCategoria,
  onEdit,
  onDelete,
  isDeleting,
}: ServicosTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleCategory = (categoria: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoria]: !prev[categoria],
    }));
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const categorias = Object.keys(servicosPorCategoria);

  if (categorias.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        {categorias.map((categoria) => {
          const servicos = servicosPorCategoria[categoria];
          const isExpanded = expandedCategories[categoria] !== false; // default expanded

          return (
            <Card key={categoria}>
              <CardHeader
                className="cursor-pointer py-3"
                onClick={() => toggleCategory(categoria)}
              >
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span>{categoria}</span>
                    <Badge variant="secondary" className="ml-2">
                      {servicos.length} {servicos.length === 1 ? 'item' : 'itens'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subcategoria</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Tamanho</TableHead>
                          <TableHead className="text-right">Limpeza</TableHead>
                          <TableHead className="text-right">Imper.</TableHead>
                          <TableHead className="text-right">Combo</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {servicos.map((servico) => (
                          <TableRow key={servico.id}>
                            <TableCell className="font-medium">
                              {servico.subcategoria}
                            </TableCell>
                            <TableCell>{servico.item}</TableCell>
                            <TableCell>{servico.tamanho || '-'}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(servico.preco_limpeza)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(servico.preco_impermeabilizacao)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(servico.preco_limpeza_impermeabilizacao)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onEdit(servico)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteId(servico.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
