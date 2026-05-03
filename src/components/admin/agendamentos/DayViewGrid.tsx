import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Agendamento } from '@/hooks/useAgendamentos';
import { formatCurrency } from '@/utils/format';
import { Clock, User, MapPin, Phone, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayViewGridProps {
  date: Date;
  agendamentos: Agendamento[];
  onAgendamentoClick: (agendamento: Agendamento) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmado: { label: 'Confirmado', color: 'text-green-700', bg: 'bg-green-100' },
  em_andamento: { label: 'Em Andamento', color: 'text-blue-700', bg: 'bg-blue-100' },
};

export default function DayViewGrid({
  date,
  agendamentos,
  onAgendamentoClick
}: DayViewGridProps) {
  const sortedAgendamentos = [...agendamentos].sort((a, b) => {
    const horaA = a.horario || '99:99';
    const horaB = b.horario || '99:99';
    return horaA.localeCompare(horaB);
  });

  return (
    <div className="p-3 md:p-6">
      {sortedAgendamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Clock className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhum agendamento confirmado</p>
          <p className="text-sm mt-1">
            {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAgendamentos.map(ag => {
            const status = STATUS_CONFIG[ag.status] || STATUS_CONFIG.confirmado;
            
            return (
              <button
                key={ag.id}
                onClick={() => onAgendamentoClick(ag)}
                className="w-full text-left rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Header com horário e valor */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/30">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-base font-bold text-primary">
                      {ag.horario || '--:--'}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", status.bg, status.color)}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-emerald-600">
                    {formatCurrency(ag.valor_total)}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-semibold text-base">
                      {ag.nome_cliente}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{ag.telefone}</span>
                  </div>
                  
                  <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>{ag.endereco}</span>
                  </div>
                  
                  {ag.itens_carrinho && Array.isArray(ag.itens_carrinho) && (
                    <div className="flex items-start gap-2.5 text-sm pt-1">
                      <Package className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {(ag.itens_carrinho as any[]).slice(0, 4).map((item, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 bg-muted rounded text-xs"
                          >
                            {item.nome || item.name} {item.quantidade > 1 && `(${item.quantidade}x)`}
                          </span>
                        ))}
                        {(ag.itens_carrinho as any[]).length > 4 && (
                          <span className="text-xs text-muted-foreground">
                            +{(ag.itens_carrinho as any[]).length - 4} itens
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
