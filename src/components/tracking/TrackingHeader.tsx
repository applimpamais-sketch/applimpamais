import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, MapPin, Wrench, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORM_NAME } from '@/lib/constants';

interface TrackingHeaderProps {
  status: 'em_rota' | 'chegou' | 'servico_em_andamento' | 'concluido' | 'cancelado';
  etaMinutos: number | null;
  distanciaMetros: number | null;
  tecnicoNome: string | null;
}

const statusConfig = {
  em_rota: {
    bgGradient: 'from-blue-500 to-blue-600',
    textColor: 'text-white',
    icon: Clock,
    title: 'A caminho',
    showEta: true,
  },
  chegou: {
    bgGradient: 'from-green-500 to-emerald-600',
    textColor: 'text-white',
    icon: MapPin,
    title: 'Chegou!',
    showEta: false,
  },
  servico_em_andamento: {
    bgGradient: 'from-purple-500 to-purple-600',
    textColor: 'text-white',
    icon: Wrench,
    title: 'Em andamento',
    showEta: false,
  },
  concluido: {
    bgGradient: 'from-emerald-500 to-green-600',
    textColor: 'text-white',
    icon: CheckCircle,
    title: 'Concluído!',
    showEta: false,
  },
  cancelado: {
    bgGradient: 'from-red-500 to-red-600',
    textColor: 'text-white',
    icon: AlertCircle,
    title: 'Cancelado',
    showEta: false,
  },
};

export default function TrackingHeader({
  status,
  etaMinutos,
  distanciaMetros,
  tecnicoNome,
}: TrackingHeaderProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatETA = (minutos: number) => {
    if (minutos < 60) {
      return minutos.toString();
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h${mins}` : `${horas}h`;
  };

  const formatDistance = (metros: number) => {
    if (metros >= 1000) {
      return `${(metros / 1000).toFixed(1)} km`;
    }
    return `${metros} m`;
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 text-center',
        `bg-gradient-to-br ${config.bgGradient}`
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-white rounded-full blur-2xl" />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {config.showEta && etaMinutos !== null ? (
            <motion.div
              key="eta"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {/* ETA Grande */}
              <div className="flex items-baseline justify-center gap-2">
                <motion.span
                  className="text-6xl font-bold tracking-tight"
                  key={etaMinutos}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatETA(etaMinutos)}
                </motion.span>
                <span className="text-2xl font-medium opacity-90">
                  {etaMinutos < 60 ? 'min' : ''}
                </span>
              </div>
              
              <p className="text-lg opacity-90 mt-1">Chegada estimada</p>
              
              {/* Distância */}
              {distanciaMetros !== null && (
                <motion.p
                  className="text-sm opacity-75 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  transition={{ delay: 0.2 }}
                >
                  📍 {formatDistance(distanciaMetros)} restantes
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="py-4"
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4"
                animate={{
                  scale: status === 'chegou' ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: status === 'chegou' ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                <StatusIcon className="h-10 w-10" />
              </motion.div>
              
              <h2 className="text-3xl font-bold">{config.title}</h2>
              
              {status === 'chegou' && (
                <p className="text-lg opacity-90 mt-2">
                  {tecnicoNome || 'O técnico'} está no local
                </p>
              )}
              
              {status === 'servico_em_andamento' && (
                <p className="text-lg opacity-90 mt-2">
                  Serviço em progresso
                </p>
              )}
              
              {status === 'concluido' && (
                <p className="text-lg opacity-90 mt-2">
                  Obrigado por escolher a {PLATFORM_NAME}!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Técnico info (quando em rota) */}
        {status === 'em_rota' && tecnicoNome && (
          <motion.div
            className="mt-4 pt-4 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm opacity-90">
              🚗 <span className="font-medium">{tecnicoNome}</span> está a caminho
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
