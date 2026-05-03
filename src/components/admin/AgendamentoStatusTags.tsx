import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Package, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { isToday, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface AgendamentoStatusTagsProps {
  agendamento: {
    id: string;
    status: string;
    data_agendamento: string;
    itens_carrinho: any[];
    isNew?: boolean;
  };
  trackingStatus?: string | null;
  showOrigemTag?: boolean;
}

// Detectar se é locação/aluguel vs serviço
const isLocacao = (itensCarrinho: any[]) => {
  if (!Array.isArray(itensCarrinho)) return false;
  return itensCarrinho.some((item: any) => {
    const nome = (item.name || item.nome || '').toLowerCase();
    return nome.includes('aluguel') || nome.includes('locação') || nome.includes('locacao') || nome.includes('extratora');
  });
};

export default function AgendamentoStatusTags({ 
  agendamento, 
  trackingStatus 
}: AgendamentoStatusTagsProps) {
  const tags: React.ReactNode[] = [];
  
  const isNew = agendamento.isNew === true;
  const isTodayDate = isToday(new Date(agendamento.data_agendamento));
  const isLate = isPast(new Date(agendamento.data_agendamento)) && 
                 !['concluido', 'cancelado', 'pago'].includes(agendamento.status);
  const equipmentBased = isLocacao(agendamento.itens_carrinho);

  // Prioridade 1: Novo (animado)
  if (isNew) {
    tags.push(
      <Badge 
        key="novo" 
        variant="default" 
        className="animate-pulse gap-1 text-xs"
        title="Novo agendamento recebido"
      >
        <Sparkles className="h-3 w-3" />
        Novo!
      </Badge>
    );
  }

  // Prioridade 2: Em Rota (tracking ativo)
  if (trackingStatus === 'em_rota') {
    tags.push(
      <Badge 
        key="em-rota"
        className="bg-blue-500 hover:bg-blue-600 text-white gap-1 text-xs"
        title="Técnico a caminho do local"
      >
        <Truck className="h-3 w-3" />
        Em Rota
      </Badge>
    );
  }

  // Prioridade 3: Chegou no local
  if (trackingStatus === 'chegou' || trackingStatus === 'servico_em_andamento') {
    tags.push(
      <Badge 
        key="chegou"
        className="bg-green-500 hover:bg-green-600 text-white gap-1 text-xs"
        title={trackingStatus === 'servico_em_andamento' ? 'Serviço em andamento' : 'Técnico chegou no local'}
      >
        <MapPin className="h-3 w-3" />
        {trackingStatus === 'servico_em_andamento' ? 'Em Serviço' : 'Chegou'}
      </Badge>
    );
  }

  // Prioridade 4: Concluído (diferenciado por tipo)
  if (agendamento.status === 'concluido') {
    if (equipmentBased) {
      tags.push(
        <Badge 
          key="entregue"
          className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 text-xs"
          title="Equipamento entregue ao cliente"
        >
          <Package className="h-3 w-3" />
          Entregue
        </Badge>
      );
    } else {
      tags.push(
        <Badge 
          key="realizado"
          className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 text-xs"
          title="Serviço realizado com sucesso"
        >
          <CheckCircle className="h-3 w-3" />
          Realizado
        </Badge>
      );
    }
  }

  // Prioridade 5: Hoje (se não for novo)
  if (isTodayDate && !isNew && !['concluido', 'pago'].includes(agendamento.status)) {
    tags.push(
      <Badge 
        key="hoje"
        variant="outline" 
        className="border-blue-500 text-blue-600 text-xs"
        title="Agendamento para hoje"
      >
        Hoje!
      </Badge>
    );
  }

  // Prioridade 6: Atrasado
  if (isLate && !trackingStatus) {
    tags.push(
      <Badge 
        key="atrasado"
        variant="destructive"
        className="gap-1 text-xs"
        title="Agendamento passou da data sem conclusão"
      >
        <Clock className="h-3 w-3" />
        Atrasado!
      </Badge>
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tags}
    </div>
  );
}
