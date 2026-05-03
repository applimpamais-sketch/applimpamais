import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, MessageCircle } from 'lucide-react';
import { Agendamento } from '@/hooks/useAgendamentos';
import { cn } from '@/lib/utils';

interface AgendamentosBulkActionsProps {
  agendamentos: Agendamento[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onBulkStatusUpdate: (status: string) => void;
  onBulkExport: () => void;
  onBulkWhatsApp?: () => void;
}

export default function AgendamentosBulkActions({
  agendamentos,
  selectedIds,
  onSelectAll,
  onBulkStatusUpdate,
  onBulkExport,
  onBulkWhatsApp
}: AgendamentosBulkActionsProps) {
  const allSelected = selectedIds.length === agendamentos.length && agendamentos.length > 0;
  const someSelected = selectedIds.length > 0;

  // Only render when there are selected items
  if (!someSelected) {
    return null;
  }

  return (
    <Card className={cn(
      "backdrop-blur-md bg-primary/5 border-primary/20 rounded-xl shadow-md p-3 mb-4",
      "animate-in slide-in-from-top-2 duration-200"
    )}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox 
            checked={allSelected}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm font-medium text-primary">
            {selectedIds.length} selecionado(s)
          </span>
        </div>

        <div className="flex flex-wrap gap-2 flex-1">
          <Select onValueChange={onBulkStatusUpdate}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Atualizar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={onBulkExport} className="h-8 text-xs">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exportar
          </Button>

          {onBulkWhatsApp && (
            <Button variant="outline" size="sm" onClick={onBulkWhatsApp} className="h-8 text-xs">
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              WhatsApp
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
