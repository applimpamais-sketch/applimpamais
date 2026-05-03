import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { MeuServico } from '@/hooks/useMeusServicos';
import { formatCurrency, formatDate } from '@/utils/format';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ConfirmarPagamentoModal from './ConfirmarPagamentoModal';
import ServicoDetalheModal from '@/components/tecnico/ServicoDetalheModal';
import { MapPin, Play, CheckCircle, Clock, Calendar, Phone, Wrench, ExternalLink, User, Eye } from 'lucide-react';

interface ServicoTecnicoCardProps {
  servico: MeuServico;
  onUpdate: () => void;
}

export default function ServicoTecnicoCard({ servico, onUpdate }: ServicoTecnicoCardProps) {
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [showDetalheModal, setShowDetalheModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const getStatusBadge = () => {
    switch (servico.status) {
      case 'confirmado':
        return <Badge className="bg-green-500">🟢 Confirmado</Badge>;
      case 'em_andamento':
        return <Badge className="bg-blue-500">🔵 Em Andamento</Badge>;
      case 'concluido':
        return <Badge className="bg-purple-500">✅ Concluído</Badge>;
      case 'pago':
        return <Badge className="bg-emerald-500">💰 Pago</Badge>;
      default:
        return <Badge variant="secondary">{servico.status}</Badge>;
    }
  };

  const handleAbrirGPS = () => {
    if (servico.latitude && servico.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${servico.latitude},${servico.longitude}`,
        '_blank'
      );
    } else if (servico.endereco) {
      const enderecoCompleto = `${servico.endereco}, ${servico.bairro}, ${servico.cidade}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoCompleto)}`,
        '_blank'
      );
    }
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
    } catch (error: any) {
      console.error('Erro ao iniciar serviço:', error);
      toast.error('Erro ao iniciar serviço');
    } finally {
      setIsUpdating(false);
    }
  };

  const getItensDescricao = () => {
    if (!servico.itens_carrinho || servico.itens_carrinho.length === 0) {
      return 'Sem itens';
    }

    return servico.itens_carrinho
      .map((item: any) => {
        // Normalizar nome do item - verificar todas as propriedades possíveis
        const nomeItem = item.nome || item.name || item.item || item.equipamento || 'Serviço';
        
        if (item.tipo === 'combo') {
          const qtdItens = item.itens?.length || 0;
          return `${nomeItem} (Combo${qtdItens > 0 ? ` - ${qtdItens} itens` : ''})`;
        } else if (item.tipo === 'aluguel') {
          const equipamento = item.equipamento || nomeItem;
          const periodo = item.periodo_aluguel || item.periodo || 'período não definido';
          return `${equipamento} - ${periodo}`;
        } else {
          // Normalizar propriedades adicionais
          const tamanho = item.tamanho || item.size || '';
          const tipoServico = item.tipoServico || item.tipo_servico || item.type || '';
          
          let descricao = nomeItem;
          if (tamanho) descricao += ` (${tamanho})`;
          if (tipoServico) descricao += ` - ${tipoServico}`;
          
          return descricao;
        }
      })
      .filter(Boolean) // Remove valores vazios ou undefined
      .join(', ') || 'Serviço sem descrição';
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

  const getStatusColor = () => {
    switch (servico.status) {
      case 'confirmado':
        return 'hsl(var(--chart-2))'; // verde
      case 'em_andamento':
        return 'hsl(var(--chart-1))'; // azul
      case 'concluido':
        return 'hsl(var(--chart-3))'; // roxo
      case 'pago':
        return 'hsl(var(--chart-4))'; // verde escuro
      default:
        return 'hsl(var(--muted))';
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 cursor-pointer group" 
        style={{ borderLeftColor: getStatusColor() }}
        onClick={() => setShowDetalheModal(true)}
      >
        {/* Header com Gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12 border-2 border-primary/20 bg-primary/10 flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {servico.genero_cliente === 'masculino' ? '👨' : servico.genero_cliente === 'feminino' ? '👩' : <User className="h-6 w-6 text-primary" />}
                </div>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{servico.nome_cliente}</h3>
                <a 
                  href={`tel:${servico.telefone}`} 
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{servico.telefone}</span>
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Corpo do Card */}
        <CardContent className="p-4 space-y-4">
          {/* Data e Horário em Destaque */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{formatDate(servico.data_agendamento)}</p>
              <div className="flex items-center gap-2 text-sm">
                {servico.horario ? (
                  <span className="text-muted-foreground">{servico.horario}</span>
                ) : (
                  <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                    ⚠️ Horário a definir
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Serviços com Ícones */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Wrench className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Serviços</p>
                <p className="text-sm mt-0.5 leading-relaxed">{getItensDescricao()}</p>
              </div>
            </div>
          </div>

          {/* Endereço Clicável */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleAbrirGPS(); }}
            className="flex items-start gap-3 w-full p-3 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg transition-colors border border-blue-200/50 dark:border-blue-800/50"
          >
            <MapPin className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0 hover:scale-110 transition-transform" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                Ver no Mapa
                <ExternalLink className="h-3 w-3" />
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {servico.endereco}
                {servico.bairro && `, ${servico.bairro}`}
                {servico.cidade && ` - ${servico.cidade}`}
              </p>
            </div>
          </button>

          {/* Valor em Destaque */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200/50 dark:border-green-800/50">
            <span className="text-sm font-medium text-muted-foreground">Valor Total</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(servico.valor_total)}
            </span>
          </div>

          {/* Tempo Decorrido (para serviços em andamento) */}
          {servico.status === 'em_andamento' && getTempoDecorrido() && (
            <div className="flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Em andamento há {getTempoDecorrido()}
              </span>
            </div>
          )}

          {/* Info de Conclusão */}
          {['concluido', 'pago'].includes(servico.status) && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Concluído em {servico.pago_em ? formatDate(servico.pago_em) : formatDate(servico.created_at)}
              </span>
            </div>
          )}
        </CardContent>

        {/* Footer com Ações */}
        {(servico.status === 'confirmado' || servico.status === 'em_andamento') && (
          <CardFooter className="bg-muted/30 p-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
            {servico.status === 'confirmado' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleAbrirGPS(); }}
                  className="flex-1"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Abrir GPS
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleIniciarServico(); }}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isUpdating ? 'Iniciando...' : 'Iniciar Serviço'}
                </Button>
              </>
            )}

            {servico.status === 'em_andamento' && (
              <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); setShowPagamentoModal(true); }}
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Concluir e Confirmar Pagamento
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      <ServicoDetalheModal
        open={showDetalheModal}
        onOpenChange={setShowDetalheModal}
        servico={servico}
        onUpdate={onUpdate}
      />

      <ConfirmarPagamentoModal
        open={showPagamentoModal}
        onOpenChange={setShowPagamentoModal}
        servico={servico}
        onSuccess={onUpdate}
      />
    </>
  );
}
