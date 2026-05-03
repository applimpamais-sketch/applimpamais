import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, Loader2 } from "lucide-react";
import { CATEGORIAS_DESPESAS, STATUS_DESPESA, FORMAS_PAGAMENTO } from "@/utils/financeiroHelpers";
import { z } from "zod";

const despesaSchema = z.object({
  descricao: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres").max(200, "Descrição muito longa"),
  valor: z.number().positive("Valor deve ser positivo").max(999999.99, "Valor muito alto"),
  data_despesa: z.string().nonempty("Data é obrigatória"),
  categoria: z.string().nonempty("Categoria é obrigatória"),
  status: z.string().nonempty("Status é obrigatório"),
  forma_pagamento: z.string().optional(),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
  servico_relacionado: z.string().max(100).optional(),
  rateio_percentual: z.number().min(0).max(100).optional(),
});

interface DespesaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesa?: any;
  onSubmit: (data: any) => void;
  onUploadComprovante: (file: File) => Promise<string>;
  isLoading?: boolean;
}

const getInitialFormData = (despesa?: any) => ({
  descricao: despesa?.descricao || "",
  valor: despesa?.valor || "",
  data_despesa: despesa?.data_despesa || new Date().toISOString().split("T")[0],
  categoria: despesa?.categoria || "",
  status: despesa?.status || "pendente",
  forma_pagamento: despesa?.forma_pagamento || "",
  observacoes: despesa?.observacoes || "",
  recorrente: despesa?.recorrente || false,
  servico_relacionado: despesa?.servico_relacionado || "",
  rateio_percentual: despesa?.rateio_percentual || "",
  comprovante_url: despesa?.comprovante_url || "",
});

export function DespesaFormModal({
  open,
  onOpenChange,
  despesa,
  onSubmit,
  onUploadComprovante,
  isLoading = false,
}: DespesaFormModalProps) {
  const [formData, setFormData] = useState(getInitialFormData(despesa));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFile, setUploadingFile] = useState(false);

  // Sincronizar formData quando a despesa mudar (para edição)
  useEffect(() => {
    setFormData(getInitialFormData(despesa));
    setErrors({});
  }, [despesa, open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, comprovante: "Arquivo muito grande (máx 5MB)" });
      return;
    }

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, comprovante: "Tipo de arquivo não permitido" });
      return;
    }

    setUploadingFile(true);
    try {
      const url = await onUploadComprovante(file);
      setFormData({ ...formData, comprovante_url: url });
      setErrors({ ...errors, comprovante: "" });
    } catch (error: any) {
      setErrors({ ...errors, comprovante: error.message });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = despesaSchema.parse({
        ...formData,
        valor: Number(formData.valor),
        rateio_percentual: formData.rateio_percentual ? Number(formData.rateio_percentual) : undefined,
      });

      onSubmit({
        ...validatedData,
        comprovante_url: formData.comprovante_url || undefined,
      });

      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{despesa ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
          <DialogDescription>
            Preencha os dados da despesa. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Combustível para veículo"
                maxLength={200}
              />
              {errors.descricao && <p className="text-sm text-destructive">{errors.descricao}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0.00"
              />
              {errors.valor && <p className="text-sm text-destructive">{errors.valor}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_despesa">Data *</Label>
              <Input
                id="data_despesa"
                type="date"
                value={formData.data_despesa}
                onChange={(e) => setFormData({ ...formData, data_despesa: e.target.value })}
              />
              {errors.data_despesa && <p className="text-sm text-destructive">{errors.data_despesa}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_DESPESAS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && <p className="text-sm text-destructive">{errors.categoria}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_DESPESA.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servico_relacionado">Serviço Relacionado</Label>
              <Input
                id="servico_relacionado"
                value={formData.servico_relacionado}
                onChange={(e) => setFormData({ ...formData, servico_relacionado: e.target.value })}
                placeholder="Opcional"
                maxLength={100}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais"
                maxLength={500}
                rows={3}
              />
              {errors.observacoes && <p className="text-sm text-destructive">{errors.observacoes}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprovante">Comprovante</Label>
              <div className="flex gap-2">
                <Input
                  id="comprovante"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
                {uploadingFile && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formData.comprovante_url && (
                <p className="text-sm text-muted-foreground">✓ Comprovante anexado</p>
              )}
              {errors.comprovante && <p className="text-sm text-destructive">{errors.comprovante}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="recorrente"
                checked={formData.recorrente}
                onCheckedChange={(checked) => setFormData({ ...formData, recorrente: checked })}
              />
              <Label htmlFor="recorrente">Despesa recorrente</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {despesa ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
