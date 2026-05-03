import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CarrinhoAbandonado } from "@/hooks/useCarrinhosAbandonados";
import * as format from "@/utils/format";

interface RecoveryWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrinho: CarrinhoAbandonado | null;
  onSend: (message: string) => void;
}

export function RecoveryWhatsAppModal({
  open,
  onOpenChange,
  carrinho,
  onSend,
}: RecoveryWhatsAppModalProps) {
  const [message, setMessage] = useState('');

  const gerarMensagemPadrao = () => {
    if (!carrinho) return '';

    const nome = carrinho.nome_cliente || 'Cliente';
    const itens = Array.isArray(carrinho.itens_carrinho) ? carrinho.itens_carrinho : [];
    const listaItens = itens.map((item: any) => `• ${item.quantity}x ${item.name}`).join('\n');
    const total = format.formatCurrency(Number(carrinho.valor_total));

    if (carrinho.etapa_abandonada === 'carrinho') {
      return `Olá ${nome}! 👋

Vimos que você estava escolhendo serviços de limpeza mas não finalizou. 😊

🛒 Seu carrinho:
${listaItens}

💰 Valor: ${total}
${carrinho.cupom_codigo ? `🎫 Cupom ${carrinho.cupom_codigo} aplicado!` : ''}

Posso te ajudar a finalizar? É rapidinho!`;
    } else {
      return `Olá ${nome}! 👋

Você estava finalizando seu agendamento mas não concluiu. Ainda tem interesse? 😊

📦 Serviços:
${listaItens}

💰 Valor: ${total}
${carrinho.endereco ? `📍 ${carrinho.endereco}, ${carrinho.bairro}` : ''}
${carrinho.data_agendamento ? `📅 ${new Date(carrinho.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}

Falta pouco! Posso te ajudar a finalizar?`;
    }
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && carrinho) {
      setMessage(gerarMensagemPadrao());
    }
    onOpenChange(isOpen);
  };

  const handleSend = () => {
    onSend(message);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar WhatsApp de Recuperação</DialogTitle>
          <DialogDescription>
            Personalize a mensagem antes de enviar para {carrinho?.nome_cliente || 'o cliente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">📱 Para: {carrinho?.telefone}</p>
            <p className="text-sm text-muted-foreground">
              Etapa: {carrinho?.etapa_abandonada === 'carrinho' ? 'Carrinho' : 'Agendamento'}
            </p>
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={12}
            placeholder="Digite a mensagem..."
            className="font-mono text-sm"
          />

          <div className="text-xs text-muted-foreground">
            💡 Dica: Personalize a mensagem para aumentar as chances de recuperação
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={!message.trim()}>
            Enviar WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
