import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Eye,
  Download,
  Trash2,
  MoreHorizontal,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Skeleton } from '@/components/ui/skeleton';
import { NotaFiscal, useDeleteNotaFiscal } from '@/hooks/useNotasFiscais';

interface NotaFiscalTableProps {
  notas: NotaFiscal[] | undefined;
  isLoading: boolean;
  onViewDetails: (nota: NotaFiscal) => void;
}

const statusConfig = {
  pendente: {
    label: 'Pendente',
    icon: Clock,
    variant: 'outline' as const,
    className: 'border-amber-500 text-amber-600 bg-amber-50',
  },
  emitida: {
    label: 'Emitida',
    icon: CheckCircle,
    variant: 'default' as const,
    className: 'bg-emerald-500 text-white',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    variant: 'destructive' as const,
    className: 'bg-red-500 text-white',
  },
  rejeitada: {
    label: 'Rejeitada',
    icon: AlertCircle,
    variant: 'destructive' as const,
    className: 'bg-orange-500 text-white',
  },
};

const tipoConfig = {
  nfse: { label: 'NFS-e', className: 'bg-blue-100 text-blue-700' },
  nfce: { label: 'NFC-e', className: 'bg-purple-100 text-purple-700' },
  manual: { label: 'Manual', className: 'bg-slate-100 text-slate-700' },
};

export default function NotaFiscalTable({
  notas,
  isLoading,
  onViewDetails,
}: NotaFiscalTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteNotaFiscal();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!notas || notas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhuma nota fiscal encontrada</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Clique em "Nova Nota" para registrar uma nota fiscal.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data Competência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notas.map((nota) => {
              const status = statusConfig[nota.status];
              const tipo = tipoConfig[nota.tipo];
              const StatusIcon = status.icon;

              return (
                <TableRow key={nota.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {nota.numero_nota || '-'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{nota.cliente_nome}</p>
                      {nota.cliente_documento && (
                        <p className="text-xs text-muted-foreground">
                          {nota.cliente_documento}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={tipo.className}>
                      {tipo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(nota.valor_total)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(nota.data_competencia), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={status.className}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(nota)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        {nota.url_pdf && (
                          <DropdownMenuItem asChild>
                            <a
                              href={nota.url_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Baixar PDF
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(nota.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Nota Fiscal</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta nota fiscal? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
