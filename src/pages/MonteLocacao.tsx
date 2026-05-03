import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlugueis } from '@/hooks/useAlugueis';
import { useUpsellsPublic } from '@/hooks/useUpsellsPublic';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Check, ChevronRight, ChevronDown, Package, Sparkles, ShoppingCart, Truck, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VideoCarousel from '@/components/monte-locacao/VideoCarousel';
import SocialProof from '@/components/monte-locacao/SocialProof';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { PERIODO_INFO } from '@/data/periodo-info';

const PERIOD_COLORS = [
  { border: 'border-blue-500', bg: 'bg-blue-500/10', ring: 'ring-blue-500/50', text: 'text-blue-400' },
  { border: 'border-purple-500', bg: 'bg-purple-500/10', ring: 'ring-purple-500/50', text: 'text-purple-400' },
  { border: 'border-emerald-500', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/50', text: 'text-emerald-400' },
  { border: 'border-orange-500', bg: 'bg-orange-500/10', ring: 'ring-orange-500/50', text: 'text-orange-400' },
];

const MonteLocacao = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: alugueis, isLoading: loadingAlugueis } = useAlugueis();
  const { data: upsells, isLoading: loadingUpsells } = useUpsellsPublic('locacoes');

  const [selectedPeriodoId, setSelectedPeriodoId] = useState<string | null>(null);
  const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set());
  const [cidadeFrete, setCidadeFrete] = useState<string>('');

  const valorFrete = useMemo(() => {
    if (!cidadeFrete) return 0;
    const c = cidadeFrete.toLowerCase().trim();
    if (c === 'belo horizonte' || c === 'contagem') return 30;
    return 40;
  }, [cidadeFrete]);

  const periodos = (alugueis ?? []).filter(p => p.periodo_aluguel !== 'Econômico');
  const selectedPeriodo = periodos.find(p => p.id === selectedPeriodoId) ?? periodos[0];

  const toggleUpsell = (id: string) => {
    setSelectedUpsells(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const extrasTotal = useMemo(() => {
    if (!upsells) return 0;
    return upsells
      .filter(u => selectedUpsells.has(u.id))
      .reduce((sum, u) => sum + u.preco, 0);
  }, [upsells, selectedUpsells]);

  const machinePrice = selectedPeriodo?.preco ?? 0;
  const total = machinePrice + extrasTotal + valorFrete;
  const selectedCount = selectedUpsells.size + 1;

  const handleCTA = () => {
    const itens: Array<{ nome: string; preco: number }> = [];
    if (selectedPeriodo) {
      itens.push({
        nome: `Extratora IPC A135 - ${selectedPeriodo.periodo_aluguel}`,
        preco: selectedPeriodo.preco,
      });
    }
    upsells?.filter(u => selectedUpsells.has(u.id)).forEach(u => {
      itens.push({ nome: u.nome, preco: u.preco });
    });

    navigate('/agendamento', {
      state: {
        locacaoConfigurada: true,
        itens,
        total,
        periodoId: selectedPeriodo?.id,
      },
    });
  };

  const isLoading = loadingAlugueis || loadingUpsells;

  const PlanSummary = ({ className }: { className?: string }) => (
    <Card className={cn("p-6", className)}>
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-foreground" />
        Seu Plano
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            Extratora IPC A135
          </span>
          <span className="text-foreground font-medium">
            R$ {machinePrice.toFixed(2).replace('.', ',')}
          </span>
        </div>
        {selectedPeriodo && (
          <p className="text-xs text-muted-foreground ml-6">
            {selectedPeriodo.periodo_aluguel}
          </p>
        )}

        {upsells?.filter(u => selectedUpsells.has(u.id)).map(u => (
          <div key={u.id} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              {u.nome}
            </span>
            <span className="text-foreground font-medium">
              R$ {u.preco.toFixed(2).replace('.', ',')}
            </span>
          </div>
        ))}

        {valorFrete > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Frete ({cidadeFrete})
            </span>
            <span className="text-foreground font-medium">
              R$ {valorFrete.toFixed(2).replace('.', ',')}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
        <span className="text-muted-foreground font-medium">Total</span>
        <span className="text-2xl font-bold text-foreground">
          R$ {total.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <Button
        onClick={handleCTA}
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl text-base"
        disabled={!selectedPeriodo}
      >
        Ir para Agendamento
        <ChevronRight className="h-5 w-5 ml-1" />
      </Button>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Monte Sua Locação | RC Limpa+</title>
        <meta name="description" content="Personalize sua locação de extratora. Escolha o período e adicione extras como shampoo, neutralizador e perfume." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="text-center pt-12 pb-8 px-4">
          <Badge className="bg-primary/10 text-primary border-primary/30 mb-4 text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Monte Sua Locação
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Personalize Sua Locação
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Escolha o período e adicione o que precisar
          </p>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 pb-32 md:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Configuration */}
            <div className="lg:col-span-2 space-y-8">
              {/* Machine - Always Included */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-foreground" />
                  <h2 className="text-xl font-bold">Sempre Incluído</h2>
                </div>

                <Card className="p-6 border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Extratora IPC A135</h3>
                      <p className="text-sm text-muted-foreground">Máquina profissional de limpeza</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/30">
                      Incluído
                    </Badge>
                  </div>

                  {/* Period selector */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {periodos.map((p, idx) => {
                      const isSelected = (selectedPeriodoId ?? periodos[0]?.id) === p.id;
                      const colors = PERIOD_COLORS[idx % PERIOD_COLORS.length];
                      return (
                        <div
                          key={p.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPeriodoId(p.id)}
                          onKeyDown={(e) => e.key === 'Enter' && setSelectedPeriodoId(p.id)}
                          className={cn(
                            "rounded-xl border p-3 text-center transition-all cursor-pointer",
                            isSelected
                              ? `${colors.border} ${colors.bg} ring-1 ${colors.ring}`
                              : "border-border bg-card hover:border-muted-foreground/30"
                          )}
                        >
                          <div className={cn("text-xs mb-1", isSelected ? colors.text : "text-foreground/80")}>{p.periodo_aluguel}</div>
                          <div className="text-lg font-bold">
                            R$ {p.preco.toFixed(0)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery info & included items */}
                  {selectedPeriodo && PERIODO_INFO[selectedPeriodo.periodo_aluguel] && (() => {
                    const info = PERIODO_INFO[selectedPeriodo.periodo_aluguel];
                    return (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <Truck className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{selectedPeriodo.periodo_aluguel}</p>
                            <p className="text-sm text-foreground/80">{info.subtitle}</p>
                            {info.subprice && (
                              <p className="text-xs text-primary font-semibold mt-1">{info.subprice}</p>
                            )}
                          </div>
                        </div>



                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-1">
                            <span className="flex items-center gap-1.5">
                              <Package className="h-4 w-4 text-foreground" />
                              Incluso no aluguel ({info.included.length} itens)
                            </span>
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <ul className="mt-2 space-y-1.5">
                              {info.included.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                  <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })()}
                </Card>
              </div>

              {/* Extras */}
              {upsells && upsells.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-foreground" />
                    <h2 className="text-xl font-bold">Adicione Extras</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {upsells.map(u => {
                      const isActive = selectedUpsells.has(u.id);
                      return (
                        <div
                          key={u.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleUpsell(u.id)}
                          onKeyDown={(e) => e.key === 'Enter' && toggleUpsell(u.id)}
                          className={cn(
                            "rounded-xl border p-4 text-left transition-all flex items-center justify-between cursor-pointer",
                            isActive
                              ? "border-primary bg-primary/10 ring-1 ring-primary/50"
                              : "border-border bg-card hover:border-muted-foreground/30"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-foreground">{u.nome}</div>
                            {u.descricao && (
                              <div className="text-xs text-foreground/80 mt-0.5 truncate">{u.descricao}</div>
                            )}
                            <div className="text-primary font-bold mt-1">
                              R$ {u.preco.toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => toggleUpsell(u.id)}
                            className="ml-3 shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
               )}

              {/* Calcular Frete */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-foreground" />
                  <h2 className="text-xl font-bold">Calcular Frete</h2>
                </div>

                <Card className="p-5">
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione sua cidade para calcular o frete de entrega e retirada do equipamento.
                  </p>
                  <Select value={cidadeFrete} onValueChange={setCidadeFrete}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione sua cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
                      <SelectItem value="Contagem">Contagem</SelectItem>
                      <SelectItem value="Betim">Betim</SelectItem>
                      <SelectItem value="Nova Lima">Nova Lima</SelectItem>
                      <SelectItem value="Ribeirão das Neves">Ribeirão das Neves</SelectItem>
                      <SelectItem value="Santa Luzia">Santa Luzia</SelectItem>
                      <SelectItem value="Sabará">Sabará</SelectItem>
                      <SelectItem value="Ibirité">Ibirité</SelectItem>
                      <SelectItem value="Outra">Outra cidade da região</SelectItem>
                    </SelectContent>
                  </Select>

                  {cidadeFrete && (
                    <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Entrega + Retirada
                        </span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        R$ {valorFrete.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                </Card>
              </div>

              {/* Video Carousel */}
              <VideoCarousel />

              {/* Social Proof */}
              <SocialProof />
            </div>

            {/* Right: Summary (desktop only) */}
            <div className="hidden lg:block">
              <div className="sticky top-8">
                <PlanSummary />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Fixed bottom bar */}
        {isMobile && (
          <div className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3">
            <Drawer>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{selectedCount} {selectedCount === 1 ? 'item' : 'itens'}</p>
                  <p className="text-xl font-bold">R$ {total.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="flex gap-2">
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ver Plano
                    </Button>
                  </DrawerTrigger>
                  <Button
                    onClick={handleCTA}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                    disabled={!selectedPeriodo}
                  >
                    Agendar
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
              <DrawerContent className="bg-background border-border">
                <div className="p-4">
                  <PlanSummary className="border-0 shadow-none p-0" />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        )}
      </div>
    </>
  );
};

export default MonteLocacao;
