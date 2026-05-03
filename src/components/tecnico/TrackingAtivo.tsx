import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  CheckCircle, 
  MapPin, 
  Clock, 
  X,
  Loader2,
  Radio,
  ChevronRight
} from 'lucide-react';
import { useGeoTracking } from '@/hooks/useGeoTracking';
import { useTrackingSession } from '@/hooks/useTrackingSession';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrackingAtivoProps {
  sessionId: string;
  agendamentoId: string;
  nomeCliente: string;
  endereco: string;
  onChegou?: () => void;
  onCancelado?: () => void;
}

export default function TrackingAtivo({
  sessionId,
  agendamentoId,
  nomeCliente,
  endereco,
  onChegou,
  onCancelado,
}: TrackingAtivoProps) {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  
  const { updateStatus } = useTrackingSession();
  const { position, isTracking, error: geoError } = useGeoTracking({
    trackingSessionId: sessionId,
    enabled: true,
    intervalMs: 10000,
  });

  // Timer para tempo decorrido
  useEffect(() => {
    const interval = setInterval(() => {
      setTempoDecorrido((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Formatar tempo
  const formatTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Navegar para tela fullscreen de trajeto
  const handleOpenTrajeto = () => {
    navigate(`/tecnico/trajeto/${sessionId}`);
  };

  // Marcar chegada
  const handleChegou = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegação ao clicar no botão
    setIsUpdating(true);

    try {
      const success = await updateStatus(sessionId, 'chegou');
      
      if (success) {
        await supabase
          .from('agendamentos')
          .update({ status: 'em_andamento' })
          .eq('id', agendamentoId);

        toast.success('Chegada registrada! Bom trabalho!');
        onChegou?.();
      }
    } catch (err) {
      console.error('Erro ao registrar chegada:', err);
      toast.error('Erro ao registrar chegada');
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancelar trajeto
  const handleCancelar = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegação ao clicar no botão
    setIsUpdating(true);

    try {
      const success = await updateStatus(sessionId, 'cancelado');
      
      if (success) {
        await supabase
          .from('agendamentos')
          .update({ status: 'confirmado' })
          .eq('id', agendamentoId);

        toast.info('Trajeto cancelado');
        onCancelado?.();
      }
    } catch (err) {
      console.error('Erro ao cancelar trajeto:', err);
      toast.error('Erro ao cancelar trajeto');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card 
      className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleOpenTrajeto}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <div className="relative">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            Trajeto Ativo
          </span>
          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            <Radio className="h-3 w-3 mr-1 animate-pulse" />
            Ao Vivo
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info do cliente */}
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="font-medium">{nomeCliente}</p>
          <div className="flex items-start gap-2 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{endereco}</span>
          </div>
        </div>

        {/* Status do GPS */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Tempo de trajeto</span>
          </div>
          <span className="text-lg font-mono font-bold text-blue-600">
            {formatTempo(tempoDecorrido)}
          </span>
        </div>

        {/* Status de localização */}
        {isTracking && position && (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            GPS ativo • Enviando localização
          </div>
        )}

        {geoError && (
          <div className="flex items-center gap-2 text-xs text-red-600">
            <div className="h-2 w-2 bg-red-500 rounded-full" />
            Erro de GPS: {geoError}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancelar}
            disabled={isUpdating}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleChegou}
            disabled={isUpdating}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
            Cheguei!
          </Button>
        </div>

        {/* Indicador visual de clicável */}
        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-muted-foreground border-t border-blue-200/50 dark:border-blue-800/50">
          <span>Toque para ver mapa ao vivo</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
