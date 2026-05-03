import { ShoppingCart, X, Plus, Minus, Ticket, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCupomValidation } from '@/hooks/useCupomValidation';
import { getValidParceiroRef } from '@/utils/parceiroRef';
import { getValidCanalRef } from '@/utils/canalRef';
import { formatCurrency } from '@/utils/format';
interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: number;
}

interface MobileCartDrawerProps {
  items: CartItem[];
  onScheduleClick?: () => void;
  cartItemsCount: number;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onAddUpsell?: (upsell: any) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MobileCartDrawer = ({ items, cartItemsCount, onUpdateQuantity, onRemoveItem, onAddUpsell, isOpen: externalIsOpen, onOpenChange }: MobileCartDrawerProps) => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const {
    cupomAplicado,
    inputCupom,
    setInputCupom,
    erro,
    validarCupom,
    calcularDesconto,
    removerCupom,
  } = useCupomValidation(items);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const desconto = calcularDesconto();
  const total = subtotal - desconto;

  const handleProceedToSchedule = () => {
    setIsOpen(false);

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

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem?.(itemId);
    } else {
      onUpdateQuantity?.(itemId, newQuantity);
    }
  };

  // Trigger animation when cart count changes
  useEffect(() => {
    if (cartItemsCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartItemsCount]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`lg:hidden relative text-primary hover:text-primary-hover hover:bg-primary/10 transition-all duration-200 ${
            isAnimating ? 'animate-cart-bounce' : ''
          }`}
        >
          <ShoppingCart 
            size={18} 
            className={`transition-all duration-300 ${
              isAnimating ? 'scale-110' : 'scale-100'
            }`} 
          />
          {cartItemsCount > 0 && (
            <Badge 
              className={`absolute -top-2 -right-2 min-h-6 min-w-6 px-2 py-1 flex items-center justify-center text-sm font-bold bg-primary text-white ring-2 ring-white shadow-lg animate-scale-in rounded-full ${
                isAnimating ? 'animate-pulse' : ''
              }`}
            >
              {cartItemsCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:w-96 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-3 text-left">
              <ShoppingCart size={20} className="text-blue-600" />
              <span>Carrinho ({cartItemsCount})</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground flex items-center justify-center">
                  <ShoppingCart size={48} strokeWidth={1} />
                </div>
                <p className="text-foreground font-medium">Carrinho vazio</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione itens para continuar
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="px-4 pt-4 space-y-3">
                  {items.map((item) => (
                    <Card key={item.id} className="p-4 border border-border">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-2">
                            <h3 className="font-medium text-sm text-foreground leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {item.details}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onRemoveItem?.(item.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="h-7 w-7"
                            >
                              <Minus size={12} />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="h-7 w-7"
                            >
                              <Plus size={12} />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.price)} cada
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* SEÇÃO DE CUPOM */}
                <div className="px-4 pb-4">
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

                      {cupomAplicado?.auto_aplicar && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Cupom aplicado automaticamente!
                        </p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t bg-muted/30 p-4 space-y-4">
              {/* Total com Desconto */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {desconto > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Desconto ({cupomAplicado?.codigo}):
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      - {formatCurrency(desconto)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="font-bold text-xl text-foreground">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Adicionar mais itens
                </Button>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleProceedToSchedule}
                  disabled={items.length === 0}
                >
                  Prosseguir para Agendamento
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileCartDrawer;