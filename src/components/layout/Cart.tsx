import { Package, X, Minus, Plus, Ticket, AlertCircle, Sparkles, Gift } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useCupomValidation } from '@/hooks/useCupomValidation';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { useEffect } from 'react';
import { trackAddToCart } from '@/utils/facebookPixel';
import { getValidParceiroRef } from '@/utils/parceiroRef';
import { getValidCanalRef } from '@/utils/canalRef';
interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onAddUpsell?: (upsell: any) => void;
}

const Cart = ({ items, onUpdateQuantity, onRemoveItem }: CartProps) => {
  const navigate = useNavigate();
  const { updateSession } = useSessionTracking();
  const {
    cupomAplicado,
    inputCupom,
    setInputCupom,
    erro,
    validarCupom,
    calcularDesconto,
    removerCupom,
    origemCupom,
  } = useCupomValidation(items);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const desconto = calcularDesconto();
  const total = subtotal - desconto;

  // Atualizar sessão quando carrinho mudar
  useEffect(() => {
    if (items.length > 0) {
      updateSession({
        etapa: 'carrinho',
        carrinhoItems: items.length,
        carrinhoValor: total,
      });
    }
  }, [items, total, updateSession]);

  const handleProceedToSchedule = () => {
    const parceiroRef = getValidParceiroRef();
    const canalRef = parceiroRef ? null : getValidCanalRef();

    const checkoutUrl = parceiroRef
      ? `/agendamento?ref=${encodeURIComponent(parceiroRef)}`
      : canalRef
        ? `/agendamento?ref=${encodeURIComponent(canalRef)}`
        : '/agendamento';
    
    navigate(checkoutUrl, {
      state: { 
        cartItems: items,
        cupomAplicado: cupomAplicado 
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (onUpdateQuantity) {
      const item = items.find(i => i.id === itemId);
      if (item && quantity > item.quantity) {
        // Track only when increasing quantity (adding to cart)
        trackAddToCart({ ...item, quantity: 1 });
      }
      onUpdateQuantity(itemId, quantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="w-full lg:w-96 xl:w-[28rem] bg-card border-l border-border h-full flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 p-4 bg-muted/50 rounded-full">
            <Package size={32} strokeWidth={1.5} className="text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Carrinho vazio</h3>
          <p className="text-sm text-muted-foreground">
            Adicione serviços para continuar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[400px] xl:w-[450px] bg-card border-l border-border h-full flex flex-col">
      <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border px-4 lg:px-5 xl:px-6 py-4 lg:py-5 z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h1 className="text-lg lg:text-xl font-bold text-foreground">Carrinho</h1>
          </div>
          <p className="text-muted-foreground text-xs lg:text-sm">
            Revise seus itens e prossiga
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 lg:p-5 xl:p-6 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4 border">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <h3 className="font-medium text-sm leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.details}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem?.(item.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                  >
                    <X size={14} />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="h-7 w-7"
                    >
                      <Minus size={12} />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-7 w-7"
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      R$ {item.price.toFixed(2).replace('.', ',')} cada
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* SEÇÃO DE CUPOM */}
          <Card className="p-4 border-dashed border-2 border-primary/30">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-primary" />
                <Label className="font-semibold">Cupom de Desconto</Label>
              </div>

              {cupomAplicado ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                      {cupomAplicado.codigo}
                    </Badge>
                    <span className="text-sm text-green-700 dark:text-green-300">
                      {cupomAplicado.desconto_percentual}% OFF
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removerCupom}
                    className="h-6 w-6 p-0 text-green-700 dark:text-green-300 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={inputCupom}
                    onChange={(e) => setInputCupom(e.target.value.toUpperCase())}
                    placeholder="Digite o código"
                    className="font-mono"
                    maxLength={20}
                  />
                  <Button
                    onClick={() => validarCupom(inputCupom)}
                    disabled={!inputCupom}
                    size="sm"
                  >
                    Aplicar
                  </Button>
                </div>
              )}

              {erro && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {erro}
                </p>
              )}

              {origemCupom === 'parceiro' && (
                <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Cupom de indicação aplicado!
                </p>
              )}

              {origemCupom === 'auto' && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Cupom aplicado automaticamente!
                </p>
              )}
            </div>
          </Card>

          {/* RESUMO COM DESCONTO */}
          <Card className="p-4 lg:p-5 xl:p-6 bg-muted/30">
            <h3 className="text-base lg:text-lg font-semibold mb-3">Resumo</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {desconto > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Desconto ({cupomAplicado?.codigo})
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    - R$ {desconto.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex items-center justify-between">
                <h3 className="text-base lg:text-lg font-semibold">Total</h3>
                <span className="text-xl lg:text-2xl font-bold text-primary">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-xs lg:text-sm mt-4">
              <p className="text-foreground">
                {items.map(i => i.name).join(' • ')}
              </p>
              <p className="text-muted-foreground">
                Quantidade total: {items.reduce((sum, i) => sum + i.quantity, 0)}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border p-4 lg:p-5 xl:p-6">
        <Button
          onClick={handleProceedToSchedule}
          disabled={items.length === 0}
          className="w-full h-11 lg:h-12 text-sm lg:text-base font-semibold"
        >
          Prosseguir para Agendamento
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-3">
          💳 Pagamento na hora do serviço
        </p>
      </div>
    </div>
  );
};

export default Cart;