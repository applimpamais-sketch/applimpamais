import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2, MessageCircle, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SaasModulo {
  id: string;
  codigo: string;
  nome: string;
  preco_base: number | null;
  categoria: string | null;
}

const BASE_PRICE = 147; // Preço base do dashboard

export default function ModularPricing() {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: modulos, isLoading } = useQuery({
    queryKey: ['saas-modulos-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saas_modulos')
        .select('id, codigo, nome, preco_base, categoria')
        .eq('ativo', true)
        .neq('codigo', 'dashboard_gestao') // Exclude base module
        .order('preco_base', { ascending: false });
      
      if (error) throw error;
      return data as SaasModulo[];
    }
  });

  const toggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const totalPrice = modulos
    ?.filter(m => selectedModules.includes(m.id))
    .reduce((acc, m) => acc + (m.preco_base || 0), BASE_PRICE) || BASE_PRICE;

  const scrollToForm = () => {
    document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={cn(
      "py-20 lg:py-32 bg-gradient-to-b from-gray-950 to-black relative overflow-hidden",
      isMobile && "pb-32"
    )}>
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Pricing Flexível
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Monte Seu </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Plano Ideal
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Pague apenas pelos módulos que você realmente precisa
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Base Plan - Always Included */}
          <div className="lg:col-span-2">
            {/* Base Module Card */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-primary/20 text-primary mb-2">Sempre Incluído</Badge>
                  <h3 className="text-xl font-bold text-white">Command Center (Dashboard)</h3>
                  <p className="text-gray-400 text-sm">Gestão centralizada da sua operação</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">R$ {BASE_PRICE}</p>
                  <p className="text-gray-500 text-sm">/mês</p>
                </div>
              </div>
            </div>

            {/* Módulos Adicionais */}
            <h4 className="text-lg font-semibold text-white mb-4">Módulos Adicionais</h4>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {modulos?.map(modulo => {
                  const isSelected = selectedModules.includes(modulo.id);
                  return (
                    <div 
                      key={modulo.id}
                      className={cn(
                        'rounded-xl border p-4 cursor-pointer transition-all duration-200',
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                      )}
                      onClick={() => toggleModule(modulo.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-medium truncate',
                            isSelected ? 'text-primary' : 'text-white'
                          )}>
                            {modulo.nome}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {modulo.preco_base ? `+ R$ ${modulo.preco_base}/mês` : 'Incluído'}
                          </p>
                        </div>
                        <Switch 
                          checked={isSelected}
                          onCheckedChange={() => toggleModule(modulo.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="ml-4 shrink-0 data-[state=unchecked]:bg-gray-600 data-[state=unchecked]:border data-[state=unchecked]:border-gray-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary Card - Desktop Only */}
          <div className="lg:sticky lg:top-8 h-fit hidden lg:block">
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-6 space-y-6">
              <h3 className="text-xl font-bold text-white">Seu Plano</h3>

              {/* Selected Items */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Command Center</span>
                  <span className="ml-auto text-gray-500">R$ {BASE_PRICE}</span>
                </div>
                
                {modulos?.filter(m => selectedModules.includes(m.id)).map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="truncate">{m.nome}</span>
                    <span className="ml-auto text-gray-500 flex-shrink-0">
                      {m.preco_base ? `R$ ${m.preco_base}` : 'Incluído'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-800" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total mensal</span>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">R$ {totalPrice}</p>
                  <p className="text-gray-500 text-sm">/mês</p>
                </div>
              </div>

              {/* CTA */}
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 text-lg"
                onClick={scrollToForm}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com Consultor
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Valores negociáveis. Descontos para pagamento anual.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-4 safe-area-inset-bottom">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {selectedModules.length + 1} módulo{selectedModules.length > 0 ? 's' : ''}
                </p>
                <p className="text-xl font-bold text-white">
                  R$ {totalPrice}<span className="text-sm text-gray-400 font-normal">/mês</span>
                </p>
              </div>
              
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-700">
                  Ver Plano
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            </div>
            
            <SheetContent side="bottom" className="bg-gray-900 border-gray-800 max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-white text-left">Seu Plano</SheetTitle>
              </SheetHeader>
              
              {/* Lista de módulos selecionados */}
              <div className="space-y-3 py-4">
                <div className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Command Center</span>
                  </div>
                  <span className="text-gray-500">R$ {BASE_PRICE}</span>
                </div>
                
                {modulos?.filter(m => selectedModules.includes(m.id)).map(m => (
                  <div key={m.id} className="flex items-center justify-between text-gray-300">
                    <div className="flex items-center gap-2 min-w-0">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{m.nome}</span>
                    </div>
                    <span className="text-gray-500 flex-shrink-0 ml-2">
                      {m.preco_base ? `R$ ${m.preco_base}` : 'Incluído'}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Total e CTA */}
              <div className="border-t border-gray-800 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total mensal</span>
                  <span className="text-2xl font-bold text-white">R$ {totalPrice}/mês</span>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-6 text-lg"
                  onClick={() => { setSheetOpen(false); scrollToForm(); }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar com Consultor
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Valores negociáveis. Descontos para pagamento anual.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </section>
  );
}
