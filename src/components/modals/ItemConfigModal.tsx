import { useState, useEffect } from 'react';
import { X, Minus, Plus, Sparkles, Shield, Stars } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Servico } from '@/services/api';
import { useServicos } from '@/hooks/useServicos';
import { cn } from '@/lib/utils';

interface ItemConfigModalProps {
  subcategoria: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
}

const ItemConfigModal = ({ subcategoria, isOpen, onClose, onAddToCart }: ItemConfigModalProps) => {
  const { data: servicos } = useServicos();
  const isMobile = useIsMobile();
  const [quantity, setQuantity] = useState(1);
  const [service, setService] = useState<'limpeza' | 'impermeabilizacao' | 'ambos'>('ambos');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedTamanho, setSelectedTamanho] = useState<string>('');
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [availableTamanhos, setAvailableTamanhos] = useState<string[]>([]);
  const [currentServico, setCurrentServico] = useState<Servico | null>(null);

  // Filtra serviços da subcategoria selecionada
  useEffect(() => {
    if (!subcategoria || !servicos) return;
    
    const filtered = servicos.filter(s => s.subcategoria === subcategoria);
    const items = Array.from(new Set(filtered.map(s => s.item)));
    setAvailableItems(items);
    
    if (items.length === 1) {
      setSelectedItem(items[0]);
    } else {
      setSelectedItem('');
      setSelectedTamanho('');
    }
  }, [subcategoria, servicos]);

  // Atualiza tamanhos disponíveis quando item é selecionado
  useEffect(() => {
    if (!selectedItem || !servicos || !subcategoria) return;
    
    const filtered = servicos.filter(s => 
      s.subcategoria === subcategoria && s.item === selectedItem
    );
    const tamanhos = filtered.map(s => s.tamanho || 'Padrão').filter(t => t);
    setAvailableTamanhos(tamanhos);
    
    if (tamanhos.length === 1) {
      setSelectedTamanho(tamanhos[0]);
    } else if (tamanhos.length === 0) {
      setSelectedTamanho('Padrão');
    } else {
      setSelectedTamanho('');
    }
  }, [selectedItem, servicos, subcategoria]);

  // Atualiza o serviço atual
  useEffect(() => {
    if (!servicos || !subcategoria || !selectedItem) {
      setCurrentServico(null);
      return;
    }

    const servico = servicos.find(s => 
      s.subcategoria === subcategoria && 
      s.item === selectedItem &&
      (selectedTamanho === 'Padrão' ? !s.tamanho : s.tamanho === selectedTamanho)
    );
    
    setCurrentServico(servico || null);
    
    // Define serviço padrão baseado no que está disponível
    if (servico) {
      if (servico.preco_limpeza_impermeabilizacao) {
        setService('ambos');
      } else if (servico.preco_limpeza) {
        setService('limpeza');
      } else if (servico.preco_impermeabilizacao) {
        setService('impermeabilizacao');
      }
    }
  }, [servicos, subcategoria, selectedItem, selectedTamanho]);
  
  // Função para formatar preço em BRL
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  // Calcula preço em tempo real
  const calculateCurrentPrice = () => {
    if (!currentServico) return 0;
    
    if (service === 'limpeza' && currentServico.preco_limpeza) {
      return currentServico.preco_limpeza;
    }
    if (service === 'impermeabilizacao' && currentServico.preco_impermeabilizacao) {
      return currentServico.preco_impermeabilizacao;
    }
    if (service === 'ambos' && currentServico.preco_limpeza_impermeabilizacao) {
      return currentServico.preco_limpeza_impermeabilizacao;
    }
    return 0;
  };

  // Verifica se é um valor "WhatsApp"
  const isWhatsAppPrice = (price: any): boolean => {
    return price === null || price === 'WhatsApp' || typeof price === 'string';
  };

  if (!isOpen || !subcategoria) return null;

  const handleAddToCart = () => {
    if (!currentServico) return;

    const serviceLabels = {
      'limpeza': 'Limpeza',
      'impermeabilizacao': 'Impermeabilização',
      'ambos': 'Limpeza + Impermeabilização'
    };

    const cartItem = {
      id: `${subcategoria}-${selectedItem}-${selectedTamanho}-${Date.now()}`,
      name: `${selectedItem}${selectedTamanho && selectedTamanho !== 'Padrão' ? ` (${selectedTamanho})` : ''}`,
      details: serviceLabels[service],
      quantity,
      price: calculateCurrentPrice(),
    };
    onAddToCart(cartItem);
    onClose();
    // Reset form
    setQuantity(1);
    setSelectedItem('');
    setSelectedTamanho('');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de solicitar orçamento para: ${subcategoria} - ${selectedItem}${selectedTamanho && selectedTamanho !== 'Padrão' ? ` (${selectedTamanho})` : ''}`
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const currentPrice = calculateCurrentPrice();
  const hasValidSelection = selectedItem && (availableTamanhos.length === 0 || selectedTamanho);
  
  // Verifica se todos os preços são WhatsApp
  const allPricesWhatsApp = currentServico && 
    isWhatsAppPrice(currentServico.preco_limpeza) && 
    isWhatsAppPrice(currentServico.preco_impermeabilizacao) &&
    isWhatsAppPrice(currentServico.preco_limpeza_impermeabilizacao);

  const modalContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 pb-4 sm:pb-6 flex-shrink-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Icons.Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0 pr-10">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">{subcategoria}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Escolha modelo e serviços</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Grid de Seleção: Modelo e Material */}
        <div className={cn(
          "grid gap-6",
          availableTamanhos.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        )}>
          {/* Coluna Modelo */}
          {availableItems.length > 1 && (
            <div>
              <Label className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 block">Modelo</Label>
              <div className={cn(
                "gap-2",
                availableItems.length > 4 
                  ? "grid grid-cols-2" 
                  : "space-y-2"
              )}>
                {availableItems.map((item, index) => (
                  <button
                    key={item}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-2 transition-all w-full text-left",
                      selectedItem === item
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">
                      <div className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 rounded border-2 transition-all",
                        selectedItem === item
                          ? "border-primary bg-primary"
                          : "border-border"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-base font-medium text-foreground truncate block">{item}</span>
                      {index === 0 && (
                        <span className="text-xs text-primary">Popular</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Coluna Material/Tamanho */}
          {selectedItem && availableTamanhos.length > 1 && (
            <div>
              <Label className="text-sm font-semibold text-foreground mb-3 block">Tamanho</Label>
              <div className={cn(
                "gap-2",
                availableTamanhos.length > 4 
                  ? "grid grid-cols-2" 
                  : "space-y-2"
              )}>
                {availableTamanhos.map((tamanho) => (
                  <button
                    key={tamanho}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 transition-all w-full text-left",
                      selectedTamanho === tamanho
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedTamanho(tamanho)}
                  >
                    <div className="w-5 h-5 flex-shrink-0">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 transition-all",
                        selectedTamanho === tamanho
                          ? "border-primary bg-primary"
                          : "border-border"
                      )} />
                    </div>
                    <span className="font-medium text-foreground flex-1">{tamanho}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

          {/* WhatsApp Alert */}
          {hasValidSelection && allPricesWhatsApp && (
            <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
              <p className="text-sm text-foreground mb-3">
                Este serviço requer orçamento personalizado. Entre em contato via WhatsApp para solicitar.
              </p>
              <Button onClick={handleWhatsApp} className="w-full">
                Solicitar Orçamento via WhatsApp
              </Button>
            </Card>
          )}

        {/* Services Section */}
        {hasValidSelection && !allPricesWhatsApp && currentServico && (
          <div>
            <Label className="text-sm font-semibold text-foreground mb-3 block">Serviços</Label>
            <div className="space-y-3">
              {/* Limpeza + Impermeabilização */}
              {currentServico.preco_limpeza_impermeabilizacao && (
                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-all border-2",
                    service === 'ambos'
                      ? 'bg-primary/5 border-primary'
                      : 'bg-background border-border hover:bg-muted/50 hover:border-primary/50'
                  )}
                  onClick={() => setService('ambos')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Stars className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Limpeza e Impermeabilização</span>
                        <span className="font-bold text-lg text-foreground">
                          {formatPrice(currentServico.preco_limpeza_impermeabilizacao)}
                        </span>
                      </div>
                      <p className="text-xs text-primary mt-0.5">Completo</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Limpeza */}
              {currentServico.preco_limpeza && (
                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-all border-2",
                    service === 'limpeza'
                      ? 'bg-primary/5 border-primary'
                      : 'bg-background border-border hover:bg-muted/50 hover:border-primary/50'
                  )}
                  onClick={() => setService('limpeza')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Limpeza</span>
                        <span className="font-bold text-lg text-foreground">
                          {formatPrice(currentServico.preco_limpeza)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Impermeabilização */}
              {currentServico.preco_impermeabilizacao && (
                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-all border-2",
                    service === 'impermeabilizacao'
                      ? 'bg-primary/5 border-primary'
                      : 'bg-background border-border hover:bg-muted/50 hover:border-primary/50'
                  )}
                  onClick={() => setService('impermeabilizacao')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">Impermeabilização</span>
                        <span className="font-bold text-lg text-foreground">
                          {formatPrice(currentServico.preco_impermeabilizacao)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Quantity */}
        {hasValidSelection && !allPricesWhatsApp && (
          <div>
            <Label className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 block">Quantidade</Label>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-11 w-11 sm:h-12 sm:w-12"
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <span className="text-xl sm:text-2xl font-bold w-14 sm:w-16 text-center text-foreground">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-11 w-11 sm:h-12 sm:w-12"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        {hasValidSelection && !allPricesWhatsApp && currentPrice > 0 && (
          <Card className="p-4 bg-muted/30 border-border">
            <h3 className="font-semibold text-foreground mb-2">Resumo</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {selectedItem}{selectedTamanho && selectedTamanho !== 'Padrão' ? ` (${selectedTamanho})` : ''} • {service === 'ambos' ? 'Limpeza + Impermeabilização' : service === 'limpeza' ? 'Limpeza' : 'Impermeabilização'} • Quantidade {quantity}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-base font-medium text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(currentPrice * quantity)}
              </span>
            </div>
          </Card>
        )}
      </div>
      
      {/* Footer Buttons */}
      {hasValidSelection && !allPricesWhatsApp && (
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-border bg-background flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="flex-1 h-11 sm:h-10 text-sm sm:text-base order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddToCart} 
            className="flex-1 h-11 sm:h-10 text-sm sm:text-base order-1 sm:order-2"
            disabled={currentPrice === 0}
          >
            Adicionar ao Carrinho
          </Button>
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[92vh] p-0">
        {modalContent}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};

export default ItemConfigModal;
