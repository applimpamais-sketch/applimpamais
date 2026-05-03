import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import ConfirmarPagamentoModal from '@/components/admin/ConfirmarPagamentoModal';
import IniciarTrajetoButton from './IniciarTrajetoButton';
import TrackingAtivo from './TrackingAtivo';
import ServicoConcluido from './ServicoConcluido';
import ProximoServicoCard from './ProximoServicoCard';
import { useProximoServico } from '@/hooks/useProximoServico';
import { 
  MapPin, 
  Play, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Phone, 
  Wrench, 
  ExternalLink, 
  User,
  X,
  DollarSign,
  Package,
  Tag
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PLATFORM_NAME } from '@/lib/constants';

interface Servico {
  id: string;
  nome_cliente: string;
  telefone: string;
  endereco: string;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
  data_agendamento: string;
  horario: string | null;
  status: string;
  valor_total: number;
  itens_carrinho: any[];
  latitude?: number | null;
  longitude?: number | null;
  genero_cliente?: string | null;
  cupom_codigo?: string | null;
  cupom_desconto_percentual?: number | null;
  valor_desconto?: number | null;
  valor_frete?: number | null;
  forma_pagamento?: string | null;
  pago_em?: string | null;
  created_at?: string;
}

interface ServicoDetalheModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servico: Servico | null;
  onUpdate: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmado':
      return <Badge className="bg-green-500">🟢 Confirmado</Badge>;
    case 'pendente':
      return <Badge className="bg-yellow-500">🟡 Pendente</Badge>;
    case 'em_andamento':
      return <Badge className="bg-blue-500">🔵 Em Andamento</Badge>;
    case 'concluido':
      return <Badge className="bg-purple-500">✅ Concluído</Badge>;
    case 'pago':
      return <Badge className="bg-emerald-500">💰 Pago</Badge>;
    case 'cancelado':
      return <Badge className="bg-red-500">❌ Cancelado</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function ServicoDetalheModal({ 
  open, 
  onOpenChange, 
  servico, 
  onUpdate 
}: ServicoDetalheModalProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTrackingSession, setActiveTrackingSession] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Estados para fluxo de conclusão
  const [showConcluido, setShowConcluido] = useState(false);
  const [formaPagamentoUsada, setFormaPagamentoUsada] = useState<string | null>(null);
  const [showProximoServico, setShowProximoServico] = useState(false);
  const [posicaoAtual, setPosicaoAtual] = useState<{ latitude: number; longitude: number } | null>(null);

  // Buscar user ID ao abrir o modal
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    if (open) {
      getUserId();
    }
  }, [open]);

  // Hook para buscar próximo serviço
  const { proximoServico, isLoading: isLoadingProximo, refetch: refetchProximo } = useProximoServico(
    currentUserId,
    format(new Date(), 'yyyy-MM-dd'),
    servico?.id
  );

  // Obter posição atual quando necessário
  useEffect(() => {
    if (showProximoServico && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosicaoAtual({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {} // Ignora erro silenciosamente
      );
    }
  }, [showProximoServico]);

  // Verificar se tem sessão de tracking ativa
  const checkActiveTracking = useCallback(async () => {
    if (!servico?.id) return;
    
    const { data } = await supabase
      .from('tracking_sessions')
      .select('id')
      .eq('agendamento_id', servico.id)
      .in('status', ['em_rota', 'chegou'])
      .maybeSingle();
    
    if (data) {
      setActiveTrackingSession(data.id);
    }
  }, [servico?.id]);

  useEffect(() => {
    if (open && servico) {
      checkActiveTracking();
    }
  }, [open, servico, checkActiveTracking]);

  if (!servico) return null;

  const handleAbrirGPS = () => {
    if (servico.latitude && servico.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${servico.latitude},${servico.longitude}`,
        '_blank'
      );
    } else if (servico.endereco) {
      const enderecoCompleto = `${servico.endereco}, ${servico.bairro || ''}, ${servico.cidade || ''}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoCompleto)}`,
        '_blank'
      );
    }
  };

  const handleLigarCliente = () => {
    window.open(`tel:${servico.telefone}`, '_self');
  };

  const handleWhatsApp = () => {
    const telefoneFormatado = servico.telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(
      `Olá ${servico.nome_cliente.split(' ')[0]}! Aqui é o técnico da ${PLATFORM_NAME}. Estou a caminho para o serviço agendado.`
    );
    window.open(`https://wa.me/55${telefoneFormatado}?text=${mensagem}`, '_blank');
  };

  const handleIniciarServico = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'em_andamento' })
        .eq('id', servico.id);

      if (error) throw error;

      toast.success('Serviço iniciado!');
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao iniciar serviço:', error);
      toast.error('Erro ao iniciar serviço');
    } finally {
      setIsUpdating(false);
    }
  };

  const getItensDetalhados = () => {
    if (!servico.itens_carrinho || servico.itens_carrinho.length === 0) {
      return [];
    }

    return servico.itens_carrinho.map((item: any, index: number) => {
      const nomeItem = item.nome || item.name || item.item || item.equipamento || 'Serviço';
      const quantidade = item.quantidade || item.quantity || 1;
      const preco = item.preco || item.price || 0;
      
      let descricao = '';
      if (item.tipo === 'combo') {
        descricao = `Combo com ${item.itens?.length || 0} itens`;
      } else if (item.tipo === 'aluguel') {
        descricao = `Aluguel - ${item.periodo_aluguel || item.periodo || ''}`;
      } else {
        const tamanho = item.tamanho || item.size || '';
        const tipoServico = item.tipoServico || item.tipo_servico || '';
        if (tamanho) descricao += tamanho;
        if (tipoServico) descricao += (descricao ? ' - ' : '') + tipoServico;
      }

      return {
        id: item.id || index,
        nome: nomeItem,
        descricao,
        quantidade,
        preco: preco * quantidade
      };
    });
  };

  const getTempoDecorrido = () => {
    if (servico.status !== 'em_andamento') return null;

    const agora = new Date();
    const dataAgendamento = new Date(`${servico.data_agendamento}T${servico.horario || '00:00'}`);
    const diffMs = agora.getTime() - dataAgendamento.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} minutos`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}min`;
  };

  const itens = getItensDetalhados();

  const ModalContent = () => (
    <div className="space-y-4">
      {/* Cliente */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Avatar className="h-12 w-12 border-2 border-primary/20 bg-primary/10">
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {servico.genero_cliente === 'masculino' ? '👨' : 
             servico.genero_cliente === 'feminino' ? '👩' : 
             <User className="h-6 w-6 text-primary" />}
          </div>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{servico.nome_cliente}</h3>
          <button 
            onClick={handleLigarCliente}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {servico.telefone}
          </button>
        </div>
      </div>

      {/* Data e Horário */}
      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
        <Calendar className="h-5 w-5 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="font-medium truncate">
            {format(new Date(servico.data_agendamento + 'T00:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {servico.horario ? (
              <span className="text-muted-foreground">{servico.horario}</span>
            ) : (
              <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                Horário a definir
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tempo em andamento */}
      {servico.status === 'em_andamento' && getTempoDecorrido() && (
        <div className="flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Em andamento há {getTempoDecorrido()}
          </span>
        </div>
      )}

      {/* Endereço */}
      <button 
        onClick={handleAbrirGPS}
        className="flex items-start gap-3 w-full p-3 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg transition-colors group border border-blue-200/50 dark:border-blue-800/50"
      >
        <MapPin className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
            Abrir no Google Maps
            <ExternalLink className="h-3 w-3" />
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {servico.endereco}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {servico.bairro && `${servico.bairro}, `}
            {servico.cidade}
            {servico.cep && ` - CEP: ${servico.cep}`}
          </p>
        </div>
      </button>

      <Separator />

      {/* Itens do Serviço */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Itens do Serviço
        </h4>
        <div className="space-y-2">
          {itens.length > 0 ? itens.map((item) => (
            <div 
              key={item.id} 
              className="flex justify-between items-start p-2 bg-muted/30 rounded-md"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{item.nome}</p>
                {item.descricao && (
                  <p className="text-xs text-muted-foreground truncate">{item.descricao}</p>
                )}
                {item.quantidade > 1 && (
                  <p className="text-xs text-muted-foreground">Qtd: {item.quantidade}</p>
                )}
              </div>
              <span className="text-sm font-medium shrink-0 ml-2">
                {formatCurrency(item.preco)}
              </span>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">Sem itens detalhados</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Resumo Financeiro */}
      <div className="space-y-2">
        {servico.cupom_codigo && (
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Cupom: {servico.cupom_codigo}
            </span>
            <span className="text-green-600">
              -{servico.cupom_desconto_percentual}%
            </span>
          </div>
        )}
        
        {servico.valor_desconto && servico.valor_desconto > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Desconto</span>
            <span className="text-green-600">-{formatCurrency(servico.valor_desconto)}</span>
          </div>
        )}

        {servico.valor_frete !== undefined && servico.valor_frete !== null && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span>{servico.valor_frete === 0 ? 'Grátis' : formatCurrency(servico.valor_frete)}</span>
          </div>
        )}

        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200/50 dark:border-green-800/50">
          <span className="font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Valor Total
          </span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(servico.valor_total)}
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className="space-y-3 pt-2 pb-safe">
        {/* Tracking ativo */}
        {activeTrackingSession && (
          <TrackingAtivo
            sessionId={activeTrackingSession}
            agendamentoId={servico.id}
            nomeCliente={servico.nome_cliente}
            endereco={`${servico.endereco}${servico.bairro ? `, ${servico.bairro}` : ''}${servico.cidade ? `, ${servico.cidade}` : ''}`}
            onChegou={() => {
              setActiveTrackingSession(null);
              onUpdate();
            }}
            onCancelado={() => {
              setActiveTrackingSession(null);
              onUpdate();
            }}
          />
        )}

        {/* Botões de contato */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-12"
            onClick={handleLigarCliente}
          >
            <Phone className="mr-2 h-5 w-5" />
            Ligar
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12"
            onClick={handleWhatsApp}
          >
            💬 WhatsApp
          </Button>
        </div>

        {/* Botões de ação por status */}
        {servico.status === 'confirmado' && !activeTrackingSession && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAbrirGPS}
              className="flex-1 h-12"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Abrir GPS
            </Button>
            <IniciarTrajetoButton
              agendamentoId={servico.id}
              nomeCliente={servico.nome_cliente}
              telefoneCliente={servico.telefone}
              endereco={`${servico.endereco}${servico.bairro ? `, ${servico.bairro}` : ''}${servico.cidade ? `, ${servico.cidade}` : ''}`}
              latitude={servico.latitude}
              longitude={servico.longitude}
              itensCarrinho={servico.itens_carrinho}
              onTrackingStarted={(sessionId) => {
                setActiveTrackingSession(sessionId);
                onOpenChange(false); // Fechar modal automaticamente
                onUpdate();
              }}
              className="flex-1 h-12"
            />
          </div>
        )}

        {servico.status === 'em_andamento' && !activeTrackingSession && (
          <Button
            onClick={() => setShowPagamentoModal(true)}
            className="w-full h-14 text-base"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Concluir e Confirmar Pagamento
          </Button>
        )}

        {['concluido', 'pago'].includes(servico.status) && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Serviço concluído
              {servico.forma_pagamento && ` • ${servico.forma_pagamento}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Função para lidar com pagamento confirmado
  const handlePagamentoConfirmado = (formaPagamento: string) => {
    setFormaPagamentoUsada(formaPagamento);
    setShowPagamentoModal(false);
    setShowConcluido(true);
    onUpdate();
  };

  // Função para continuar após conclusão
  const handleContinuarAposConclusao = () => {
    if (proximoServico) {
      setShowConcluido(false);
      setShowProximoServico(true);
    } else {
      // Sem próximo serviço - fecha tudo
      setShowConcluido(false);
      setShowProximoServico(false);
      onOpenChange(false);
    }
  };

  // Função para iniciar rota do próximo serviço
  const handleIniciarRotaProximo = () => {
    // Fecha este modal e redireciona para a lista de serviços
    // O técnico abrirá o próximo serviço de lá
    setShowProximoServico(false);
    setShowConcluido(false);
    onUpdate(); // Atualiza a lista
    onOpenChange(false);
    // Navegar para lista de serviços
    navigate('/tecnico/servicos');
  };

  // Conteúdo para tela de conclusão
  const ConcluidoContent = () => (
    <div className="p-4">
      <ServicoConcluido
        nomeCliente={servico.nome_cliente}
        valorTotal={servico.valor_total}
        formaPagamento={formaPagamentoUsada}
        temProximoServico={!!proximoServico}
        onContinuar={handleContinuarAposConclusao}
      />
    </div>
  );

  // Conteúdo para próximo serviço
  const ProximoServicoContent = () => (
    <div className="p-4">
      {proximoServico && (
        <ProximoServicoCard
          servico={proximoServico}
          posicaoAtual={posicaoAtual}
          onIniciarRota={handleIniciarRotaProximo}
          isLoading={isLoadingProximo}
        />
      )}
    </div>
  );

  // Mobile: Usar Drawer
  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={(isOpen) => {
          if (!isOpen) {
            // Reset states ao fechar
            setShowConcluido(false);
            setShowProximoServico(false);
            setFormaPagamentoUsada(null);
          }
          onOpenChange(isOpen);
        }}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="border-b pb-3">
              <DrawerTitle className="flex items-center justify-between">
                <span>
                  {showConcluido ? 'Serviço Concluído' : 
                   showProximoServico ? 'Próximo Serviço' : 
                   'Detalhes do Serviço'}
                </span>
                {!showConcluido && !showProximoServico && getStatusBadge(servico.status)}
              </DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="flex-1 overflow-auto">
              {showConcluido ? (
                <ConcluidoContent />
              ) : showProximoServico ? (
                <ProximoServicoContent />
              ) : (
                <div className="px-4 py-4">
                  <ModalContent />
                </div>
              )}
            </ScrollArea>
          </DrawerContent>
        </Drawer>

        <ConfirmarPagamentoModal
          open={showPagamentoModal}
          onOpenChange={setShowPagamentoModal}
          servico={servico as any}
          onSuccess={() => {
            onUpdate();
            onOpenChange(false);
          }}
          onConfirmado={handlePagamentoConfirmado}
        />
      </>
    );
  }

  // Desktop: Usar Dialog
  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset states ao fechar
          setShowConcluido(false);
          setShowProximoServico(false);
          setFormaPagamentoUsada(null);
        }
        onOpenChange(isOpen);
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {showConcluido ? 'Serviço Concluído' : 
                 showProximoServico ? 'Próximo Serviço' : 
                 'Detalhes do Serviço'}
              </span>
              {!showConcluido && !showProximoServico && getStatusBadge(servico.status)}
            </DialogTitle>
          </DialogHeader>
          {showConcluido ? (
            <ConcluidoContent />
          ) : showProximoServico ? (
            <ProximoServicoContent />
          ) : (
            <ModalContent />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmarPagamentoModal
        open={showPagamentoModal}
        onOpenChange={setShowPagamentoModal}
        servico={servico as any}
        onSuccess={() => {
          onUpdate();
          onOpenChange(false);
        }}
        onConfirmado={handlePagamentoConfirmado}
      />
    </>
  );
}
