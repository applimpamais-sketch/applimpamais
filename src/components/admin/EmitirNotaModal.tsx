import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { FileUp, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  useCreateNotaFiscal,
  useAgendamentosParaNota,
  NotaFiscalInput,
} from '@/hooks/useNotasFiscais';

const formSchema = z.object({
  tipo: z.enum(['nfse', 'nfce', 'manual']),
  numero_nota: z.string().optional(),
  serie: z.string().default('1'),
  cliente_nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  cliente_documento: z.string().optional(),
  cliente_endereco: z.string().optional(),
  cliente_email: z.string().email().optional().or(z.literal('')),
  valor_total: z.number().min(0.01, 'Valor deve ser maior que zero'),
  valor_impostos: z.number().min(0).default(0),
  descricao_servico: z.string().min(1, 'Descrição é obrigatória'),
  data_competencia: z.string(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EmitirNotaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamentoPreenchido?: {
    id: string;
    nome_cliente: string;
    telefone: string;
    valor_total: number;
    endereco: string;
  } | null;
}

export default function EmitirNotaModal({
  open,
  onOpenChange,
  agendamentoPreenchido,
}: EmitirNotaModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'agendamento'>('manual');
  const [selectedAgendamentoId, setSelectedAgendamentoId] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useCreateNotaFiscal();
  const { data: agendamentos, isLoading: loadingAgendamentos } =
    useAgendamentosParaNota();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: 'manual',
      serie: '1',
      cliente_nome: '',
      cliente_documento: '',
      cliente_endereco: '',
      cliente_email: '',
      valor_total: 0,
      valor_impostos: 0,
      descricao_servico: '',
      data_competencia: format(new Date(), 'yyyy-MM-dd'),
      observacoes: '',
    },
  });

  // Preencher com agendamento selecionado
  useEffect(() => {
    if (agendamentoPreenchido) {
      form.setValue('cliente_nome', agendamentoPreenchido.nome_cliente);
      form.setValue('cliente_endereco', agendamentoPreenchido.endereco);
      form.setValue('valor_total', agendamentoPreenchido.valor_total);
      form.setValue('descricao_servico', 'Serviço de limpeza profissional');
      setSelectedAgendamentoId(agendamentoPreenchido.id);
      setActiveTab('agendamento');
    }
  }, [agendamentoPreenchido, form]);

  // Preencher ao selecionar agendamento da lista
  useEffect(() => {
    if (selectedAgendamentoId && agendamentos) {
      const agendamento = agendamentos.find((a) => a.id === selectedAgendamentoId);
      if (agendamento) {
        form.setValue('cliente_nome', agendamento.nome_cliente);
        form.setValue('cliente_endereco', agendamento.endereco);
        form.setValue('valor_total', agendamento.valor_total);
        form.setValue('descricao_servico', 'Serviço de limpeza profissional');
      }
    }
  }, [selectedAgendamentoId, agendamentos, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }
      setPdfFile(file);
    }
  };

  const uploadPdf = async (): Promise<string | null> => {
    if (!pdfFile) return null;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${pdfFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('notas-fiscais')
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('notas-fiscais')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload do PDF');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    let pdfUrl: string | null = null;

    if (pdfFile) {
      pdfUrl = await uploadPdf();
    }

    const input: NotaFiscalInput = {
      tipo: values.tipo,
      cliente_nome: values.cliente_nome,
      descricao_servico: values.descricao_servico,
      valor_total: values.valor_total,
      numero_nota: values.numero_nota,
      serie: values.serie,
      cliente_documento: values.cliente_documento,
      cliente_endereco: values.cliente_endereco,
      cliente_email: values.cliente_email,
      valor_impostos: values.valor_impostos,
      data_competencia: values.data_competencia,
      observacoes: values.observacoes,
      agendamento_id: selectedAgendamentoId || null,
      url_pdf: pdfUrl,
      status: values.numero_nota ? 'emitida' : 'pendente',
      data_emissao: values.numero_nota ? new Date().toISOString() : null,
    };

    await createMutation.mutateAsync(input);
    onOpenChange(false);
    form.reset();
    setPdfFile(null);
    setSelectedAgendamentoId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Nota Fiscal</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Cadastro Manual</TabsTrigger>
            <TabsTrigger value="agendamento">Via Agendamento</TabsTrigger>
          </TabsList>

          <TabsContent value="agendamento" className="mt-4">
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                Selecionar Agendamento
              </label>
              <Select
                value={selectedAgendamentoId}
                onValueChange={setSelectedAgendamentoId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um agendamento..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingAgendamentos ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : agendamentos?.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum agendamento pendente de NF
                    </SelectItem>
                  ) : (
                    agendamentos?.map((ag) => (
                      <SelectItem key={ag.id} value={ag.id}>
                        {ag.nome_cliente} -{' '}
                        {format(new Date(ag.data_agendamento + 'T00:00:00'), 'dd/MM/yyyy')} -{' '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(ag.valor_total)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Nota</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nfse">NFS-e (Serviço)</SelectItem>
                        <SelectItem value="nfce">NFC-e (Consumidor)</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_nota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Nota (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 00001234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cliente_endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao_servico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Serviço *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o serviço prestado..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="valor_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_impostos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Impostos</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_competencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Competência</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Upload de PDF */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Anexar PDF da Nota (opcional)
              </label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                  {pdfFile ? (
                    <span className="text-sm text-primary">{pdfFile.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Clique para selecionar ou arraste um arquivo PDF
                    </span>
                  )}
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações internas..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || isUploading}
              >
                {(createMutation.isPending || isUploading) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Salvar Nota Fiscal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
