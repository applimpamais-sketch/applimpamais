import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWhatsAppMensagens } from '@/hooks/useWhatsAppConversas';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Bot, Image as ImageIcon, Mic } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface ConversaDetailsModalProps {
  conversaId: string;
  open: boolean;
  onClose: () => void;
}

export function ConversaDetailsModal({ conversaId, open, onClose }: ConversaDetailsModalProps) {
  const { data: mensagens, isLoading } = useWhatsAppMensagens(conversaId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Histórico da Conversa</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {mensagens && mensagens.length > 0 ? (
                mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.direcao === 'saida' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.direcao === 'saida' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {msg.direcao === 'saida' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    {/* Mensagem */}
                    <div className={`flex-1 ${msg.direcao === 'saida' ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.direcao === 'entrada' && (
                          <Badge variant="outline" className="text-xs">
                            Cliente
                          </Badge>
                        )}
                        {msg.direcao === 'saida' && (
                          <Badge variant="secondary" className="text-xs ml-auto">
                            Bot
                          </Badge>
                        )}
                      </div>

                      <div className={`inline-block p-3 rounded-lg max-w-md ${
                        msg.direcao === 'saida'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}>
                        {/* Tipo de mensagem */}
                        {msg.tipo === 'imagem' && (
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-xs">Imagem</span>
                          </div>
                        )}
                        {msg.tipo === 'audio' && (
                          <div className="flex items-center gap-2 mb-2">
                            <Mic className="h-4 w-4" />
                            <span className="text-xs">Áudio</span>
                          </div>
                        )}

                        {/* Conteúdo */}
                        {msg.imagem_url && (
                          <img
                            src={msg.imagem_url}
                            alt="Imagem enviada"
                            className="max-w-full rounded mb-2"
                          />
                        )}
                        {msg.conteudo && (
                          <p className="whitespace-pre-wrap text-sm">{msg.conteudo}</p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.criado_em).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma mensagem nesta conversa
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}