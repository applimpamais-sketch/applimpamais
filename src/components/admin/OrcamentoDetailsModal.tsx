import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Building2,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import { Orcamento, useUpdateOrcamentoStatus } from '@/hooks/useOrcamentos';
import { downloadOrcamentoPdf, PdfTemplate } from '@/utils/pdfTemplates';
import { PdfTemplateSelector } from './PdfTemplateSelector';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrcamentoDetailsModalProps {
  orcamento: Orcamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'destructive' | 'outline'; icon: typeof FileText; className?: string }> = {
  rascunho: { label: 'Rascunho', variant: 'secondary', icon: FileText },
  enviado: { label: 'Enviado', variant: 'default', icon: Clock },
  aprovado: { label: 'Aprovado', variant: 'default', icon: CheckCircle2, className: 'bg-green-600 hover:bg-green-700' },
  recusado: { label: 'Recusado', variant: 'destructive', icon: XCircle },
  expirado: { label: 'Expirado', variant: 'outline', icon: Clock },
};

export function OrcamentoDetailsModal({ orcamento, open, onOpenChange }: OrcamentoDetailsModalProps) {
  const updateStatus = useUpdateOrcamentoStatus();
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!orcamento) return null;

  const status = statusConfig[orcamento.status];
  const StatusIcon = status.icon;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleOpenTemplateSelector = () => {
    setShowTemplateSelector(true);
  };

  const handleDownloadPdf = async (template: PdfTemplate) => {
    setIsDownloading(true);
    try {
      await downloadOrcamentoPdf(orcamento, template);
      setShowTemplateSelector(false);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: Orcamento['status']) => {
    await updateStatus.mutateAsync({ id: orcamento.id, status: newStatus });
  };

  const calcularDesconto = () => {
    if (!orcamento.desconto_valor || orcamento.desconto_valor <= 0) return 0;
    if (orcamento.desconto_tipo === 'percentual') {
      return orcamento.subtotal * (orcamento.desconto_valor / 100);
    }
    return orcamento.desconto_valor;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              Orçamento #{String(orcamento.numero).padStart(4, '0')}
              <Badge variant={status.variant} className={status.className}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Datas */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Criado em: {formatDate(orcamento.created_at)}
            </div>
            {orcamento.data_validade && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Válido até: {formatDate(orcamento.data_validade)}
              </div>
            )}
          </div>

          <Separator />

          {/* Dados do Cliente */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Dados do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              {orcamento.empresa_nome && (
                <div className="md:col-span-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{orcamento.empresa_nome}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{orcamento.cliente_nome}</span>
              </div>
              {orcamento.cliente_documento && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>{orcamento.cliente_documento}</span>
                </div>
              )}
              {orcamento.cliente_telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{orcamento.cliente_telefone}</span>
                </div>
              )}
              {orcamento.cliente_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{orcamento.cliente_email}</span>
                </div>
              )}
              {(orcamento.cliente_endereco || orcamento.cliente_cidade) && (
                <div className="md:col-span-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {[orcamento.cliente_endereco, orcamento.cliente_cidade].filter(Boolean).join(' - ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Itens */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Serviços / Itens
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Descrição</th>
                    <th className="text-center p-3 w-20">Qtd</th>
                    <th className="text-right p-3 w-28">Unitário</th>
                    <th className="text-right p-3 w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orcamento.itens.map((item, index) => (
                    <tr key={item.id || index} className="border-t">
                      <td className="p-3">{item.descricao}</td>
                      <td className="p-3 text-center">{item.quantidade}</td>
                      <td className="p-3 text-right">{formatCurrency(item.valor_unitario)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(item.valor_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(orcamento.subtotal)}</span>
              </div>
              {calcularDesconto() > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>
                    Desconto {orcamento.desconto_tipo === 'percentual' ? `(${orcamento.desconto_valor}%)` : ''}:
                  </span>
                  <span>- {formatCurrency(calcularDesconto())}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(orcamento.valor_total)}</span>
              </div>
            </div>
          </div>

          {/* Condições e Observações */}
          {(orcamento.condicoes_pagamento || orcamento.observacoes) && (
            <>
              <Separator />
              <div className="space-y-3">
                {orcamento.condicoes_pagamento && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Condições de Pagamento</h4>
                    <p className="text-sm text-muted-foreground">{orcamento.condicoes_pagamento}</p>
                  </div>
                )}
                {orcamento.observacoes && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Observações</h4>
                    <p className="text-sm text-muted-foreground">{orcamento.observacoes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Ações */}
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenTemplateSelector}>
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
              <Button variant="outline" disabled>
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
              <Button variant="outline" disabled>
                <MessageSquare className="w-4 h-4 mr-2" />
                Enviar WhatsApp
              </Button>
            </div>

            <div className="flex gap-2">
              {orcamento.status === 'rascunho' && (
                <Button 
                  onClick={() => handleUpdateStatus('enviado')}
                  disabled={updateStatus.isPending}
                >
                  Marcar como Enviado
                </Button>
              )}
              {orcamento.status === 'enviado' && (
                <>
                  <Button 
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => handleUpdateStatus('recusado')}
                    disabled={updateStatus.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Recusado
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus('aprovado')}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Aprovado
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      <PdfTemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onDownload={handleDownloadPdf}
        isDownloading={isDownloading}
      />
    </Dialog>
  );
}
