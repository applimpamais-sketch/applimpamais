import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Servico, ServicoInput } from '@/hooks/useServicosAdmin';

const CATEGORIAS_PADRAO = [
  'MAIS AGENDADOS',
  'ESTOFADOS',
  'COLCHÕES',
  'TAPETES E CARPETES',
  'CADEIRAS',
  'AUTOMOTIVO',
  'OUTROS',
];

const servicoSchema = z.object({
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  subcategoria: z.string().min(1, 'Subcategoria é obrigatória'),
  item: z.string().min(1, 'Nome do item é obrigatório'),
  tamanho: z.string().optional().nullable(),
  preco_limpeza: z.coerce.number().min(0, 'Preço deve ser positivo').optional().nullable(),
  preco_impermeabilizacao: z.coerce.number().optional().nullable(),
  preco_limpeza_impermeabilizacao: z.coerce.number().optional().nullable(),
});

type FormData = z.infer<typeof servicoSchema>;

interface ServicoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servico: Servico | null;
  onSubmit: (data: ServicoInput) => void;
  isLoading?: boolean;
  existingCategorias?: string[];
  existingSubcategorias?: string[];
}

export function ServicoFormModal({
  open,
  onOpenChange,
  servico,
  onSubmit,
  isLoading,
  existingCategorias = [],
  existingSubcategorias = [],
}: ServicoFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(servicoSchema),
    defaultValues: {
      categoria: '',
      subcategoria: '',
      item: '',
      tamanho: '',
      preco_limpeza: null,
      preco_impermeabilizacao: null,
      preco_limpeza_impermeabilizacao: null,
    },
  });

  const watchCategoria = watch('categoria');

  // Reset form when modal opens/closes or service changes
  useEffect(() => {
    if (open) {
      if (servico) {
        reset({
          categoria: servico.categoria,
          subcategoria: servico.subcategoria,
          item: servico.item,
          tamanho: servico.tamanho || '',
          preco_limpeza: servico.preco_limpeza,
          preco_impermeabilizacao: servico.preco_impermeabilizacao,
          preco_limpeza_impermeabilizacao: servico.preco_limpeza_impermeabilizacao,
        });
      } else {
        reset({
          categoria: '',
          subcategoria: '',
          item: '',
          tamanho: '',
          preco_limpeza: null,
          preco_impermeabilizacao: null,
          preco_limpeza_impermeabilizacao: null,
        });
      }
    }
  }, [open, servico, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      categoria: data.categoria,
      subcategoria: data.subcategoria,
      item: data.item,
      tamanho: data.tamanho || null,
      preco_limpeza: data.preco_limpeza || null,
      preco_impermeabilizacao: data.preco_impermeabilizacao || null,
      preco_limpeza_impermeabilizacao: data.preco_limpeza_impermeabilizacao || null,
    });
  };

  const allCategorias = [...new Set([...CATEGORIAS_PADRAO, ...existingCategorias])];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {servico ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select
              value={watchCategoria}
              onValueChange={(v) => setValue('categoria', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione ou digite" />
              </SelectTrigger>
              <SelectContent>
                {allCategorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Ou digite uma nova categoria"
              {...register('categoria')}
              className="mt-1"
            />
            {errors.categoria && (
              <p className="text-sm text-destructive">{errors.categoria.message}</p>
            )}
          </div>

          {/* Subcategoria */}
          <div className="space-y-2">
            <Label htmlFor="subcategoria">Subcategoria *</Label>
            <Input
              placeholder="Ex: SOFÁ, COLCHÃO, TAPETE"
              {...register('subcategoria')}
            />
            {errors.subcategoria && (
              <p className="text-sm text-destructive">{errors.subcategoria.message}</p>
            )}
          </div>

          {/* Item */}
          <div className="space-y-2">
            <Label htmlFor="item">Nome do Item *</Label>
            <Input
              placeholder="Ex: Sofá 3 Lugares, Colchão Casal"
              {...register('item')}
            />
            {errors.item && (
              <p className="text-sm text-destructive">{errors.item.message}</p>
            )}
          </div>

          {/* Tamanho */}
          <div className="space-y-2">
            <Label htmlFor="tamanho">Tamanho (opcional)</Label>
            <Input
              placeholder="Ex: até 2m², Grande"
              {...register('tamanho')}
            />
          </div>

          {/* Preços */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco_limpeza">Preço Limpeza</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('preco_limpeza')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco_impermeabilizacao">Impermeabilização</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('preco_impermeabilizacao')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco_limpeza_impermeabilizacao">Combo (L+I)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('preco_limpeza_impermeabilizacao')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : servico ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
