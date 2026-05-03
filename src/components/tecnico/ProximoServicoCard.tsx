import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Clock,
  User,
  Navigation,
  Wrench,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { calcularDistancia, calcularETAEstimado } from '@/hooks/useProximoServico';

interface ProximoServicoCardProps {
  servico: {
    id: string;
    nome_cliente: string;
    telefone: string;
    endereco: string;
    bairro: string | null;
    cidade: string | null;
    horario: string | null;
    valor_total: number;
    latitude: number | null;
    longitude: number | null;
    itens_carrinho: any[];
  };
  posicaoAtual?: { latitude: number; longitude: number } | null;
  onIniciarRota: () => void;
  onPular?: () => void;
  isLoading?: boolean;
}

export default function ProximoServicoCard({
  servico,
  posicaoAtual,
  onIniciarRota,
  onPular,
  isLoading = false,
}: ProximoServicoCardProps) {
  // Calcular distância e ETA se tivermos posição atual e do cliente
  let distanciaKm: number | null = null;
  let etaMinutos: number | null = null;

  if (posicaoAtual && servico.latitude && servico.longitude) {
    distanciaKm = calcularDistancia(
      posicaoAtual.latitude,
      posicaoAtual.longitude,
      servico.latitude,
      servico.longitude
    );
    etaMinutos = calcularETAEstimado(distanciaKm);
  }

  const getItensDescricao = () => {
    if (!servico?.itens_carrinho?.length) return 'Serviço';

    return servico.itens_carrinho
      .map((item: any) => item.nome || item.name || item.item || 'Serviço')
      .slice(0, 2)
      .join(', ') +
      (servico.itens_carrinho.length > 2
        ? ` +${servico.itens_carrinho.length - 2}`
        : '');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 dark:bg-primary/20 px-4 py-3 flex items-center gap-2">
          <div className="p-2 bg-primary/20 rounded-full">
            <Navigation className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-primary">Próximo Serviço</span>
          {servico.horario && (
            <Badge variant="outline" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              {servico.horario}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Cliente */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-muted rounded-full">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{servico.nome_cliente}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {servico.endereco}
                {servico.bairro && `, ${servico.bairro}`}
              </p>
            </div>
          </div>

          {/* Métricas */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {distanciaKm ? `${distanciaKm.toFixed(1)} km` : '--'}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {etaMinutos ? `~${etaMinutos} min` : '--'}
              </span>
            </div>
          </div>

          <Separator />

          {/* Serviço e Valor */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{getItensDescricao()}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(servico.valor_total)}
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-2 pt-2">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold"
              onClick={onIniciarRota}
              disabled={isLoading}
            >
              <Navigation className="mr-2 h-5 w-5" />
              INICIAR ROTA
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            {onPular && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={onPular}
                disabled={isLoading}
              >
                Pular este serviço
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
