import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useIntegracoes } from '@/hooks/useIntegracoes';
import { useEffect } from 'react';

interface WebhookFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: any;
}

interface WebhookFormData {
  nome: string;
  url: string;
  evento: string;
  metodo: string;
}

const eventos = [
  'agendamento.criado',
  'agendamento.atualizado',
  'agendamento.cancelado',
  'pagamento.confirmado',
  'carrinho.abandonado',
  'cupom.usado',
];

export default function WebhookFormModal({ open, onOpenChange, webhook }: WebhookFormModalProps) {
  const { createIntegracao, updateIntegracao } = useIntegracoes();
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<WebhookFormData>();

  useEffect(() => {
    if (webhook) {
      setValue('nome', webhook.nome);
      setValue('url', webhook.configuracao?.url || '');
      setValue('evento', webhook.configuracao?.evento || '');
      setValue('metodo', webhook.configuracao?.metodo || 'POST');
    } else {
      reset({
        nome: '',
        url: '',
        evento: '',
        metodo: 'POST',
      });
    }
  }, [webhook, setValue, reset]);

  const onSubmit = async (data: WebhookFormData) => {
    const integracaoData = {
      tipo: 'webhook' as const,
      nome: data.nome,
      configuracao: {
        url: data.url,
        evento: data.evento,
        metodo: data.metodo,
      },
      status: 'ativo' as const,
    };

    if (webhook) {
      await updateIntegracao.mutateAsync({ id: webhook.id, ...integracaoData });
    } else {
      await createIntegracao.mutateAsync(integracaoData);
    }

    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{webhook ? 'Editar' : 'Novo'} Webhook</DialogTitle>
          <DialogDescription>
            Configure o endpoint que receberá os eventos do sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Webhook</Label>
            <Input
              id="nome"
              placeholder="Ex: Notificar Novo Agendamento"
              {...register('nome', { required: 'Nome é obrigatório' })}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL do Endpoint</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://api.exemplo.com/webhook"
              {...register('url', { 
                required: 'URL é obrigatória',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'URL inválida'
                }
              })}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="evento">Evento</Label>
            <Select
              onValueChange={(value) => setValue('evento', value)}
              defaultValue={webhook?.configuracao?.evento}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o evento" />
              </SelectTrigger>
              <SelectContent>
                {eventos.map((evento) => (
                  <SelectItem key={evento} value={evento}>
                    {evento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodo">Método HTTP</Label>
            <Select
              onValueChange={(value) => setValue('metodo', value)}
              defaultValue={webhook?.configuracao?.metodo || 'POST'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {webhook ? 'Atualizar' : 'Criar'} Webhook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
