import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CarrinhoAbandonado } from "@/hooks/useCarrinhosAbandonados";
import * as format from "@/utils/format";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CarrinhoAbandonadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrinho: CarrinhoAbandonado | null;
}

export function CarrinhoAbandonadoModal({
  open,
  onOpenChange,
  carrinho,
}: CarrinhoAbandonadoModalProps) {
  const [notas, setNotas] = useState(carrinho?.notas_internas || '');
  const [salvando, setSalvando] = useState(false);

  if (!carrinho) return null;

  const itens = Array.isArray(carrinho.itens_carrinho) ? carrinho.itens_carrinho : [];

  const handleSalvarNotas = async () => {
    setSalvando(true);
    try {
      const { error } = await supabase
        .from('carrinhos_abandonados')
        .update({ notas_internas: notas })
        .eq('id', carrinho.id);

      if (error) throw error;

      toast.success('Notas salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
      toast.error('Erro ao salvar notas');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Carrinho Abandonado</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info do Cliente */}
          <div>
            <h3 className="font-semibold mb-3">👤 Informações do Cliente</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nome:</span>
                <p className="font-medium">{carrinho.nome_cliente || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Telefone:</span>
                <p className="font-medium">{carrinho.telefone || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{carrinho.email || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">CEP:</span>
                <p className="font-medium">{carrinho.cep || 'Não informado'}</p>
              </div>
            </div>

            {carrinho.endereco && (
              <div className="mt-4">
                <span className="text-muted-foreground text-sm">Endereço completo:</span>
                <p className="font-medium">
                  {carrinho.endereco}, {carrinho.bairro} - {carrinho.cidade}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Status e Tracking */}
          <div>
            <h3 className="font-semibold mb-3">📊 Status e Tracking</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Etapa:</span>
                <div className="mt-1">
                  <Badge variant={carrinho.etapa_abandonada === 'carrinho' ? 'secondary' : 'outline'}>
                    {carrinho.etapa_abandonada === 'carrinho' ? 'Carrinho' : 'Agendamento'}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Badge>{carrinho.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Progresso:</span>
                <p className="font-medium">{carrinho.percentual_preenchimento}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tentativas de contato:</span>
                <p className="font-medium">{carrinho.tentativas_contato}</p>
              </div>
            </div>

            {carrinho.ultima_tentativa_contato && (
              <div className="mt-4 text-sm">
                <span className="text-muted-foreground">Último contato:</span>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(carrinho.ultima_tentativa_contato), {
                    locale: ptBR,
                    addSuffix: true,
                  })}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Itens do Carrinho */}
          <div>
            <h3 className="font-semibold mb-3">🛒 Itens do Carrinho ({itens.length})</h3>
            <div className="space-y-3">
              {itens.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.details}</p>
                    <p className="text-sm">Quantidade: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{format.formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format.formatCurrency(item.price)} cada
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Valor Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {format.formatCurrency(Number(carrinho.valor_total))}
                </span>
              </div>

              {carrinho.cupom_codigo && (
                <div className="mt-2 text-sm">
                  <Badge variant="outline" className="bg-green-50">
                    Cupom {carrinho.cupom_codigo}: -{carrinho.cupom_desconto_percentual}%
                    ({format.formatCurrency(Number(carrinho.valor_desconto))})
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {carrinho.data_agendamento && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">📅 Data Selecionada</h3>
                <p className="font-medium">
                  {new Date(carrinho.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR', {
                    dateStyle: 'long',
                  })}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Notas Internas */}
          <div>
            <h3 className="font-semibold mb-3">📝 Notas Internas</h3>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Adicione notas sobre este carrinho abandonado..."
              rows={4}
            />
            <Button
              onClick={handleSalvarNotas}
              disabled={salvando}
              className="mt-2"
            >
              {salvando ? 'Salvando...' : 'Salvar Notas'}
            </Button>
          </div>

          <Separator />

          {/* Informações Técnicas */}
          <div>
            <h3 className="font-semibold mb-3">🔧 Informações Técnicas</h3>
            <div className="text-xs space-y-2 font-mono bg-muted p-3 rounded">
              <p>
                <span className="text-muted-foreground">Session ID:</span> {carrinho.session_id}
              </p>
              <p>
                <span className="text-muted-foreground">Criado em:</span>{' '}
                {new Date(carrinho.created_at).toLocaleString('pt-BR')}
              </p>
              <p>
                <span className="text-muted-foreground">Última atividade:</span>{' '}
                {formatDistanceToNow(new Date(carrinho.last_activity), {
                  locale: ptBR,
                  addSuffix: true,
                })}
              </p>
              {carrinho.user_agent && (
                <p>
                  <span className="text-muted-foreground">User Agent:</span>{' '}
                  {carrinho.user_agent.substring(0, 80)}...
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
