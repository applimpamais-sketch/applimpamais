import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, X, ExternalLink } from 'lucide-react';
import { FORMAS_PAGAMENTO } from '@/utils/financeiroHelpers';
import { Pagamento } from '@/hooks/useReceitas';
import { formatCurrency } from '@/utils/format';

const pagamentoSchema = z.object({
  valor_pago: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Valor deve ser maior que zero',
  }),
  data_pagamento: z.string().min(1, 'Data é obrigatória'),
  forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  status: z.string().min(1, 'Status é obrigatório'),
  observacoes: z.string().optional(),
});

type PagamentoFormData = z.infer<typeof pagamentoSchema>;

interface PagamentoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Pagamento>, file?: File) => Promise<boolean>;
  pagamento?: Pagamento;
  agendamentoId: string;
  valorTotal: number;
  valorPago: number;
}

export function PagamentoFormModal({
  open,
  onOpenChange,
  onSubmit,
  pagamento,
  agendamentoId,
  valorTotal,
  valorPago,
}: PagamentoFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    pagamento?.comprovante_url || null
  );

  const saldoPendente = valorTotal - valorPago + (pagamento?.valor_pago || 0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PagamentoFormData>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      valor_pago: pagamento?.valor_pago?.toString() || saldoPendente.toString(),
      data_pagamento: pagamento?.data_pagamento || new Date().toISOString().split('T')[0],
      forma_pagamento: pagamento?.forma_pagamento || '',
      status: pagamento?.status || 'pago',
      observacoes: pagamento?.observacoes || '',
    },
  });

  const formaPagamento = watch('forma_pagamento');
  const status = watch('status');
  const valorPagoWatch = watch('valor_pago');

  useEffect(() => {
    if (open) {
      reset({
        valor_pago: pagamento?.valor_pago?.toString() || saldoPendente.toString(),
        data_pagamento: pagamento?.data_pagamento || new Date().toISOString().split('T')[0],
        forma_pagamento: pagamento?.forma_pagamento || '',
        status: pagamento?.status || 'pago',
        observacoes: pagamento?.observacoes || '',
      });
      setFile(null);
      setPreviewUrl(pagamento?.comprovante_url || null);
    }
  }, [open, pagamento, saldoPendente, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tamanho (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 5MB.');
        return;
      }

      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou PDF.');
        return;
      }

      setFile(selectedFile);
      
      // Criar preview para imagens
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(pagamento?.comprovante_url || null);
  };

  const onSubmitForm = async (data: PagamentoFormData) => {
    // Validar valor pago
    const valor = Number(data.valor_pago);
    if (valor > saldoPendente) {
      alert(`Valor pago não pode exceder o saldo pendente de ${formatCurrency(saldoPendente)}`);
      return;
    }

    // Validar data
    const dataPagamento = new Date(data.data_pagamento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataPagamento > hoje) {
      alert('Data de pagamento não pode ser futura');
      return;
    }

    setLoading(true);

    const pagamentoData: Partial<Pagamento> = {
      agendamento_id: agendamentoId,
      valor_pago: valor,
      data_pagamento: data.data_pagamento,
      forma_pagamento: data.forma_pagamento,
      status: data.status,
      observacoes: data.observacoes || null,
    };

    const success = await onSubmit(pagamentoData, file || undefined);

    setLoading(false);

    if (success) {
      onOpenChange(false);
      reset();
      setFile(null);
      setPreviewUrl(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {pagamento ? 'Editar Pagamento' : 'Registrar Pagamento'}
          </DialogTitle>
          <DialogDescription>
            Saldo pendente: {formatCurrency(saldoPendente)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_pago">Valor Pago *</Label>
              <Input
                id="valor_pago"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('valor_pago')}
              />
              {errors.valor_pago && (
                <p className="text-sm text-destructive">{errors.valor_pago.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
              <Input
                id="data_pagamento"
                type="date"
                {...register('data_pagamento')}
              />
              {errors.data_pagamento && (
                <p className="text-sm text-destructive">{errors.data_pagamento.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
              <Select
                value={formaPagamento}
                onValueChange={(value) => setValue('forma_pagamento', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <SelectItem key={forma.value} value={forma.value}>
                      {forma.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.forma_pagamento && (
                <p className="text-sm text-destructive">{errors.forma_pagamento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comprovante">Comprovante</Label>
            <div className="flex gap-2">
              <Input
                id="comprovante"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              {(file || previewUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: JPG, PNG, WEBP, PDF (máx. 5MB)
            </p>

            {previewUrl && (
              <div className="mt-2">
                {previewUrl.includes('.pdf') ? (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver comprovante PDF
                  </a>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-w-xs rounded-lg border"
                  />
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre o pagamento..."
              rows={3}
              {...register('observacoes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pagamento ? 'Atualizar' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
