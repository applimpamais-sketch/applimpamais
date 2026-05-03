import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, CheckCircle, CheckCircle2, XCircle, DollarSign, Undo2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const STATUS_CONFIG = {
  pendente: { 
    label: 'Pendente', 
    color: 'text-yellow-600 dark:text-yellow-500', 
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    icon: Clock 
  },
  confirmado: { 
    label: 'Confirmado', 
    color: 'text-blue-600 dark:text-blue-500', 
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    icon: CheckCircle 
  },
  em_andamento: { 
    label: 'Em Andamento', 
    color: 'text-purple-600 dark:text-purple-500', 
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    icon: Loader2 
  },
  concluido: { 
    label: 'Concluído', 
    color: 'text-green-600 dark:text-green-500', 
    bgColor: 'bg-green-100 dark:bg-green-950',
    icon: CheckCircle2 
  },
  pago: { 
    label: '💰 Pago', 
    color: 'text-emerald-700 dark:text-emerald-400', 
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
    icon: DollarSign 
  },
  reembolsado: { 
    label: '↩️ Reembolsado', 
    color: 'text-orange-600 dark:text-orange-500', 
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    icon: Undo2 
  },
  cancelado: { 
    label: 'Cancelado', 
    color: 'text-red-600 dark:text-red-500', 
    bgColor: 'bg-red-100 dark:bg-red-950',
    icon: XCircle 
  },
};

export default function StatusDropdown({ value, onChange, disabled }: StatusDropdownProps) {
  const currentStatus = STATUS_CONFIG[value as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pendente;
  const Icon = currentStatus.icon;

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'reembolsado') {
      if (!confirm('⚠️ Tem certeza que deseja marcar como REEMBOLSADO?\n\nIsso irá:\n• Reverter o pagamento\n• Subtrair da receita\n• Registrar no histórico financeiro')) {
        return;
      }
    }
    onChange(newStatus);
  };

  return (
    <Select value={value} onValueChange={handleStatusChange} disabled={disabled}>
      <SelectTrigger className={cn('w-[140px] h-8 text-xs px-2', currentStatus.bgColor)}>
        <SelectValue>
          <div className="flex items-center gap-1.5">
            <Icon className={cn('h-3.5 w-3.5', currentStatus.color)} />
            <span className={cn('truncate', currentStatus.color)}>{currentStatus.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const StatusIcon = config.icon;
          return (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <StatusIcon className={cn('h-4 w-4', config.color)} />
                <span>{config.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
