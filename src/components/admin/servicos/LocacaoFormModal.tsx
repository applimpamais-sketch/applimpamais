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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Aluguel, AluguelInput } from '@/hooks/useAlugueisAdmin';

const formSchema = z.object({
  equipamento: z.string().min(1, 'Equipamento é obrigatório'),
  periodo_aluguel: z.string().min(1, 'Período é obrigatório'),
  preco: z.coerce.number().positive('Preço deve ser positivo'),
});

interface LocacaoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aluguel: Aluguel | null;
  onSubmit: (data: AluguelInput) => void;
  isLoading: boolean;
  existingEquipamentos: string[];
}

export function LocacaoFormModal({
  open,
  onOpenChange,
  aluguel,
  onSubmit,
  isLoading,
  existingEquipamentos,
}: LocacaoFormModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipamento: '',
      periodo_aluguel: '',
      preco: 0,
    },
  });

  useEffect(() => {
    if (aluguel) {
      form.reset({
        equipamento: aluguel.equipamento,
        periodo_aluguel: aluguel.periodo_aluguel,
        preco: aluguel.preco,
      });
    } else {
      form.reset({
        equipamento: '',
        periodo_aluguel: '',
        preco: 0,
      });
    }
  }, [aluguel, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      equipamento: values.equipamento,
      periodo_aluguel: values.periodo_aluguel,
      preco: values.preco,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {aluguel ? 'Editar Locação' : 'Nova Locação'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="equipamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipamento</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Ex: Extratora IPC A135"
                      list="equipamentos-list"
                    />
                  </FormControl>
                  <datalist id="equipamentos-list">
                    {existingEquipamentos.map((eq) => (
                      <option key={eq} value={eq} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periodo_aluguel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período de Aluguel</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Diária, Fim de Semana, Semanal" />
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : aluguel ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
