import { useState } from 'react';
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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Template } from '@/hooks/useTemplates';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TemplateTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

export default function TemplateTestModal({
  open,
  onOpenChange,
  template
}: TemplateTestModalProps) {
  const [telefone, setTelefone] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const fillExampleData = () => {
    const examples: Record<string, string> = {
      'nome': 'João Silva',
      'nome_cliente': 'João Silva',
      'data': '15/11/2025',
      'horario': '14:00',
      'servicos': 'Limpeza de Sofá (3 lugares)',
      'endereco': 'Rua das Flores, 123',
      'bairro': 'Centro',
      'cidade': 'Belo Horizonte',
      'cep': '30140-000',
      'telefone': '(31) 99999-9999',
      'valor_total': 'R$ 250,00',
      'observacoes': 'Cliente preferencial',
      'link_carrinho': 'https://app.limpamais.com/checkout?id=abc123',
      'cupom': 'DESCONTO10',
      'desconto': '10%'
    };

    const newValues: Record<string, string> = {};
    template?.variaveis?.forEach((variable) => {
      newValues[variable] = examples[variable] || `[${variable}]`;
    });
    setVariableValues(newValues);
  };

  const generateMessage = () => {
    if (!template) return '';
    
    let message = template.conteudo;
    Object.entries(variableValues).forEach(([variable, value]) => {
      message = message.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
    });
    
    return message;
  };

  const handleSend = async () => {
    if (!template || !telefone) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o número de telefone.',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    setSendStatus('idle');

    try {
      const message = generateMessage();

      const { error } = await supabase.functions.invoke('send-recovery-whatsapp', {
        body: {
          telefone,
          mensagem: message,
          carrinhoId: 'teste-' + Date.now()
        }
      });

      if (error) throw error;

      setSendStatus('success');
      toast({
        title: 'Mensagem enviada!',
        description: 'O teste foi enviado com sucesso para o WhatsApp.'
      });
    } catch (error: any) {
      console.error('Erro ao enviar teste:', error);
      setSendStatus('error');
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Não foi possível enviar a mensagem de teste.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!template) return null;

  const previewMessage = generateMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Testar Template: {template.nome}</DialogTitle>
          <DialogDescription>
            Envie uma mensagem de teste para um número de WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Telefone */}
          <div>
            <Label htmlFor="telefone">Número de Telefone (com DDD) *</Label>
            <Input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(31) 99999-9999"
              required
            />
          </div>

          {/* Variáveis */}
          {template.variaveis && template.variaveis.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Preencher Variáveis</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillExampleData}
                >
                  Preencher com Exemplos
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.variaveis.map((variable) => (
                  <div key={variable}>
                    <Label htmlFor={variable} className="text-xs">
                      <Badge variant="outline" className="font-mono mr-1">
                        {`{${variable}}`}
                      </Badge>
                    </Label>
                    <Input
                      id={variable}
                      value={variableValues[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      placeholder={`Valor para ${variable}`}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Preview */}
          <div>
            <Label>Preview da Mensagem</Label>
            <Card className="mt-2 p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <p className="text-sm whitespace-pre-wrap break-words">
                {previewMessage}
              </p>
            </Card>
          </div>

          {/* Status */}
          {sendStatus === 'success' && (
            <Card className="p-3 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-medium">Mensagem enviada com sucesso!</p>
              </div>
            </Card>
          )}

          {sendStatus === 'error' && (
            <Card className="p-3 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">Erro ao enviar mensagem</p>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Fechar
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !telefone}
            >
              {isSending ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Teste
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
