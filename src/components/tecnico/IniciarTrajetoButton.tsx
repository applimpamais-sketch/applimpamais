import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Navigation, Loader2, MapPin, Clock, Route } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTrackingSession } from '@/hooks/useTrackingSession';

interface IniciarTrajetoButtonProps {
  agendamentoId: string;
  nomeCliente: string;
  telefoneCliente: string;
  endereco: string;
  latitude?: number | null;
  longitude?: number | null;
  itensCarrinho?: any[];
  onTrackingStarted?: (sessionId: string, token: string) => void;
  redirectToTrajeto?: boolean;
  className?: string;
}

// Calcular distância entre dois pontos (Haversine)
function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Formatar distância para exibição
function formatarDistancia(metros: number): string {
  if (metros >= 1000) {
    return `${(metros / 1000).toFixed(1)} km`;
  }
  return `${Math.round(metros)} m`;
}

// Estimar tempo de trajeto (velocidade média 30km/h em cidade)
function estimarTempo(metros: number): string {
  const minutos = Math.round((metros / 1000) / 30 * 60);
  if (minutos < 60) {
    return `~${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `~${horas}h${mins > 0 ? ` ${mins}min` : ''}`;
}

export default function IniciarTrajetoButton({
  agendamentoId,
  nomeCliente,
  telefoneCliente,
  endereco,
  latitude,
  longitude,
  itensCarrinho = [],
  onTrackingStarted,
  redirectToTrajeto = true,
  className = '',
}: IniciarTrajetoButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [tecnicoNome, setTecnicoNome] = useState<string>('Técnico');
  const [posicaoAtual, setPosicaoAtual] = useState<{lat: number, lng: number} | null>(null);
  const [distanciaEstimada, setDistanciaEstimada] = useState<number | null>(null);
  
  const { createSession } = useTrackingSession();

  // Buscar nome do técnico
  useEffect(() => {
    if (!user?.id) return;
    
    supabase
      .from('profiles')
      .select('nome_completo')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.nome_completo) {
          setTecnicoNome(data.nome_completo);
        }
      });
  }, [user?.id]);

  // Calcular distância quando temos origem e destino
  useEffect(() => {
    if (posicaoAtual && latitude && longitude) {
      const dist = calcularDistancia(
        posicaoAtual.lat, 
        posicaoAtual.lng, 
        latitude, 
        longitude
      );
      setDistanciaEstimada(dist);
    }
  }, [posicaoAtual, latitude, longitude]);

  const handleClick = async () => {
    setIsCapturingGPS(true);
    
    try {
      // Capturar GPS ANTES de mostrar confirmação
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });
      
      setPosicaoAtual({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      
      setShowConfirm(true);
    } catch (error: any) {
      console.error('Erro ao capturar GPS:', error);
      if (error.code === 1) {
        toast.error('Permissão de localização negada. Habilite nas configurações do navegador.');
      } else if (error.code === 2) {
        toast.error('Não foi possível determinar sua localização.');
      } else {
        toast.error('Tempo esgotado ao obter localização. Tente novamente.');
      }
    } finally {
      setIsCapturingGPS(false);
    }
  };

  const handleConfirm = async () => {
    if (!user?.id) {
      toast.error('Você precisa estar logado');
      return;
    }

    if (!posicaoAtual) {
      toast.error('Posição atual não disponível');
      return;
    }

    setIsStarting(true);

    try {
      // Criar sessão de tracking COM posição de origem
      const session = await createSession({
        agendamentoId,
        tecnicoId: user.id,
        tecnicoNome: tecnicoNome,
        destinoLatitude: latitude,
        destinoLongitude: longitude,
        origemLatitude: posicaoAtual.lat,
        origemLongitude: posicaoAtual.lng,
      });

      if (!session) {
        throw new Error('Falha ao criar sessão de tracking');
      }

      // Inserir primeira posição na tabela tracking_positions
      await supabase.from('tracking_positions').insert({
        tracking_session_id: session.id,
        latitude: posicaoAtual.lat,
        longitude: posicaoAtual.lng,
      });

      // Atualizar status do agendamento para "em_rota"
      const { error: updateError } = await supabase
        .from('agendamentos')
        .update({ status: 'em_rota' })
        .eq('id', agendamentoId);

      if (updateError) {
        console.error('Erro ao atualizar agendamento:', updateError);
      }

      // Detectar tipo de serviço e extrair descrição dos itens
      const isAluguel = itensCarrinho.some(item => 
        (item.name || item.nome || '').toLowerCase().includes('aluguel')
      );
      
      const itensDescricao = itensCarrinho
        .map(item => item.name || item.nome || 'Serviço')
        .join(', ');

      // Enviar notificação WhatsApp ao cliente com link de tracking
      try {
        const baseUrl = window.location.origin;
        const trackingUrl = `${baseUrl}/tracking/${session.token_publico}`;

        await supabase.functions.invoke('send-tracking-notification', {
          body: {
            agendamentoId: agendamentoId,
            telefone: telefoneCliente,
            nomeCliente: nomeCliente,
            tecnicoNome: tecnicoNome,
            trackingUrl: trackingUrl,
            tipoServico: isAluguel ? 'entrega' : 'servico',
            itensDescricao: itensDescricao,
          },
        });

        toast.success('Cliente notificado via WhatsApp!');
      } catch (whatsappError) {
        console.error('Erro ao enviar WhatsApp:', whatsappError);
        // Não bloquear por causa do WhatsApp
      }

      toast.success('Trajeto iniciado! O cliente está acompanhando sua localização.');
      
      onTrackingStarted?.(session.id, session.token_publico);
      
      // Redirecionar para tela fullscreen de trajeto ou abrir Google Maps
      if (redirectToTrajeto) {
        navigate(`/tecnico/trajeto/${session.id}`);
      } else {
        // Abrir Google Maps para navegação (comportamento antigo)
        if (latitude && longitude) {
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
            '_blank'
          );
        } else if (endereco) {
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`,
            '_blank'
          );
        }
      }
    } catch (error: any) {
      console.error('Erro ao iniciar trajeto:', error);
      toast.error('Erro ao iniciar trajeto');
    } finally {
      setIsStarting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isStarting || isCapturingGPS}
        className={`gap-2 ${className}`}
        variant="default"
      >
        {isCapturingGPS ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Localizando...
          </>
        ) : isStarting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
        {!isCapturingGPS && 'Iniciar Trajeto'}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-500" />
              Iniciar Trajeto
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Ao confirmar, o cliente <strong className="text-foreground">{nomeCliente}</strong> receberá um link via WhatsApp para acompanhar sua localização em tempo real.
                </p>
                
                {/* Origem - Posição atual do técnico */}
                {posicaoAtual && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">Sua localização</p>
                        <p className="text-sm text-foreground">
                          {posicaoAtual.lat.toFixed(6)}, {posicaoAtual.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Destino */}
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-0.5">Destino</p>
                      <p className="text-sm text-foreground">{endereco}</p>
                    </div>
                  </div>
                </div>

                {/* Estimativas de distância e tempo */}
                {distanciaEstimada && (
                  <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatarDistancia(distanciaEstimada)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{estimarTempo(distanciaEstimada)}</span>
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  A navegação será aberta automaticamente após confirmar.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isStarting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isStarting}
              className="gap-2"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {isStarting ? 'Iniciando...' : 'Confirmar e Iniciar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
