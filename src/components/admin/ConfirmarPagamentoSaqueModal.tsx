import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, FileImage, X, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConfirmarPagamentoSaqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saque: {
    id: string;
    valor: number;
    parceiro_nome: string;
    chave_pix?: string;
  } | null;
  onConfirm: (saqueId: string, comprovanteUrl: string | null, observacoes: string) => void;
}

export default function ConfirmarPagamentoSaqueModal({
  open,
  onOpenChange,
  saque,
  onConfirm
}: ConfirmarPagamentoSaqueModalProps) {
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [comprovantePreview, setComprovantePreview] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Apenas imagens ou PDF são permitidos');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setComprovanteFile(file);

    // Preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setComprovantePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setComprovantePreview(null);
    }
  };

  const removeFile = () => {
    setComprovanteFile(null);
    setComprovantePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = async () => {
    if (!saque) return;

    setConfirming(true);
    let comprovanteUrl: string | null = null;

    try {
      // Upload do comprovante se existir
      if (comprovanteFile) {
        setUploading(true);
        const fileExt = comprovanteFile.name.split('.').pop();
        const fileName = `${saque.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('comprovantes-saques')
          .upload(fileName, comprovanteFile);

        if (uploadError) {
          console.error('Erro upload:', uploadError);
          toast.error('Erro ao fazer upload do comprovante');
          setUploading(false);
          setConfirming(false);
          return;
        }

        // Gerar URL pública
        const { data: urlData } = supabase.storage
          .from('comprovantes-saques')
          .getPublicUrl(fileName);

        comprovanteUrl = urlData.publicUrl;
        setUploading(false);
      }

      // Chamar callback de confirmação
      onConfirm(saque.id, comprovanteUrl, observacoes);

      // Limpar estado
      setComprovanteFile(null);
      setComprovantePreview(null);
      setObservacoes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao confirmar pagamento');
    } finally {
      setConfirming(false);
      setUploading(false);
    }
  };

  const handleClose = () => {
    setComprovanteFile(null);
    setComprovantePreview(null);
    setObservacoes('');
    onOpenChange(false);
  };

  if (!saque) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmar Pagamento
          </DialogTitle>
          <DialogDescription>
            Confirme o pagamento do saque para {saque.parceiro_nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumo do saque */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Valor:</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(saque.valor)}
              </span>
            </div>
            {saque.chave_pix && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Chave PIX: </span>
                <code className="bg-background px-1 rounded">{saque.chave_pix}</code>
              </div>
            )}
          </div>

          {/* Upload de comprovante */}
          <div className="space-y-2">
            <Label>Comprovante de Pagamento (opcional)</Label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!comprovanteFile ? (
              <Button
                type="button"
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para anexar comprovante
                  </span>
                </div>
              </Button>
            ) : (
              <div className="relative border rounded-lg p-3">
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
                
                {comprovantePreview ? (
                  <img
                    src={comprovantePreview}
                    alt="Preview"
                    className="max-h-32 mx-auto rounded"
                  />
                ) : (
                  <div className="flex items-center gap-3 py-2">
                    <FileImage className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{comprovanteFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(comprovanteFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              placeholder="Ex: Pago via PIX às 15:30"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={confirming}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={confirming || uploading}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading ? 'Enviando...' : 'Confirmando...'}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirmar Pagamento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
