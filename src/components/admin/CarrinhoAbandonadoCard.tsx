import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, CheckCircle, XCircle, Eye } from "lucide-react";
import { CarrinhoAbandonado } from "@/hooks/useCarrinhosAbandonados";
import * as format from "@/utils/format";

interface CarrinhoAbandonadoCardProps {
  carrinho: CarrinhoAbandonado;
  onSendWhatsApp: (carrinho: CarrinhoAbandonado) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onRecuperar: (carrinho: CarrinhoAbandonado) => void;
  onViewDetails: (carrinho: CarrinhoAbandonado) => void;
}

export function CarrinhoAbandonadoCard({
  carrinho,
  onSendWhatsApp,
  onUpdateStatus,
  onRecuperar,
  onViewDetails,
}: CarrinhoAbandonadoCardProps) {
  const getEtapaBadge = () => {
    if (carrinho.etapa_abandonada === 'carrinho') {
      return <Badge variant="secondary">Carrinho</Badge>;
    }
    return <Badge variant="outline">Agendamento</Badge>;
  };

  const getStatusBadge = () => {
    const variants: Record<string, any> = {
      abandonado: 'destructive',
      contatado: 'default',
      recuperado: 'default',
      perdido: 'secondary',
    };

    const labels: Record<string, string> = {
      abandonado: 'Abandonado',
      contatado: 'Contatado',
      recuperado: 'Recuperado',
      perdido: 'Perdido',
    };

    return (
      <Badge variant={variants[carrinho.status] || 'default'}>
        {labels[carrinho.status] || carrinho.status}
      </Badge>
    );
  };

  const getUrgencyIndicator = () => {
    const horasDesdeAbandonou = Math.abs(
      new Date().getTime() - new Date(carrinho.last_activity).getTime()
    ) / (1000 * 60 * 60);

    if (horasDesdeAbandonou < 2) {
      return <Badge className="bg-red-500">🔥 Urgente</Badge>;
    }
    if (horasDesdeAbandonou < 24) {
      return <Badge className="bg-yellow-500">⚡ Recente</Badge>;
    }
    return null;
  };

  const tempoDesdeAbandono = formatDistanceToNow(new Date(carrinho.last_activity), {
    locale: ptBR,
    addSuffix: true,
  });

  const itens = Array.isArray(carrinho.itens_carrinho) ? carrinho.itens_carrinho : [];

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-all">
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg truncate">
                {carrinho.nome_cliente || 'Cliente não identificado'}
              </h3>
              {getUrgencyIndicator()}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {carrinho.telefone || 'Sem telefone'}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {tempoDesdeAbandono}
            </p>
          </div>
          <div className="flex gap-2 items-center sm:flex-col sm:items-end">
            {getEtapaBadge()}
            {getStatusBadge()}
          </div>
        </div>

        {/* Progress */}
        {carrinho.etapa_abandonada === 'agendamento' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso do formulário</span>
              <span className="font-medium">{carrinho.percentual_preenchimento}%</span>
            </div>
            <Progress value={carrinho.percentual_preenchimento} />
          </div>
        )}

        {/* Itens */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Itens ({itens.length}):</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {itens.slice(0, 3).map((item: any, index: number) => (
              <li key={index} className="flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{format.formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
            {itens.length > 3 && (
              <li className="text-xs italic">+ {itens.length - 3} itens</li>
            )}
          </ul>
        </div>

        {/* Valor Total */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold">Valor Total:</span>
          <span className="text-xl font-bold text-primary">
            {format.formatCurrency(Number(carrinho.valor_total))}
          </span>
        </div>

        {/* Cupom */}
        {carrinho.cupom_codigo && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="bg-green-50">
              Cupom: {carrinho.cupom_codigo} ({carrinho.cupom_desconto_percentual}% OFF)
            </Badge>
          </div>
        )}

        {/* Endereço */}
        {carrinho.endereco && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">📍</span> {carrinho.endereco}, {carrinho.bairro} - {carrinho.cidade}
          </div>
        )}

        {/* Data */}
        {carrinho.data_agendamento && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">📅</span> {new Date(carrinho.data_agendamento).toLocaleDateString('pt-BR')}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-3 sm:pt-4 border-t">
          <Button
            size="sm"
            onClick={() => onSendWhatsApp(carrinho)}
            disabled={!carrinho.telefone || carrinho.status === 'recuperado'}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">WhatsApp</span>
            <span className="sm:hidden">Zap</span>
          </Button>

          {carrinho.status !== 'perdido' && carrinho.status !== 'recuperado' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 text-xs sm:text-sm"
              onClick={() => onRecuperar(carrinho)}
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Recuperado</span>
              <span className="sm:hidden">OK</span>
            </Button>
          )}

          {carrinho.status !== 'perdido' && carrinho.status !== 'recuperado' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 text-xs sm:text-sm"
              onClick={() => onUpdateStatus(carrinho.id, 'perdido')}
            >
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Marcar Perdido</span>
              <span className="sm:hidden">Perdido</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(carrinho)}
            className="text-xs sm:text-sm"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Detalhes</span>
          </Button>
        </div>

        {/* Tentativas de contato */}
        {carrinho.tentativas_contato > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {carrinho.tentativas_contato} tentativa(s) de contato
            {carrinho.ultima_tentativa_contato && (
              <> • Último contato: {formatDistanceToNow(new Date(carrinho.ultima_tentativa_contato), { locale: ptBR, addSuffix: true })}</>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
