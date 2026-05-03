import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Upsell, UpsellInput } from '@/hooks/useUpsellsAdmin';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  preco: z.coerce.number().positive('Preço deve ser positivo'),
  aplicavel_servicos: z.boolean(),
  aplicavel_locacoes: z.boolean(),
});

interface UpsellFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upsell: Upsell | null;
  onSubmit: (data: UpsellInput) => void;
  isLoading: boolean;
}

export function UpsellFormModal({
  open,
  onOpenChange,
  upsell,
  onSubmit,
  isLoading,
}: UpsellFormModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      preco: 0,
      aplicavel_servicos: false,
      aplicavel_locacoes: false,
    },
  });

  useEffect(() => {
    if (upsell) {
      form.reset({
        nome: upsell.nome,
        descricao: upsell.descricao || '',
        preco: upsell.preco,
        aplicavel_servicos: upsell.aplicavel_a?.includes('servicos') || false,
        aplicavel_locacoes: upsell.aplicavel_a?.includes('locacoes') || false,
      });
    } else {
      form.reset({
        nome: '',
        descricao: '',
        preco: 0,
        aplicavel_servicos: false,
        aplicavel_locacoes: false,
      });
    }
  }, [upsell, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const aplicavel_a: string[] = [];
    if (values.aplicavel_servicos) aplicavel_a.push('servicos');
    if (values.aplicavel_locacoes) aplicavel_a.push('locacoes');

    onSubmit({
      nome: values.nome,
      descricao: values.descricao || null,
      preco: values.preco,
      aplicavel_a,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {upsell ? 'Editar Upsell' : 'Novo Upsell'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Kit Shampoo Estofados" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descrição do produto adicional..."
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01" 
                      min="0"
                      placeholder="0.00" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Aplicável a:</FormLabel>
              <FormDescription>
                Selecione onde este upsell pode ser oferecido
              </FormDescription>
              
              <FormField
                control={form.control}
                name="aplicavel_servicos"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Serviços
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aplicavel_locacoes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Locações
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : upsell ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
