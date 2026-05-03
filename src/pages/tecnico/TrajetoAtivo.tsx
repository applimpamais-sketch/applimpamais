import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeoTracking } from '@/hooks/useGeoTracking';
import { useTrackingSession } from '@/hooks/useTrackingSession';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  CheckCircle,
  X,
  Clock,
  User,
  Phone,
  ExternalLink,
  Loader2,
  Radio,
  ArrowLeft,
} from 'lucide-react';
import TrackingMap from '@/components/tracking/TrackingMap';

interface TrackingSession {
  id: string;
  agendamento_id: string;
  status: 'em_rota' | 'chegou' | 'servico_em_andamento' | 'concluido' | 'cancelado';
  destino_latitude: number | null;
  destino_longitude: number | null;
  origem_latitude: number | null;
  origem_longitude: number | null;
  eta_minutos: number | null;
  distancia_metros: number | null;
}

interface Agendamento {
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
}

export default function TrajetoAtivo() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [origemPosition, setOrigemPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  const { updateStatus } = useTrackingSession();
  const { position, isTracking, error: geoError } = useGeoTracking({
    trackingSessionId: sessionId || '',
    enabled: !!sessionId && session?.status === 'em_rota',
    intervalMs: 10000,
  });

  // Timer para tempo decorrido
  useEffect(() => {
    if (!session || session.status !== 'em_rota') return;
    
    const interval = setInterval(() => {
      setTempoDecorrido((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.status]);

  // Buscar dados
  const fetchData = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData as TrackingSession);

      // Usar posição de origem como fallback inicial
      if (sessionData.origem_latitude && sessionData.origem_longitude) {
        setOrigemPosition({
          latitude: Number(sessionData.origem_latitude),
          longitude: Number(sessionData.origem_longitude),
        });
      }

      const { data: agendamentoData, error: agendamentoError } = await supabase
        .from('agendamentos')
        .select('id, nome_cliente, telefone, endereco, bairro, cidade, horario, valor_total, latitude, longitude')
        .eq('id', sessionData.agendamento_id)
        .single();

      if (agendamentoError) throw agendamentoError;
      setAgendamento(agendamentoData as Agendamento);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      toast.error('Erro ao carregar dados do trajeto');
      navigate('/tecnico/servicos');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Formatar tempo
  const formatTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatar distância
  const formatDistance = (metros: number | null) => {
    if (!metros) return '--';
    if (metros >= 1000) {
      return `${(metros / 1000).toFixed(1)} km`;
    }
    return `${metros} m`;
  };

  // Abrir Google Maps
  const handleAbrirMaps = () => {
    if (!agendamento) return;
    
    if (agendamento.latitude && agendamento.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${agendamento.latitude},${agendamento.longitude}&travelmode=driving`,
        '_blank'
      );
    } else {
      const enderecoCompleto = `${agendamento.endereco}, ${agendamento.bairro || ''}, ${agendamento.cidade || ''}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoCompleto)}&travelmode=driving`,
        '_blank'
      );
    }
  };

  // Ligar para cliente
  const handleLigar = () => {
    if (agendamento?.telefone) {
      window.open(`tel:${agendamento.telefone}`, '_self');
    }
  };

  // Marcar chegada
  const handleChegou = async () => {
    if (!sessionId || !agendamento) return;
    setIsUpdating(true);

    try {
      const success = await updateStatus(sessionId, 'chegou');
      
      if (success) {
        await supabase
          .from('agendamentos')
          .update({ status: 'em_andamento' })
          .eq('id', agendamento.id);

        toast.success('Chegada registrada!');
        navigate('/tecnico/servicos');
      }
    } catch (err) {
      console.error('Erro ao registrar chegada:', err);
      toast.error('Erro ao registrar chegada');
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancelar trajeto
  const handleCancelar = async () => {
    if (!sessionId || !agendamento) return;
    setIsUpdating(true);

    try {
      const success = await updateStatus(sessionId, 'cancelado');
      
      if (success) {
        await supabase
          .from('agendamentos')
          .update({ status: 'confirmado' })
          .eq('id', agendamento.id);

        toast.info('Trajeto cancelado');
        navigate('/tecnico/servicos');
      }
    } catch (err) {
      console.error('Erro ao cancelar trajeto:', err);
      toast.error('Erro ao cancelar trajeto');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !agendamento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center p-6">
          <p className="text-muted-foreground">Trajeto não encontrado</p>
          <Button onClick={() => navigate('/tecnico/servicos')} className="mt-4">
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  const destinoPosition = session.destino_latitude && session.destino_longitude
    ? { latitude: Number(session.destino_latitude), longitude: Number(session.destino_longitude) }
    : agendamento.latitude && agendamento.longitude
      ? { latitude: Number(agendamento.latitude), longitude: Number(agendamento.longitude) }
      : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header compacto absoluto sobre o mapa */}
      <header className="absolute top-0 left-0 right-0 z-50 safe-area-top">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 dark:bg-gray-800/90 shadow-md backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
            onClick={() => navigate('/tecnico/servicos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Badge className="bg-white/90 dark:bg-gray-800/90 text-foreground shadow-md backdrop-blur-sm border-0 px-3 py-1.5">
            <Radio className="h-3 w-3 mr-1.5 text-green-500 animate-pulse" />
            Trajeto Ativo
          </Badge>
          <div className="w-10" /> {/* Spacer para centralizar badge */}
        </div>
      </header>

      {/* Mapa ocupando 50vh */}
      <div className="h-[50vh] relative">
        <TrackingMap
          tecnicoPosition={position || origemPosition}
          destinoPosition={destinoPosition}
          etaMinutos={session.eta_minutos}
          distanciaMetros={session.distancia_metros}
        />
      </div>

      {/* Conteúdo inferior com cantos arredondados subindo sobre o mapa */}
      <div className="flex-1 bg-background rounded-t-3xl -mt-6 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="p-4 space-y-4">
          {/* Handle visual */}
          <div className="w-12 h-1.5 bg-muted rounded-full mx-auto -mt-1 mb-2" />

          {/* Card do cliente com botão de ligar */}
          <div className="flex items-center gap-3 p-4 bg-card rounded-xl border shadow-sm">
            <div className="p-2.5 bg-primary/10 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{agendamento.nome_cliente}</p>
              <p className="text-sm text-muted-foreground truncate">
                {agendamento.endereco}
                {agendamento.bairro && `, ${agendamento.bairro}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 h-10 w-10"
              onClick={handleLigar}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>

          {/* Métricas compactas em linha */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold font-mono">{formatTempo(tempoDecorrido)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tempo</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold">{formatDistance(session.distancia_metros)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Distância</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Navigation className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold">{session.eta_minutos ? `${session.eta_minutos}` : '--'}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">ETA (min)</p>
            </div>
          </div>

          {/* GPS Status */}
          {isTracking && position && (
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 py-1">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              GPS ativo • Enviando localização
            </div>
          )}

          {geoError && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 py-1">
              <div className="h-2 w-2 bg-red-500 rounded-full" />
              Erro de GPS: {geoError}
            </div>
          )}

          {/* Abrir Google Maps */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12"
            onClick={handleAbrirMaps}
          >
            <Navigation className="mr-2 h-5 w-5" />
            Abrir no Google Maps
            <ExternalLink className="ml-2 h-4 w-4 opacity-50" />
          </Button>

          {/* CTA Principal - CHEGUEI */}
          <Button
            size="lg"
            className="w-full h-16 text-lg font-bold bg-emerald-600 hover:bg-emerald-700"
            onClick={handleChegou}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-6 w-6" />
            )}
            CHEGUEI NO LOCAL
          </Button>

          {/* Cancelar - menos proeminente */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleCancelar}
            disabled={isUpdating}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar Trajeto
          </Button>
        </div>
      </div>
    </div>
  );
}
