import { motion } from 'framer-motion';
import { CheckCircle, DollarSign, Receipt, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';

interface ServicoConcluidoProps {
  nomeCliente: string;
  valorTotal: number;
  formaPagamento?: string | null;
  onVerRecibo?: () => void;
  onContinuar: () => void;
  temProximoServico?: boolean;
}

export default function ServicoConcluido({
  nomeCliente,
  valorTotal,
  formaPagamento,
  onVerRecibo,
  onContinuar,
  temProximoServico = false,
}: ServicoConcluidoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="overflow-hidden border-2 border-emerald-200 dark:border-emerald-800">
        {/* Header verde */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle className="h-12 w-12" />
          </motion.div>
          
          <motion.h2
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Serviço Concluído!
          </motion.h2>
          
          <motion.p
            className="text-white/90 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Cliente: {nomeCliente}
          </motion.p>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Valor */}
          <motion.div
            className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-medium">Valor Recebido</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(valorTotal)}
            </span>
          </motion.div>

          {/* Forma de Pagamento */}
          {formaPagamento && (
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Badge variant="secondary" className="text-sm px-4 py-1">
                💳 {formaPagamento}
              </Badge>
            </motion.div>
          )}

          {/* Botões */}
          <motion.div
            className="space-y-3 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {onVerRecibo && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onVerRecibo}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Ver Recibo
              </Button>
            )}

            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold"
              onClick={onContinuar}
            >
              {temProximoServico ? (
                <>
                  Ver Próximo Serviço
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                'Voltar para Lista'
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
