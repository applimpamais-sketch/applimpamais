import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Clock } from 'lucide-react';
import { Agendamento } from '@/hooks/useAgendamentos';
import { formatCurrency, formatPhone } from '@/utils/format';
import { cn } from '@/lib/utils';

interface AgendamentoListItemProps {
  agendamento: Agendamento;
  onClick: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pendente: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Pendente' },
  confirmado: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'Confirmado' },
  concluido: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', label: 'Concluído' },
  cancelado: { bg: 'bg-red-500/10', text: 'text-red-600', label: 'Cancelado' },
  pago: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Pago' },
};

export default function AgendamentoListItem({ agendamento, onClick }: AgendamentoListItemProps) {
  const statusStyle = STATUS_STYLES[agendamento.status] || STATUS_STYLES.pendente;

  return (
    <div 
      className="p-3 rounded-lg border border-border/50 hover:bg-accent/30 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{agendamento.nome_cliente}</h4>
            <Badge 
              variant="secondary" 
              className={cn("text-[10px] px-1.5 py-0", statusStyle.bg, statusStyle.text)}
            >
              {statusStyle.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatPhone(agendamento.telefone)}</span>
            <span className="font-medium text-foreground">
              {formatCurrency(agendamento.valor_total)}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {agendamento.horario && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {agendamento.horario}
              </div>
            )}
            {agendamento.bairro && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {agendamento.bairro}
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
