import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAlugueis } from '@/hooks/useAlugueis';
import { useUpsellsPublic } from '@/hooks/useUpsellsPublic';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Package, Check, ChevronDown, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { PERIODO_INFO } from '@/data/periodo-info';
import type { Aluguel } from '@/services/api';

interface KitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipamento: string | null;
  preSelectedPeriodo?: string | null;
  onConfirm: (items: any[]) => void;
}


const KitDetailsModal = ({ isOpen, onClose, equipamento, preSelectedPeriodo, onConfirm }: KitDetailsModalProps) => {
  const isMobile = useIsMobile();
  const { data: alugueis } = useAlugueis();
  const { data: upsellsData = [], isLoading: isLoadingUpsells } = useUpsellsPublic('locacoes');
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set());
  const [availablePeriods, setAvailablePeriods] = useState<Aluguel[]>([]);
  const [currentAluguel, setCurrentAluguel] = useState<Aluguel | null>(null);
  const [expandedPeriodo, setExpandedPeriodo] = useState<string>('');
  const [isIncludedItemsExpanded, setIsIncludedItemsExpanded] = useState(true);

  useEffect(() => {
    if (!equipamento || !alugueis) return;
    
    const filtered = alugueis.filter(a => a.equipamento === equipamento);
    setAvailablePeriods(filtered);
    
    // Se vier com período pré-selecionado, usar ele
    if (preSelectedPeriodo) {
      setSelectedPeriodo(preSelectedPeriodo);
    } else if (filtered.length > 0) {
      setSelectedPeriodo(filtered[0].periodo_aluguel);
    }
  }, [equipamento, alugueis, preSelectedPeriodo]);

  useEffect(() => {
    if (!selectedPeriodo || !availablePeriods.length) {
      setCurrentAluguel(null);
      return;
    }

    const aluguel = availablePeriods.find(a => a.periodo_aluguel === selectedPeriodo);
    setCurrentAluguel(aluguel || null);
  }, [selectedPeriodo, availablePeriods]);

  const calculateTotal = () => {
    if (!currentAluguel) return 0;
    
    const basePrice = currentAluguel.preco;
    const upsellsTotal = Array.from(selectedUpsells).reduce((sum, upsellId) => {
      const upsell = upsellsData.find(u => u.id === upsellId);
      return sum + (upsell?.preco || 0);
    }, 0);
    
    return basePrice + upsellsTotal;
  };

  const handleConfirm = () => {
    if (!currentAluguel || !equipamento) return;

    const items = [
      {
        id: `${equipamento}-${selectedPeriodo}-${Date.now()}`,
        name: equipamento,
        details: selectedPeriodo,
        quantity: 1,
        price: currentAluguel.preco,
      }
    ];
    
    Array.from(selectedUpsells).forEach(upsellId => {
      const upsell = upsellsData.find(u => u.id === upsellId);
      if (upsell) {
        items.push({
          id: `${upsellId}-${Date.now()}-${Math.random()}`,
          name: upsell.nome,
          details: 'Adicional',
          quantity: 1,
          price: upsell.preco,
        });
      }
    });
    
    onConfirm(items);
    onClose();
    setSelectedPeriodo('');
    setSelectedUpsells(new Set());
  };

  if (!isOpen || !equipamento) return null;

  const modalContent = (
    <div className="space-y-6 py-4">
      {equipamento && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{equipamento}</h3>
          {preSelectedPeriodo ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-medium">
                {preSelectedPeriodo}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {PERIODO_INFO[preSelectedPeriodo]?.subtitle}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Escolha o período de aluguel que melhor atende suas necessidades
            </p>
          )}
        </div>
      )}

      {/* SEÇÃO DE SELEÇÃO DE PERÍODO - Só mostra se NÃO vier pré-selecionado */}
      {!preSelectedPeriodo && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Escolha o período</Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availablePeriods.map((period) => {
              const info = PERIODO_INFO[period.periodo_aluguel];
              const isSelected = selectedPeriodo === period.periodo_aluguel;
              const isExpanded = expandedPeriodo === period.periodo_aluguel;
              
              return (
                <Collapsible
                  key={period.id}
                  open={isExpanded}
                  onOpenChange={(open) => {
                    setExpandedPeriodo(open ? period.periodo_aluguel : '');
                  }}
                  className={cn(
                    "rounded-xl border-2 transition-all hover:scale-[1.01] active:scale-[0.99]",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-medium" 
                      : "border-border hover:border-primary/50 shadow-soft"
                  )}
                >
                  <div className="p-4">
                    <button
                      onClick={() => setSelectedPeriodo(period.periodo_aluguel)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-colors",
                          isSelected ? "border-primary" : "border-muted-foreground/30"
                        )}>
                          {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base mb-1 text-foreground">
                            {period.periodo_aluguel}
                          </h4>
                          {info && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {info.subtitle}
                            </p>
                          )}
                          <div className="flex items-baseline gap-2">
                            <p className="text-xl font-bold text-foreground">
                              {formatCurrency(period.preco)}
                            </p>
                            {info?.subprice && (
                              <span className="text-xs text-muted-foreground">
                                ({info.subprice})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Preview compacto quando colapsado */}
                    {!isExpanded && info && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Package className="w-3 h-3" />
                          {info.included[0]} + {info.included.length - 1} itens
                        </p>
                      </div>
                    )}

                    {/* Botão para expandir/colapsar */}
                    <CollapsibleTrigger className="w-full mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center justify-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        <span>{isExpanded ? 'Ocultar' : 'Ver'} itens inclusos</span>
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform duration-300",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </CollapsibleTrigger>

                    {/* Conteúdo expansível com itens inclusos */}
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="pt-3 space-y-2">
                        <h5 className="font-semibold text-xs flex items-center gap-2 text-foreground">
                          <Package className="w-3 h-3 text-primary" />
                          Incluso no aluguel:
                        </h5>
                        <ul className="space-y-1.5">
                          {info?.included.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}

      {/* DETALHES DO PERÍODO PRÉ-SELECIONADO */}
      {preSelectedPeriodo && selectedPeriodo && currentAluguel && (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-blue-50/50 border-primary/20">
          <div className="space-y-3">
            {/* Preço Grande */}
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor do aluguel</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(currentAluguel.preco)}
                </p>
                {PERIODO_INFO[preSelectedPeriodo]?.subprice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {PERIODO_INFO[preSelectedPeriodo].subprice}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Itens Inclusos - Expansível */}
            <Collapsible
              open={isIncludedItemsExpanded}
              onOpenChange={setIsIncludedItemsExpanded}
              className="space-y-2"
            >
              {/* Header clicável */}
              <CollapsibleTrigger className="w-full group">
                <div className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                  <h5 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                    <Package className="w-4 h-4 text-primary" />
                    Incluso no aluguel:
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {PERIODO_INFO[preSelectedPeriodo]?.included.length} itens
                    </Badge>
                  </h5>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-primary transition-transform duration-300",
                    isIncludedItemsExpanded && "rotate-180"
                  )} />
                </div>
              </CollapsibleTrigger>

              {/* Conteúdo expansível */}
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <ul className="space-y-1.5 pt-2">
                  {PERIODO_INFO[preSelectedPeriodo]?.included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </Card>
      )}

      {selectedPeriodo && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <h4 className="font-semibold text-sm text-muted-foreground">
              Adicione mais itens (opcional)
            </h4>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          {isLoadingUpsells ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {upsellsData.map((upsell) => {
                const isSelected = selectedUpsells.has(upsell.id);
                
                return (
                  <button
                    key={upsell.id}
                    onClick={() => {
                      const newSet = new Set(selectedUpsells);
                      if (isSelected) {
                        newSet.delete(upsell.id);
                      } else {
                        newSet.add(upsell.id);
                      }
                      setSelectedUpsells(newSet);
                    }}
                    className={cn(
                      "w-full p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between hover:scale-[1.01] active:scale-[0.99]",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                        isSelected 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground/30"
                      )}>
                        {isSelected && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-sm">{upsell.nome}</p>
                      </div>
                    </div>
                    
                    <p className="font-semibold text-primary">
                      + {formatCurrency(upsell.preco)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedPeriodo && currentAluguel && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {selectedPeriodo}
              </span>
              <span className="font-medium">
                {formatCurrency(currentAluguel.preco)}
              </span>
            </div>
            
            {Array.from(selectedUpsells).map(upsellId => {
              const upsell = upsellsData.find(u => u.id === upsellId);
              if (!upsell) return null;
              
              return (
                <div key={upsellId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {upsell.nome}
                  </span>
                  <span className="font-medium">
                    + {formatCurrency(upsell.preco)}
                  </span>
                </div>
              );
            })}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-base">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-12 text-base font-semibold order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 h-12 text-base font-semibold order-1 sm:order-2"
              >
                Adicionar ao Carrinho
              </Button>
            </div>
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto">
        {modalContent}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};

export default KitDetailsModal;
