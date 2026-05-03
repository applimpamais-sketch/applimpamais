import { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Banknote,
  FileImage,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useParceiro } from '@/hooks/useParceiro';
import { useParceiroSaques, ParceiroSaque } from '@/hooks/useParceiroSaques';
import { cn } from '@/lib/utils';

export default function ParceiroSaques() {
  const { parceiro } = useParceiro();
  const { 
    saques, 
    loading, 
    solicitarSaque, 
    totalSolicitado, 
    totalPago,
    podeSolicitar,
    saldoMinimo 
  } = useParceiroSaques();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [saqueData, setSaqueData] = useState({
    valor: '',
    metodo: 'pix' as 'pix' | 'transferencia',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleSolicitarSaque = async () => {
    const valor = parseFloat(saqueData.valor.replace(',', '.'));
    
    if (isNaN(valor) || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }

    if (valor < saldoMinimo) {
      toast.error(`Valor mínimo para saque é ${formatCurrency(saldoMinimo)}`);
      return;
    }

    if (valor > (parceiro?.saldo_disponivel || 0)) {
      toast.error('Valor maior que o saldo disponível');
      return;
    }

    setRequesting(true);
    const { error } = await solicitarSaque({
      valor,
      metodo: saqueData.metodo,
    });

    if (error) {
      toast.error(error.message || 'Erro ao solicitar saque');
    } else {
      toast.success('Saque solicitado com sucesso!');
      setDialogOpen(false);
      setSaqueData({ valor: '', metodo: 'pix' });
    }
    setRequesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solicitado':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processando':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejeitado':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solicitado':
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case 'processando':
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 'pago':
        return "bg-green-50 text-green-700 border-green-200";
      case 'rejeitado':
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "";
    }
  };

  const hasDadosBancarios = parceiro?.dados_bancarios && 
    (parceiro.dados_bancarios.chave_pix || parceiro.dados_bancarios.conta);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Saques</h1>
          <p className="text-muted-foreground">
            Solicite a transferência do seu saldo
          </p>
        </div>

        <Button 
          onClick={() => setDialogOpen(true)}
          disabled={!podeSolicitar}
          className="w-full sm:w-auto"
        >
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Solicitar Saque
        </Button>
      </div>

      {/* Saldo Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Saldo disponível para saque</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary mt-1">
                {formatCurrency(parceiro?.saldo_disponivel || 0)}
              </p>
            </div>
            <Wallet className="h-10 sm:h-12 w-10 sm:w-12 text-primary/30 mx-auto sm:mx-0" />
          </div>

          {!podeSolicitar && (
            <div className="mt-4 p-3 bg-background/50 rounded-lg text-sm">
              {(parceiro?.saldo_disponivel || 0) < saldoMinimo ? (
                <p className="text-muted-foreground">
                  Mínimo para saque: {formatCurrency(saldoMinimo)}
                </p>
              ) : saques.some(s => s.status === 'solicitado' || s.status === 'processando') ? (
                <p className="text-yellow-700">
                  Você já possui um saque em andamento
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-xs sm:text-sm text-muted-foreground">Em processamento</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-1 truncate">
              {formatCurrency(totalSolicitado)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-xs sm:text-sm text-muted-foreground">Total sacado</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-1 truncate">
              {formatCurrency(totalPago)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warning if no bank data */}
      {!hasDadosBancarios && (
        <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Dados bancários não cadastrados</p>
              <p className="text-sm text-yellow-700">
                Para solicitar saques, você precisa cadastrar seus dados bancários no perfil.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.href = '/parceiro/perfil'}
              >
                Ir para o perfil
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Saques History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Saques</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : saques.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Banknote className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum saque realizado</p>
              <p className="text-xs">Seus saques aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {saques.map((saque) => (
                <div 
                  key={saque.id}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(saque.status)}
                        <span className="font-medium">{formatCurrency(saque.valor)}</span>
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(saque.status))}>
                          {saque.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Solicitado em {formatDate(saque.created_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Método: {saque.metodo === 'pix' ? 'PIX' : 'Transferência'}
                      </p>
                    </div>
                  </div>

                  {saque.status === 'pago' && saque.processado_em && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700 space-y-1">
                      <p>✓ Pago em {formatDate(saque.processado_em)}</p>
                      {saque.comprovante_url && (
                        <a 
                          href={saque.comprovante_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          <FileImage className="h-3 w-3" />
                          Ver comprovante
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {saque.status === 'rejeitado' && saque.motivo_rejeicao && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                      Motivo: {saque.motivo_rejeicao}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saque Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Saque</DialogTitle>
            <DialogDescription>
              Saldo disponível: {formatCurrency(parceiro?.saldo_disponivel || 0)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor do saque</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={saqueData.valor}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9,]/g, '');
                  setSaqueData({ ...saqueData, valor: value });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo: {formatCurrency(saldoMinimo)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Método de recebimento</Label>
              <RadioGroup
                value={saqueData.metodo}
                onValueChange={(value) => setSaqueData({ ...saqueData, metodo: value as 'pix' | 'transferencia' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="cursor-pointer">PIX</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transferencia" id="transferencia" />
                  <Label htmlFor="transferencia" className="cursor-pointer">Transferência Bancária</Label>
                </div>
              </RadioGroup>
            </div>

            {parceiro?.dados_bancarios && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p className="font-medium mb-1">Dados cadastrados:</p>
                {parceiro.dados_bancarios.chave_pix && (
                  <p>PIX: {parceiro.dados_bancarios.chave_pix}</p>
                )}
                {parceiro.dados_bancarios.banco && (
                  <p>
                    {parceiro.dados_bancarios.banco} - 
                    Ag: {parceiro.dados_bancarios.agencia} / 
                    CC: {parceiro.dados_bancarios.conta}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSolicitarSaque} disabled={requesting || !hasDadosBancarios}>
              {requesting ? 'Solicitando...' : 'Confirmar Saque'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
