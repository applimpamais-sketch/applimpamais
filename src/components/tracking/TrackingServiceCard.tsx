import { motion } from 'framer-motion';
import { Wrench, Truck, Car, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface TrackingServiceCardProps {
  itensCarrinho: any[];
  valorTotal: number;
  tecnicoNome?: string | null;
  isLocacao: boolean;
}

export default function TrackingServiceCard({
  itensCarrinho,
  valorTotal,
  tecnicoNome,
  isLocacao,
}: TrackingServiceCardProps) {
  const getItensDescricao = () => {
    if (!itensCarrinho?.length) return isLocacao ? 'Locação de equipamento' : 'Serviço';

    return itensCarrinho
      .map((item: any) => item.nome || item.name || item.item || 'Serviço')
      .slice(0, 2)
      .join(', ') +
      (itensCarrinho.length > 2 ? ` +${itensCarrinho.length - 2}` : '');
  };

  const ServiceIcon = isLocacao ? Truck : Wrench;

  return (
    <motion.div
      className="bg-card rounded-xl shadow-sm border overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Ícone do serviço */}
        <div className={`p-3 rounded-xl ${isLocacao ? 'bg-orange-500/10' : 'bg-primary/10'}`}>
          <ServiceIcon className={`h-8 w-8 ${isLocacao ? 'text-orange-500' : 'text-primary'}`} />
        </div>

        {/* Informações do serviço */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base truncate">
            {getItensDescricao()}
          </h3>
          
          <div className="flex items-center gap-2 mt-1.5">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(valorTotal)}
            </span>
          </div>

          {tecnicoNome && (
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              <Car className="h-3.5 w-3.5" />
              <span>{tecnicoNome}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
