import { Edit, Trash2, ShoppingBag, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Upsell } from '@/hooks/useUpsellsAdmin';

interface UpsellsTableProps {
  upsells: Upsell[];
  onEdit: (upsell: Upsell) => void;
  onDelete: (id: string) => void;
  onToggleAtivo: (id: string, ativo: boolean) => void;
  isDeleting: boolean;
  isToggling: boolean;
}

export function UpsellsTable({
  upsells,
  onEdit,
  onDelete,
  onToggleAtivo,
  isDeleting,
  isToggling,
}: UpsellsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getAplicavelLabel = (aplicavel: string[]) => {
    if (!aplicavel || aplicavel.length === 0) return 'Nenhum';
    if (aplicavel.includes('servicos') && aplicavel.includes('locacoes')) return 'Ambos';
    if (aplicavel.includes('servicos')) return 'Serviços';
    if (aplicavel.includes('locacoes')) return 'Locações';
    return aplicavel.join(', ');
  };

  if (upsells.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum upsell cadastrado</h3>
          <p className="text-muted-foreground text-center">
            Adicione produtos adicionais para vender junto com seus serviços.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="hidden sm:table-cell">Aplicável a</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upsells.map((upsell) => (
              <TableRow key={upsell.id} className={!upsell.ativo ? 'opacity-60' : ''}>
                <TableCell className="font-medium">{upsell.nome}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                  {upsell.descricao || '-'}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(upsell.preco)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary">{getAplicavelLabel(upsell.aplicavel_a)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleAtivo(upsell.id, !upsell.ativo)}
                    disabled={isToggling}
                    title={upsell.ativo ? 'Desativar' : 'Ativar'}
                  >
                    {upsell.ativo ? (
                      <ToggleRight className="h-5 w-5 text-primary" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(upsell)}>
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
                          <AlertDialogTitle>Excluir upsell?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O upsell "{upsell.nome}" será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(upsell.id)}
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
    </Card>
  );
}
