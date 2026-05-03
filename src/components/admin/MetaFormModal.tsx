import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface MetaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  meta?: any;
  isLoading?: boolean;
}

export default function MetaFormModal({
  isOpen,
  onClose,
  onSubmit,
  meta,
  isLoading,
}: MetaFormModalProps) {
  const [formData, setFormData] = useState({
    mes_referencia: meta?.mes_referencia || format(new Date(), 'yyyy-MM-01'),
    valor_meta: meta?.valor_meta || '',
    observacoes: meta?.observacoes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      valor_meta: Number(formData.valor_meta),
      valor_realizado: meta?.valor_realizado || 0,
      status: meta?.status || 'em_andamento',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meta ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="mes_referencia">Mês de Referência</Label>
            <Input
              id="mes_referencia"
              type="month"
              value={formData.mes_referencia}
              onChange={(e) =>
                setFormData({ ...formData, mes_referencia: e.target.value + '-01' })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="valor_meta">Valor da Meta (R$)</Label>
            <Input
              id="valor_meta"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor_meta}
              onChange={(e) =>
                setFormData({ ...formData, valor_meta: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
