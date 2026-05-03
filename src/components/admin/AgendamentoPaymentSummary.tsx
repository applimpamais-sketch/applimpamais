import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Wallet } from 'lucide-react';
import { Agendamento } from '@/hooks/useAgendamentos';
import { formatCurrency } from '@/utils/format';

interface AgendamentoPaymentSummaryProps {
  agendamento: Agendamento;
}

export default function AgendamentoPaymentSummary({ agendamento }: AgendamentoPaymentSummaryProps) {
  // Calcular subtotal (sem desconto e frete) com validação NaN
  const valorTotal = agendamento.valor_total || 0;
  const valorDesconto = agendamento.valor_desconto || 0;
  const valorFrete = agendamento.valor_frete || 0;
  const subtotal = valorTotal + valorDesconto - valorFrete;

  return (
    <Card className="backdrop-blur-md bg-gradient-to-br from-emerald-500/5 via-primary/5 to-primary/10 rounded-2xl border-emerald-500/20 shadow-sm h-full hover:shadow-md transition-shadow">
      <CardHeader className="py-4 px-5">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg">
            <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Resumo de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {valorDesconto > 0 && (
          <div className="flex justify-between text-sm items-start">
            <span className="text-muted-foreground flex items-center gap-2 flex-wrap">
              Desconto
              {agendamento.cupom_codigo && (
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  {agendamento.cupom_codigo}
                </Badge>
              )}
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              -{formatCurrency(valorDesconto)}
            </span>
          </div>
        )}

        {valorFrete > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span className="font-medium">{formatCurrency(valorFrete)}</span>
          </div>
        )}

        <Separator className="my-3" />

        <div className="flex justify-between items-center pt-1">
          <span className="text-base font-semibold">Total</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(valorTotal)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
