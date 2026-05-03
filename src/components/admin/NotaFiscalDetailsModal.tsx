import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Download,
  FileText,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NotaFiscal, useUpdateNotaFiscal } from '@/hooks/useNotasFiscais';

interface NotaFiscalDetailsModalProps {
  nota: NotaFiscal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pendente: {
    label: 'Pendente',
    icon: Clock,
    className: 'border-amber-500 text-amber-600 bg-amber-50',
  },
  emitida: {
    label: 'Emitida',
    icon: CheckCircle,
    className: 'bg-emerald-500 text-white',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-red-500 text-white',
  },
  rejeitada: {
    label: 'Rejeitada',
    icon: AlertCircle,
    className: 'bg-orange-500 text-white',
  },
};

const tipoLabels = {
  nfse: 'NFS-e (Nota Fiscal de Serviço)',
  nfce: 'NFC-e (Nota Fiscal ao Consumidor)',
  manual: 'Nota Manual',
};

export default function NotaFiscalDetailsModal({
  nota,
  open,
  onOpenChange,
}: NotaFiscalDetailsModalProps) {
  const updateMutation = useUpdateNotaFiscal();

  if (!nota) return null;

  const status = statusConfig[nota.status];
  const StatusIcon = status.icon;

  const handleMarcarEmitida = async () => {
    await updateMutation.mutateAsync({
      id: nota.id,
      status: 'emitida',
      data_emissao: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  const handleCancelar = async () => {
    await updateMutation.mutateAsync({
      id: nota.id,
      status: 'cancelada',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Nota Fiscal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Número da Nota</p>
              <p className="text-xl font-bold">
                {nota.numero_nota || 'Não emitida'}
              </p>
            </div>
            <Badge className={status.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          <Separator />

          {/* Informações do Cliente */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nome</p>
                <p className="font-medium">{nota.cliente_nome}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CPF/CNPJ</p>
                <p className="font-medium">{nota.cliente_documento || '-'}</p>
              </div>
              {nota.cliente_endereco && (
                <div className="col-span-2">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Endereço
                  </p>
                  <p className="font-medium">{nota.cliente_endereco}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações da Nota */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Dados da Nota
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium">{tipoLabels[nota.tipo]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Série</p>
                <p className="font-medium">{nota.serie}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Data Competência
                </p>
                <p className="font-medium">
                  {format(new Date(nota.data_competencia), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </p>
              </div>
              {nota.data_emissao && (
                <div>
                  <p className="text-muted-foreground">Data Emissão</p>
                  <p className="font-medium">
                    {format(new Date(nota.data_emissao), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}
              {nota.codigo_verificacao && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Código de Verificação</p>
                  <p className="font-mono text-xs bg-muted p-2 rounded">
                    {nota.codigo_verificacao}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Valores */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valores
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(nota.valor_total)}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Impostos</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(nota.valor_impostos || 0)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Descrição */}
          <div className="space-y-2">
            <h3 className="font-semibold">Descrição do Serviço</h3>
            <p className="text-sm bg-muted/50 p-3 rounded-lg">
              {nota.descricao_servico}
            </p>
          </div>

          {nota.observacoes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Observações</h3>
              <p className="text-sm bg-muted/50 p-3 rounded-lg">
                {nota.observacoes}
              </p>
            </div>
          )}

          {/* Links para Agendamento */}
          {nota.agendamento && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">
                Agendamento Vinculado
              </p>
              <p className="text-sm text-blue-600">
                {nota.agendamento.nome_cliente} -{' '}
                {format(new Date(nota.agendamento.data_agendamento + 'T00:00:00'), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 pt-4">
            {nota.url_pdf && (
              <Button variant="outline" asChild>
                <a
                  href={nota.url_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </a>
              </Button>
            )}

            {nota.url_xml && (
              <Button variant="outline" asChild>
                <a
                  href={nota.url_xml}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Baixar XML
                </a>
              </Button>
            )}

            {nota.status === 'pendente' && (
              <>
                <Button
                  onClick={handleMarcarEmitida}
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Emitida
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelar}
                  disabled={updateMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Nota
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
