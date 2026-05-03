import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/format';
import { MeuServico } from '@/hooks/useMeusServicos';
import { Loader2 } from 'lucide-react';

interface ConfirmarPagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servico: MeuServico;
  onSuccess: () => void;
  onConfirmado?: (formaPagamento: string) => void;
}

const formasPagamento = [
  { value: 'dinheiro', label: '💵 Dinheiro' },
  { value: 'pix', label: '📱 PIX' },
  { value: 'cartao', label: '💳 Cartão (Débito/Crédito)' },
  { value: 'transferencia', label: '🏦 Transferência' },
];

export default function ConfirmarPagamentoModal({
  open,
  onOpenChange,
  servico,
  onSuccess,
  onConfirmado,
}: ConfirmarPagamentoModalProps) {
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmar = async () => {
    if (!formaPagamento) {
      toast.error('Selecione a forma de pagamento');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 [ConfirmarPagamento] Tentando atualizar:', {
        agendamento_id: servico.id,
        status_atual: servico.status,
        novo_status: 'pago',
        tecnico_id: user.id,
        valor: servico.valor_total,
        forma_pagamento: formaPagamento
      });

      // Usar supabase com type assertion para evitar erros de tipo
      const supabaseClient = supabase as any;

      // Verificar se já existe pagamento
      const { data: pagamentoExistente } = await supabaseClient
        .from('pagamentos_agendamentos')
        .select('id')
        .eq('agendamento_id', servico.id)
        .maybeSingle();

      if (!pagamentoExistente) {
        // 1. Inserir novo pagamento
        const { error: pagamentoError } = await supabaseClient
          .from('pagamentos_agendamentos')
          .insert({
            agendamento_id: servico.id,
            valor_pago: servico.valor_total,
            forma_pagamento: formaPagamento,
            status: 'pago',
            data_pagamento: new Date().toISOString(),
            observacoes: observacoes || null,
          });

        if (pagamentoError) throw pagamentoError;
      } else {
        // 1. Atualizar pagamento existente
        const { error: pagamentoError } = await supabaseClient
          .from('pagamentos_agendamentos')
          .update({
            valor_pago: servico.valor_total,
            forma_pagamento: formaPagamento,
            status: 'pago',
            data_pagamento: new Date().toISOString(),
            observacoes: observacoes || null,
          })
          .eq('id', pagamentoExistente.id);

        if (pagamentoError) throw pagamentoError;
      }

      // 2. Atualizar agendamento
      const { error: agendamentoError } = await supabaseClient
        .from('agendamentos')
        .update({
          status: 'pago',
          pago_em: new Date().toISOString(),
          pago_por: user.id,
          forma_pagamento: formaPagamento,
        })
        .eq('id', servico.id);

      if (agendamentoError) throw agendamentoError;

      // 3. Chamar edge function para enviar WhatsApp
      try {
        await supabase.functions.invoke('notify-payment-received', {
          body: {
            agendamentoId: servico.id,
            tecnicoId: user.id,
            clienteNome: servico.nome_cliente,
            clienteTelefone: servico.telefone,
            valorTotal: servico.valor_total,
            formaPagamento: formaPagamento,
            observacoes: observacoes,
            dataAgendamento: servico.data_agendamento,
            horario: servico.horario,
          },
        });
      } catch (whatsappError) {
        console.error('Erro ao enviar WhatsApp:', whatsappError);
        // Não falha a operação se o WhatsApp falhar
      }

      toast.success('Pagamento confirmado com sucesso!');
      
      // Se tem callback de conclusão, usa ele; senão comportamento padrão
      if (onConfirmado) {
        onConfirmado(formaPagamento);
      } else {
        onSuccess();
        onOpenChange(false);
      }
      setFormaPagamento('');
      setObservacoes('');
    } catch (error: any) {
      console.error('Erro ao confirmar pagamento:', error);
      
      // Detectar e tratar erro de RLS especificamente
      if (error.code === 'PGRST301' || error.message?.toLowerCase().includes('policy')) {
        toast.error('⚠️ Erro de permissão. Você não tem autorização para confirmar este pagamento. Contate o administrador.');
      } else if (error.message?.toLowerCase().includes('jwt') || error.code === '401') {
        toast.error('🔒 Sessão expirada. Faça login novamente.');
      } else {
        toast.error(error.message || 'Erro ao confirmar pagamento');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>✅ Confirmar Recebimento de Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-1">
            <div className="text-sm text-muted-foreground">Cliente</div>
            <div className="font-medium">{servico.nome_cliente}</div>
            <div className="text-sm text-muted-foreground mt-2">Valor Total</div>
            <div className="text-2xl font-bold">{formatCurrency(servico.valor_total)}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forma-pagamento">
              💳 Forma de Pagamento <span className="text-destructive">*</span>
            </Label>
            <Select value={formaPagamento} onValueChange={setFormaPagamento}>
              <SelectTrigger id="forma-pagamento">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {formasPagamento.map((forma) => (
                  <SelectItem key={forma.value} value={forma.value}>
                    {forma.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">📝 Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Cliente solicitou nota fiscal..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmar}
              disabled={isSubmitting || !formaPagamento}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                '✅ Confirmar Pagamento'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
