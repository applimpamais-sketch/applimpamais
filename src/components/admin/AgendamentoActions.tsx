import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Edit, Copy, XCircle } from 'lucide-react';
import { Agendamento } from '@/hooks/useAgendamentos';

interface AgendamentoActionsProps {
  agendamento: Agendamento;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onCancel?: () => void;
}

export default function AgendamentoActions({ 
  agendamento, 
  onEdit, 
  onDuplicate, 
  onCancel 
}: AgendamentoActionsProps) {
  const whatsappLink = `https://wa.me/55${agendamento.telefone.replace(/\D/g, '')}?text=Olá ${agendamento.nome_cliente}, tudo bem? Vim falar sobre seu agendamento.`;

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        size="sm"
        className="w-full bg-green-600 hover:bg-green-700 text-white col-span-2"
        onClick={() => window.open(whatsappLink, '_blank')}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        WhatsApp
      </Button>
      
      {onEdit && (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={onEdit}
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>
      )}
      
      {onDuplicate && (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={onDuplicate}
        >
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          Duplicar
        </Button>
      )}
      
      {onCancel && agendamento.status !== 'cancelado' && (
        <Button
          size="sm"
          variant="destructive"
          className="w-full col-span-2"
          onClick={onCancel}
        >
          <XCircle className="h-3.5 w-3.5 mr-1.5" />
          Cancelar
        </Button>
      )}
    </div>
  );
}
