import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Template } from '@/hooks/useTemplates';
import { Eye } from 'lucide-react';

interface TemplateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: Partial<Template>) => void;
  template?: Template;
  isLoading?: boolean;
}

const categorias = [
  { value: 'agendamento', label: 'Agendamento' },
  { value: 'carrinho', label: 'Carrinho Abandonado' },
  { value: 'pos-venda', label: 'Pós-Venda' },
  { value: 'promocao', label: 'Promoção' },
  { value: 'suporte', label: 'Suporte' },
];

export default function TemplateFormModal({
  open,
  onOpenChange,
  onSave,
  template,
  isLoading
}: TemplateFormModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    titulo: '',
    categoria: 'agendamento',
    conteudo: '',
    ativo: true,
  });

  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  useEffect(() => {
    if (template) {
      setFormData({
        nome: template.nome,
        titulo: template.titulo,
        categoria: template.categoria,
        conteudo: template.conteudo,
        ativo: template.ativo,
      });
    } else {
      setFormData({
        nome: '',
        titulo: '',
        categoria: 'agendamento',
        conteudo: '',
        ativo: true,
      });
    }
  }, [template, open]);

  useEffect(() => {
    // Detectar variáveis no formato {variavel}
    const regex = /\{([^}]+)\}/g;
    const matches = formData.conteudo.matchAll(regex);
    const vars = Array.from(matches, m => m[1]);
    const uniqueVars = [...new Set(vars)];
    setDetectedVariables(uniqueVars);
  }, [formData.conteudo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      variaveis: detectedVariables,
    });
  };

  const previewContent = formData.conteudo.replace(
    /\{([^}]+)\}/g,
    (match, variable) => `[${variable.toUpperCase()}]`
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
          <DialogDescription>
            Crie ou edite templates de mensagens WhatsApp. Use {'{variavel}'} para inserir dados dinâmicos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Formulário */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Template *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Confirmação de Agendamento"
                  required
                />
              </div>

              <div>
                <Label htmlFor="titulo">Título (opcional)</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Confirmação"
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="conteudo">Conteúdo da Mensagem *</Label>
                <Textarea
                  id="conteudo"
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Olá {nome}! Seu agendamento está confirmado para {data} às {horario}..."
                  className="min-h-[280px] font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo: 4096 caracteres ({formData.conteudo.length}/4096)
                </p>
              </div>

              {detectedVariables.length > 0 && (
                <div>
                  <Label>Variáveis Detectadas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {detectedVariables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="font-mono">
                        {`{${variable}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Eye className="h-4 w-4" />
                Preview da Mensagem
              </div>
              
              <Card className="p-4 bg-muted/30">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Como a mensagem aparecerá no WhatsApp:
                  </p>
                  <Separator />
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {previewContent || 'Digite uma mensagem para ver o preview...'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    As variáveis em {'{}'} serão substituídas pelos dados reais no envio.
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <p className="text-xs font-medium mb-2">💡 Variáveis Comuns:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><code className="bg-background px-1 rounded">{'{nome}'}</code> - Nome do cliente</p>
                  <p><code className="bg-background px-1 rounded">{'{data}'}</code> - Data do agendamento</p>
                  <p><code className="bg-background px-1 rounded">{'{horario}'}</code> - Horário</p>
                  <p><code className="bg-background px-1 rounded">{'{servicos}'}</code> - Serviços contratados</p>
                  <p><code className="bg-background px-1 rounded">{'{valor_total}'}</code> - Valor total</p>
                  <p><code className="bg-background px-1 rounded">{'{endereco}'}</code> - Endereço completo</p>
                </div>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : template ? 'Atualizar' : 'Criar Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
