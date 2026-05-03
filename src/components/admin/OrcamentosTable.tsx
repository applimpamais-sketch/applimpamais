import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2, 
  Search,
  FileText,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Orcamento, useDeleteOrcamento } from '@/hooks/useOrcamentos';
import { downloadOrcamentoPdf, PdfTemplate } from '@/utils/pdfTemplates';
import { PdfTemplateSelector } from './PdfTemplateSelector';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
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

interface OrcamentosTableProps {
  orcamentos: Orcamento[] | undefined;
  isLoading: boolean;
  onViewDetails: (orcamento: Orcamento) => void;
}

const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' | 'outline'; icon: typeof FileText; className?: string }> = {
  rascunho: { label: 'Rascunho', variant: 'secondary', icon: FileText },
  enviado: { label: 'Enviado', variant: 'default', icon: Clock },
  aprovado: { label: 'Aprovado', variant: 'default', icon: CheckCircle2, className: 'bg-green-600 hover:bg-green-700' },
  recusado: { label: 'Recusado', variant: 'destructive', icon: XCircle },
  expirado: { label: 'Expirado', variant: 'outline', icon: Clock },
};

export function OrcamentosTable({ orcamentos, isLoading, onViewDetails }: OrcamentosTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pdfOrcamento, setPdfOrcamento] = useState<Orcamento | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const deleteOrcamento = useDeleteOrcamento();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const filteredOrcamentos = (orcamentos || []).filter(orcamento => {
    const matchesSearch = 
      orcamento.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      (orcamento.empresa_nome?.toLowerCase().includes(search.toLowerCase())) ||
      String(orcamento.numero).includes(search);
    
    const matchesStatus = statusFilter === 'todos' || orcamento.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (deleteId) {
      await deleteOrcamento.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleDownloadPdf = async (template: PdfTemplate) => {
    if (pdfOrcamento) {
      setIsDownloading(true);
      try {
        await downloadOrcamentoPdf(pdfOrcamento, template);
        setPdfOrcamento(null);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-0">
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, empresa ou número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="recusado">Recusado</SelectItem>
            <SelectItem value="expirado">Expirado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-24">Nº</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Itens</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrcamentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum orçamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredOrcamentos.map(orcamento => {
                const status = statusConfig[orcamento.status];
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={orcamento.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-medium">
                      #{String(orcamento.numero).padStart(4, '0')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {orcamento.empresa_nome || orcamento.cliente_nome}
                        </p>
                        {orcamento.empresa_nome && (
                          <p className="text-sm text-muted-foreground">
                            {orcamento.cliente_nome}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {orcamento.itens.length} {orcamento.itens.length === 1 ? 'item' : 'itens'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(orcamento.valor_total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant} className={status.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatDate(orcamento.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetails(orcamento)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPdfOrcamento(orcamento)}>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteId(orcamento.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O orçamento será permanentemente excluído.
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

      {/* Seletor de Template PDF */}
      <PdfTemplateSelector
        open={!!pdfOrcamento}
        onOpenChange={(open) => !open && setPdfOrcamento(null)}
        onDownload={handleDownloadPdf}
        isDownloading={isDownloading}
      />
    </div>
  );
}
