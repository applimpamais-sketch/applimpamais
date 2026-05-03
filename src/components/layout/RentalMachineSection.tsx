import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import KitDetailsModal from '@/components/modals/KitDetailsModal';
import { useAlugueis } from '@/hooks/useAlugueis';
import { PERIODO_INFO } from '@/data/periodo-info';
import type { Aluguel } from '@/services/api';
import maquinaLimpezaHero from '@/assets/maquina-limpeza-hero.webp';

interface PeriodoCard {
  id: string;
  name: string;
  description: string;
  equipamento: string;
  badge?: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  preco: number;
}

interface RentalDuration {
  id: string;
  name: string;
  hours: string;
}

interface RentalPeriod {
  id: string;
  name: string;
}

interface RentalMachineSectionProps {
  activeCategory?: 'home' | 'business' | 'rental';
  onAddToCart?: (item: any) => void;
}

const RentalMachineSection = ({ activeCategory = 'home', onAddToCart }: RentalMachineSectionProps) => {
  const [selectedEquipamento, setSelectedEquipamento] = useState<string | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string | null>(null);
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const { data: alugueisData } = useAlugueis();
  const [periodoCards, setPeriodoCards] = useState<PeriodoCard[]>([]);

  // Helpers para badges e cores
  const getBadgeForPeriodo = (periodo: string): string | undefined => {
    const badges: Record<string, string> = {
      'Diária': 'Mais Popular',
      'Final de Semana': 'Melhor Custo-Benefício',
      'Econômico': 'Economia Máxima',
      'Semanal': 'Para Projetos'
    };
    return badges[periodo];
  };

  const getColorForPeriodo = (periodo: string): 'blue' | 'purple' | 'green' | 'orange' => {
    const colors: Record<string, 'blue' | 'purple' | 'green' | 'orange'> = {
      'Diária': 'blue',
      'Final de Semana': 'purple',
      'Econômico': 'green',
      'Semanal': 'orange'
    };
    return colors[periodo] || 'blue';
  };

  const getEconomiaPercentual = (periodo: string, preco: number): string | null => {
    if (!alugueisData) return null;
    
    const precoDiaria = alugueisData.find(a => a.periodo_aluguel === 'Diária')?.preco;
    
    if (!precoDiaria || periodo === 'Diária') return null;
    
    let diasPeriodo = 1;
    if (periodo === 'Final de Semana') diasPeriodo = 2;
    if (periodo === 'Semanal') diasPeriodo = 7;
    if (periodo === 'Econômico') diasPeriodo = 1;
    
    const precoPorDia = preco / diasPeriodo;
    const economia = ((precoDiaria - precoPorDia) / precoDiaria) * 100;
    
    return economia > 0 ? `Economize ${economia.toFixed(0)}% por dia` : null;
  };

  // Criar cards de período dinamicamente baseado nos dados do banco
  useEffect(() => {
    if (alugueisData && alugueisData.length > 0) {
      const cards: PeriodoCard[] = [];
      
      // Agrupar por equipamento
      const equipamentos = new Set(alugueisData.map(a => a.equipamento));
      
      equipamentos.forEach(equipamento => {
        const periodos = alugueisData.filter(a => a.equipamento === equipamento);
        
        periodos.forEach(periodo => {
          const info = PERIODO_INFO[periodo.periodo_aluguel];
          
          cards.push({
            id: `${equipamento}-${periodo.periodo_aluguel}`,
            name: periodo.periodo_aluguel,
            description: info?.subtitle || '',
            equipamento: equipamento,
            badge: getBadgeForPeriodo(periodo.periodo_aluguel),
            color: getColorForPeriodo(periodo.periodo_aluguel),
            preco: periodo.preco
          });
        });
      });
      
      setPeriodoCards(cards);
    }
  }, [alugueisData]);


  const handleKitConfirm = (items: any[]) => {
    // Adicionar cada item ao carrinho
    if (onAddToCart) {
      items.forEach(item => onAddToCart(item));
    }
    
    // Fechar o modal
    setIsKitModalOpen(false);
    setSelectedEquipamento(null);
    setSelectedPeriodo(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
            <img 
              src={maquinaLimpezaHero} 
              alt="Máquina de Limpeza de Estofados IPC EA135" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
          Aluguel de Máquina de Limpar Estofados
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Economize fazendo você mesmo com nossas máquinas profissionais
        </p>
      </div>

      {/* Escolha do Período */}
      <div className="space-y-6">
        <h3 className="text-lg sm:text-xl font-medium text-foreground flex items-center gap-3 px-2">
          <Settings className="w-5 h-5 text-primary" />
          Escolha o período de aluguel:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {periodoCards.map((card) => {
            const colorClasses = {
              blue: 'from-blue-500/15 to-blue-600/8 border-blue-500/30 hover:border-blue-500/50',
              purple: 'from-purple-500/15 to-purple-600/8 border-purple-500/30 hover:border-purple-500/50',
              green: 'from-green-500/15 to-green-600/8 border-green-500/30 hover:border-green-500/50',
              orange: 'from-orange-500/15 to-orange-600/8 border-orange-500/30 hover:border-orange-500/50'
            };
            
            const badgeColors = {
              blue: 'bg-blue-500',
              purple: 'bg-purple-500',
              green: 'bg-green-500',
              orange: 'bg-orange-500'
            };

            const textColors = {
              blue: 'text-blue-600',
              purple: 'text-purple-600',
              green: 'text-green-600',
              orange: 'text-orange-600'
            };

            const buttonColors = {
              blue: 'bg-blue-500 hover:bg-blue-600',
              purple: 'bg-purple-500 hover:bg-purple-600',
              green: 'bg-green-500 hover:bg-green-600',
              orange: 'bg-orange-500 hover:bg-orange-600'
            };
            
            const economia = getEconomiaPercentual(card.name, card.preco);
            
            return (
              <Card
                key={card.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl border-2 shadow-soft transition-all duration-300 cursor-pointer group",
                  "hover:shadow-medium hover:scale-[1.02] active:scale-[0.98]",
                  "bg-gradient-to-br",
                  colorClasses[card.color]
                )}
              >
                {/* Badge superior animado */}
                {card.badge && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={cn(
                      "text-white font-semibold px-3 py-1.5 text-xs rounded-lg shadow-md",
                      badgeColors[card.color],
                      card.badge === 'Mais Popular' && "animate-pulse"
                    )}>
                      {card.badge}
                    </Badge>
                  </div>
                )}

                {/* Conteúdo do Card */}
                <div className="p-5 space-y-4">
                  {/* Cabeçalho: Nome + Preço + Economia */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl text-foreground leading-tight pr-20">
                      {card.name}
                    </h3>
                    
                    {/* Preço destacado */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={cn("text-3xl font-bold", textColors[card.color])}>
                        R$ {card.preco}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {card.name === 'Semanal' ? '/semana' : '/período'}
                      </span>
                    </div>

                    {/* Badge de economia */}
                    {economia && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs font-medium">
                        {economia}
                      </Badge>
                    )}
                    
                    {/* Descrição compacta */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>

                  {/* Botão de ação otimizado */}
                  <Button
                    size="sm"
                    className={cn(
                      "w-full h-11 text-sm font-semibold transition-all text-white",
                      buttonColors[card.color]
                    )}
                    onClick={() => {
                      setSelectedEquipamento(card.equipamento);
                      setSelectedPeriodo(card.name);
                      setIsKitModalOpen(true);
                    }}
                  >
                    Ver itens inclusos e alugar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>


      {/* Modal de Detalhes do Kit */}
      <KitDetailsModal
        isOpen={isKitModalOpen}
        onClose={() => {
          setIsKitModalOpen(false);
          setSelectedEquipamento(null);
          setSelectedPeriodo(null);
        }}
        equipamento={selectedEquipamento}
        preSelectedPeriodo={selectedPeriodo}
        onConfirm={handleKitConfirm}
      />
    </div>
  );
};

export default RentalMachineSection;