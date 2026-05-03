import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Servico } from '@/hooks/useServicosAdmin';
import { Aluguel } from '@/hooks/useAlugueisAdmin';
import {
  parseServicosCSV,
  parseAlugueisCSV,
  ServicoChange,
  AluguelChange,
  ImportResult,
} from '@/utils/importServicosCSV';

type ImportType = 'servicos' | 'locacoes';

interface ImportCSVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ImportType;
  servicos: Servico[];
  alugueis: Aluguel[];
  onUpdateServico: (id: string, data: Partial<Servico>) => Promise<void>;
  onUpdateAluguel: (id: string, data: Partial<Aluguel>) => Promise<void>;
}

export function ImportCSVModal({
  open,
  onOpenChange,
  type,
  servicos,
  alugueis,
  onUpdateServico,
  onUpdateAluguel,
}: ImportCSVModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'applying' | 'done'>('upload');
  const [servicoResult, setServicoResult] = useState<ImportResult<ServicoChange> | null>(null);
  const [aluguelResult, setAluguelResult] = useState<ImportResult<AluguelChange> | null>(null);
  const [progress, setProgress] = useState(0);
  const [applyErrors, setApplyErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setServicoResult(null);
    setAluguelResult(null);
    setProgress(0);
    setApplyErrors([]);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleFile = async (file: File) => {
    if (type === 'servicos') {
      const result = await parseServicosCSV(file, servicos);
      setServicoResult(result);
    } else {
      const result = await parseAlugueisCSV(file, alugueis);
      setAluguelResult(result);
    }
    setStep('preview');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleApply = async () => {
    setStep('applying');
    const errors: string[] = [];

    if (type === 'servicos' && servicoResult) {
      const total = servicoResult.updates.length;
      for (let i = 0; i < total; i++) {
        const u = servicoResult.updates[i];
        try {
          await onUpdateServico(u.id, {
            preco_limpeza: u.preco_limpeza,
            preco_impermeabilizacao: u.preco_impermeabilizacao,
            preco_limpeza_impermeabilizacao: u.preco_limpeza_impermeabilizacao,
          });
        } catch {
          errors.push(`Erro ao atualizar "${u.item}"`);
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }
    } else if (type === 'locacoes' && aluguelResult) {
      const total = aluguelResult.updates.length;
      for (let i = 0; i < total; i++) {
        const u = aluguelResult.updates[i];
        try {
          await onUpdateAluguel(u.id, { preco: u.preco });
        } catch {
          errors.push(`Erro ao atualizar "${u.equipamento} - ${u.periodo_aluguel}"`);
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }
    }

    setApplyErrors(errors);
    setStep('done');
  };

  const result = type === 'servicos' ? servicoResult : aluguelResult;
  const updates = result?.updates || [];
  const hasErrors = (result?.errors?.length || 0) > 0;

  const formatPrice = (val: number | null) =>
    val != null ? `R$ ${val.toFixed(2).replace('.', ',')}` : '—';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar CSV — {type === 'servicos' ? 'Serviços' : 'Locações'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Selecione o arquivo CSV exportado com os preços atualizados.'}
            {step === 'preview' && 'Revise as alterações antes de aplicar.'}
            {step === 'applying' && 'Aplicando alterações...'}
            {step === 'done' && 'Importação concluída.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Arraste o arquivo CSV aqui</p>
            <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {step === 'preview' && (
          <div className="flex flex-col gap-4 min-h-0 flex-1">
            <div className="flex gap-3 flex-wrap">
              <Badge variant="default">{updates.length} alterações</Badge>
              <Badge variant="secondary">{result?.skipped || 0} sem mudança</Badge>
              {hasErrors && (
                <Badge variant="destructive">{result?.errors.length} erros</Badge>
              )}
            </div>

            {hasErrors && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-4 text-xs space-y-0.5">
                    {result?.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                    {(result?.errors.length || 0) > 5 && (
                      <li>...e mais {(result?.errors.length || 0) - 5} erros</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {updates.length > 0 && (
              <ScrollArea className="flex-1 max-h-[350px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Campo</TableHead>
                      <TableHead className="text-right">Antes</TableHead>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="text-right">Depois</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updates.flatMap((u: any) =>
                      u.changes.map((c: any, ci: number) => (
                        <TableRow key={`${u.id}-${ci}`}>
                          <TableCell className="text-xs font-medium">
                            {type === 'servicos' ? u.item : `${u.equipamento} — ${u.periodo_aluguel}`}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{c.field}</TableCell>
                          <TableCell className="text-right text-xs text-destructive">
                            {formatPrice(c.oldValue)}
                          </TableCell>
                          <TableCell className="text-center">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </TableCell>
                          <TableCell className="text-right text-xs text-green-600 font-medium">
                            {formatPrice(c.newValue)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}

            {updates.length === 0 && !hasErrors && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                Nenhuma alteração de preço detectada.
              </div>
            )}
          </div>
        )}

        {step === 'applying' && (
          <div className="py-8 space-y-4">
            <Progress value={progress} />
            <p className="text-center text-sm text-muted-foreground">
              Atualizando... {progress}%
            </p>
          </div>
        )}

        {step === 'done' && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 mx-auto text-green-600" />
            <p className="font-medium">Importação concluída!</p>
            <p className="text-sm text-muted-foreground">
              {updates.length} {type === 'servicos' ? 'serviços' : 'locações'} atualizados
            </p>
            {applyErrors.length > 0 && (
              <Alert variant="destructive" className="text-left">
                <AlertDescription>
                  <ul className="list-disc pl-4 text-xs">
                    {applyErrors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'preview' && updates.length > 0 && (
            <Button onClick={handleApply}>
              Confirmar {updates.length} alterações
            </Button>
          )}
          {step === 'done' && (
            <Button onClick={handleClose}>Fechar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
