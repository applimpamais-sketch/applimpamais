import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Star, Phone, User, Calendar, MessageSquare, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import type { Feedback } from '@/hooks/useAvaliacoesConfig';

interface FeedbackDetailsModalProps {
  feedback: Feedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notaMinima: number;
}

export function FeedbackDetailsModal({ feedback, open, onOpenChange, notaMinima }: FeedbackDetailsModalProps) {
  if (!feedback) return null;

  const nota = feedback.nota_geral || 0;
  const isPositivo = nota >= notaMinima;

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Detalhes do Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho com nota */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{feedback.nome_cliente || 'Cliente não identificado'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{formatPhone(feedback.telefone)}</span>
              </div>
              {feedback.created_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(feedback.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Star className={`h-5 w-5 ${isPositivo ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                <span className="text-2xl font-bold">{nota}</span>
                <span className="text-muted-foreground">/10</span>
              </div>
              <Badge variant={isPositivo ? 'default' : 'destructive'} className={isPositivo ? 'bg-green-500' : ''}>
                {isPositivo ? 'Promotor' : 'Detrator'}
              </Badge>
            </div>
          </div>

          {/* Comentário Positivo */}
          {feedback.comentario_positivo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <ThumbsUp className="h-4 w-4" />
                O que gostou
              </div>
              <p className="text-sm p-3 rounded-lg bg-green-50 border border-green-100 dark:bg-green-950/20 dark:border-green-900">
                {feedback.comentario_positivo}
              </p>
            </div>
          )}

          {/* Comentário Negativo */}
          {feedback.comentario_negativo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                <ThumbsDown className="h-4 w-4" />
                O que não gostou
              </div>
              <p className="text-sm p-3 rounded-lg bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-900">
                {feedback.comentario_negativo}
              </p>
            </div>
          )}

          {/* Sugestão */}
          {feedback.sugestao_melhoria && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <Lightbulb className="h-4 w-4" />
                Sugestão de melhoria
              </div>
              <p className="text-sm p-3 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
                {feedback.sugestao_melhoria}
              </p>
            </div>
          )}

          {/* Mensagem se não houver comentários */}
          {!feedback.comentario_positivo && !feedback.comentario_negativo && !feedback.sugestao_melhoria && (
            <p className="text-center text-muted-foreground py-4">
              Este feedback não possui comentários adicionais.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
