import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import TrackingMap from '@/components/tracking/TrackingMap';
import TrackingAddressCard from '@/components/tracking/TrackingAddressCard';
import TrackingServiceCard from '@/components/tracking/TrackingServiceCard';
import TrackingActionButtons from '@/components/tracking/TrackingActionButtons';
import TrackingThankYou from '@/components/tracking/TrackingThankYou';
import { Loader2, AlertTriangle, ChevronLeft, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TenantLogo } from '@/components/branding/TenantLogo';
import { PLATFORM_NAME } from '@/lib/constants';

interface TrackingSession {
  id: string;
  agendamento_id: string;
  tecnico_id: string;
  token_publico: string;
  status: 'em_rota' | 'chegou' | 'servico_em_andamento' | 'concluido' | 'cancelado';
  iniciado_em: string;
  chegou_em: string | null;
  concluido_em: string | null;
  destino_latitude: number | null;
  destino_longitude: number | null;
  origem_latitude: number | null;
  origem_longitude: number | null;
  eta_minutos: number | null;
  distancia_metros: number | null;
  tecnico_nome: string | null;
}

interface TrackingPosition {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface Agendamento {
  id: string;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  bairro: string | null;
  cidade: string | null;
  data_agendamento: string;
  horario: string | null;
  valor_total: number;
  itens_carrinho: any[];
  latitude: number | null;
  longitude: number | null;
  tenant_id: string | null;
}

export default function Tracking() {
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar sessão e agendamento
  const fetchData = useCallback(async () => {
    if (!token) {
      setError('Token inválido');
      setIsLoading(false);
      return;
    }

    try {
      // Buscar sessão
      const { data: sessionData, error: sessionError } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('token_publico', token)
        .maybeSingle();

      if (sessionError) throw sessionError;
      
      if (!sessionData) {
        setError('Link de rastreamento não encontrado ou expirado');
        setIsLoading(false);
        return;
      }

      setSession(sessionData as TrackingSession);

      // Buscar agendamento
      const { data: agendamentoData, error: agendamentoError } = await supabase
        .from('agendamentos')
        .select('id, nome_cliente, telefone, endereco, bairro, cidade, data_agendamento, horario, valor_total, itens_carrinho, latitude, longitude, tenant_id')
        .eq('id', sessionData.agendamento_id)
        .single();

      if (agendamentoError) throw agendamentoError;
      
      setAgendamento(agendamentoData as Agendamento);

      // Buscar última posição
      const { data: positionData } = await supabase
        .from('tracking_positions')
        .select('*')
        .eq('tracking_session_id', sessionData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (positionData) {
        setCurrentPosition({
          latitude: positionData.latitude,
          longitude: positionData.longitude,
        });
        setLastUpdate(new Date(positionData.created_at));
      } else if (sessionData.origem_latitude && sessionData.origem_longitude) {
        // Usar posição de origem como fallback se não tiver posição atualizada ainda
        setCurrentPosition({
          latitude: Number(sessionData.origem_latitude),
          longitude: Number(sessionData.origem_longitude),
        });
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar informações de rastreamento');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Configurar Realtime para atualizações
  useEffect(() => {
    if (!session?.id) return;

    // Canal para posições
    const positionsChannel = supabase
      .channel(`tracking-positions-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tracking_positions',
          filter: `tracking_session_id=eq.${session.id}`,
        },
        (payload: any) => {
          const newPos = payload.new as TrackingPosition;
          setCurrentPosition({
            latitude: newPos.latitude,
            longitude: newPos.longitude,
          });
          setLastUpdate(new Date(newPos.created_at));
        }
      )
      .subscribe();

    // Canal para status da sessão
    const sessionChannel = supabase
      .channel(`tracking-session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tracking_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload: any) => {
          setSession(payload.new as TrackingSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(positionsChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [session?.id]);

  // Detectar tipo de serviço (deve vir ANTES dos early returns para respeitar Rules of Hooks)
  const isLocacao = useMemo(() => {
    if (!agendamento?.itens_carrinho) return false;
    const itens = Array.isArray(agendamento.itens_carrinho) ? agendamento.itens_carrinho : [];
    return itens.some((item: any) => {
      const nome = (item.name || item.nome || '').toLowerCase();
      return nome.includes('aluguel') || nome.includes('locação') || nome.includes('locacao');
    });
  }, [agendamento?.itens_carrinho]);
  
  // Buscar dados do tenant para branding
  const { data: tenantData } = useQuery({
    queryKey: ['tracking-tenant', agendamento?.tenant_id],
    queryFn: async () => {
      if (!agendamento?.tenant_id) return null;
      
      const { data } = await supabase
        .from('saas_tenants')
        .select('id, nome_fantasia, nome_empresa, logo_url')
        .eq('id', agendamento.tenant_id)
        .single();
      
      return data;
    },
    enabled: !!agendamento?.tenant_id,
    staleTime: Infinity,
  });
  
  // Verificar se é tenant master
  const isMasterTenant = !tenantData || tenantData.id === '00000000-0000-0000-0000-000000000001';
  const companyName = tenantData?.nome_fantasia || tenantData?.nome_empresa || 'Serviço';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Carregando rastreamento...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Oops!</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'Link de rastreamento não encontrado'}
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique se o link está correto ou entre em contato conosco.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Destino
  const destinoPosition = session.destino_latitude && session.destino_longitude
    ? { latitude: Number(session.destino_latitude), longitude: Number(session.destino_longitude) }
    : agendamento?.latitude && agendamento?.longitude
      ? { latitude: Number(agendamento.latitude), longitude: Number(agendamento.longitude) }
      : null;

  // Mostrar tela de agradecimento quando técnico chegou
  const showThankYou = ['chegou', 'servico_em_andamento', 'concluido'].includes(session.status);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showThankYou ? (
        /* Tela de agradecimento quando técnico chegou */
        <>
          {/* Header compacto */}
          <motion.header
            className="bg-background/80 backdrop-blur-md shadow-sm py-3 px-4 sticky top-0 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-lg mx-auto flex items-center gap-3">
              {isMasterTenant ? (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  RC
                </div>
              ) : tenantData?.logo_url ? (
                <TenantLogo 
                  logoUrl={tenantData.logo_url} 
                  companyName={companyName}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white shadow-lg">
                  <MapPin className="h-5 w-5" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-base">{isMasterTenant ? PLATFORM_NAME : companyName}</h1>
                <p className="text-xs text-muted-foreground">Serviço</p>
              </div>
            </div>
          </motion.header>

          <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
            <TrackingThankYou
              tipoServico={isLocacao ? 'locacao' : 'limpeza'}
              nomeCliente={agendamento?.nome_cliente}
              tecnicoNome={session.tecnico_nome}
            />
          </main>
        </>
      ) : (
        /* Tela de rastreamento estilo Uber */
        <>
          {/* Header compacto */}
          <motion.header
            className="bg-background/80 backdrop-blur-md py-3 px-4 absolute top-0 left-0 right-0 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-lg mx-auto flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-background/80 shadow-sm"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-bold text-sm">Acompanhar {isLocacao ? 'entrega' : 'técnico'}</h1>
                <p className="text-xs text-muted-foreground">{isMasterTenant ? PLATFORM_NAME : companyName}</p>
              </div>
            </div>
          </motion.header>

          {/* MAPA GRANDE - Estilo Uber */}
          <motion.div
            className="relative h-[50vh] min-h-[300px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TrackingMap
              tecnicoPosition={currentPosition}
              destinoPosition={destinoPosition}
              etaMinutos={session.eta_minutos}
              distanciaMetros={session.distancia_metros}
            />
          </motion.div>

          {/* Conteúdo inferior com cards */}
          <div className="flex-1 bg-background rounded-t-3xl -mt-6 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <div className="max-w-lg mx-auto w-full px-4 py-6 space-y-4">
              {/* Handle visual para indicar que pode arrastar */}
              <div className="flex justify-center -mt-2 mb-2">
                <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
              </div>

              {/* Card de endereço */}
              {agendamento && (
                <TrackingAddressCard
                  endereco={agendamento.endereco}
                  bairro={agendamento.bairro}
                  cidade={agendamento.cidade}
                />
              )}

              {/* Card do serviço/locação */}
              {agendamento && (
                <TrackingServiceCard
                  itensCarrinho={agendamento.itens_carrinho}
                  valorTotal={agendamento.valor_total}
                  tecnicoNome={session.tecnico_nome}
                  isLocacao={isLocacao}
                />
              )}

              {/* Botões de ação */}
              <TrackingActionButtons
                nomeCliente={agendamento?.nome_cliente}
              />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-muted-foreground bg-background border-t">
        <p>© {new Date().getFullYear()} {isMasterTenant ? PLATFORM_NAME : companyName}</p>
      </footer>
    </div>
  );
}
