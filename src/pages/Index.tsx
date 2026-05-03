import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import CategoryToggle from '@/components/layout/CategoryToggle';
import ServiceGrid from '@/components/layout/ServiceGrid';
import RentalMachineSection from '@/components/layout/RentalMachineSection';
import Cart from '@/components/layout/Cart';
import ItemConfigModal from '@/components/modals/ItemConfigModal';
import KitDetailsModal from '@/components/modals/KitDetailsModal';
import ComboCustomizationModal from '@/components/modals/ComboCustomizationModal';
import { BookingModal } from '@/components/booking/BookingModal';
import { WelcomeCupomModal } from '@/components/modals/WelcomeCupomModal';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useCartSound } from '@/hooks/useCartSound';
import { trackAddToCart, trackViewContent, persistUtmParams } from '@/utils/facebookPixel';
import { getValidParceiroCupom, clearParceiroRef } from '@/utils/parceiroRef';
import { saveCanalRef, getValidCanalRef } from '@/utils/canalRef';
import { supabase } from '@/integrations/supabase/client';
import { useSessionTracking } from '@/hooks/useSessionTracking';

import { ComboItem, RentalKit, RentalDuration, RentalPeriod, getKitPrice, homeCombos, businessCombos } from '@/data/services';
import { BookingData } from '@/types/booking';
import Footer from '@/components/layout/Footer';
import { useServicos } from '@/hooks/useServicos';
import { useAlugueis } from '@/hooks/useAlugueis';
import type { Servico } from '@/services/api';
import { useCarrinhoAbandonado } from '@/hooks/useCarrinhoAbandonado';

interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: number;
}

// Tipo para itens de serviço compatível com ServiceGrid
interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  dbData?: Servico;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playAddToCartSound } = useCartSound();
  const { updateSession } = useSessionTracking();
  const { data: servicosData, isLoading: isLoadingServicos } = useServicos();
  const { data: alugueisData, isLoading: isLoadingAlugueis } = useAlugueis();
  const [searchParams, setSearchParams] = useSearchParams();
  const lastCanalRefTracked = useRef<string | null>(null);
  // Ler categoria da URL na inicialização
  const getCategoryFromUrl = (): 'home' | 'rental' => {
    const tab = searchParams.get('tab');
    if (tab === 'economizar' || tab === 'rental') return 'rental';
    return 'home';
  };
  
  const [activeCategory, setActiveCategory] = useState<'home' | 'rental'>(getCategoryFromUrl);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<string | null>(null);
  const [selectedEquipamento, setSelectedEquipamento] = useState<string | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servicos, setServicos] = useState<ServiceItem[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [cupomCodigoPopup, setCupomCodigoPopup] = useState('LIMPA10');

   // Capturar ?ref= para canais internos (sem limpar a URL)
   useEffect(() => {
     const ref = searchParams.get('ref');
     if (!ref) return;

     // Se tem ref e NÃO é código de parceiro (parceiros usam maiúsculas como MARIA10)
     if (/^[A-Z0-9]+(-[A-Z]+)?$/.test(ref)) return;

     const refNormalized = ref.toLowerCase().trim();
     if (!refNormalized) return;

     // Evitar duplicar tracking quando outros query params mudarem (ex: tab)
     if (lastCanalRefTracked.current === refNormalized) return;
     lastCanalRefTracked.current = refNormalized;

     // É canal interno (bio, google-organico, etc)
     saveCanalRef(refNormalized);

     // Rastrear clique via backend function (fire and forget)
     supabase.functions
       .invoke('track-canal-click', { body: { codigo: refNormalized } })
       .catch((err) => console.error('[Index] Erro ao rastrear canal:', err));

     console.log(`[Index] Canal interno detectado na URL: ${refNormalized}`);
   }, [searchParams]);
 
  // Verificar se deve mostrar popup de cupom (incluindo cupom de parceiro)
  useEffect(() => {
    // Primeiro verificar cupom de parceiro
    const parceiroCupom = getValidParceiroCupom();
    if (parceiroCupom) {
      setCupomCodigoPopup(parceiroCupom);
      setShowWelcomeModal(true);
      return;
    }
    
    // Depois verificar popup normal
    const shouldShow = localStorage.getItem('showCupomPopup');
    const cupomCodigo = localStorage.getItem('cupomPopupCodigo') || 'LIMPA10';
    
    if (shouldShow === 'true') {
      setCupomCodigoPopup(cupomCodigo);
      setShowWelcomeModal(true);
      // Remover flag para não mostrar novamente
      localStorage.removeItem('showCupomPopup');
      localStorage.removeItem('cupomPopupCodigo');
    }
  }, []);

  // Persistir UTMs na primeira visita
  useEffect(() => {
    persistUtmParams();
  }, []);

  // Track ViewContent específico por categoria (com guard para evitar duplicação)
  const lastTrackedCategory = useRef<string | null>(null);
  useEffect(() => {
    const cat = activeCategory === 'rental' ? 'rental' : 'services';
    if (lastTrackedCategory.current === cat) return;
    lastTrackedCategory.current = cat;
    
    trackViewContent(
      cat,
      cat === 'rental' 
        ? 'Aluguel de Máquinas - Para Economizar' 
        : 'Serviços de Limpeza - Para Casa'
    );
  }, [activeCategory]);

  // Tracking de carrinho abandonado
  useCarrinhoAbandonado({
    cartItems,
    etapa: 'carrinho',
  });

  // Sincronizar carrinho com live_sessions para tracking em tempo real
  useEffect(() => {
    const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartItems.length > 0) {
      updateSession({
        etapa: 'carrinho',
        carrinhoItems: cartItems.length,
        carrinhoValor: totalValue,
      });
    } else {
      updateSession({ 
        etapa: 'navegando',
        carrinhoItems: 0,
        carrinhoValor: 0,
      });
    }
  }, [cartItems, updateSession]);

  // Formata nome da subcategoria para exibição (Title Case)
  const formatSubcategoriaName = (subcategoria: string): string => {
    const preposicoes = ['de', 'do', 'da', 'dos', 'das', 'e'];
    
    return subcategoria
      .toLowerCase()
      .split(' ')
      .map((palavra, index) => {
        // Primeira palavra sempre maiúscula
        if (index === 0) {
          return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        }
        // Preposições em minúscula
        if (preposicoes.includes(palavra)) {
          return palavra;
        }
        // Demais palavras com primeira letra maiúscula
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      })
      .join(' ')
      // Correções específicas de acentuação
      .replace(/Bebe/g, 'Bebê')
      .replace(/Onibus/g, 'Ônibus')
      .replace(/Moises/g, 'Moisés')
      .replace(/Auditorio/g, 'Auditório')
      .replace(/Caminhao/g, 'Caminhão')
      .replace(/Embarcacao/g, 'Embarcação')
      .replace(/Acustica/g, 'Acústica')
      .replace(/Pedras/g, 'Pedras');
  };

  // Mapeia ícones baseado no item/subcategoria
  const getIconForService = (item: string, subcategoria: string): string => {
    const normalized = subcategoria.toUpperCase();
    
    const iconMap: Record<string, string> = {
      // Mais Agendados
      'SOFÁ': 'Sofa',
      'TAPETE': 'Grid3x3',
      'POLTRONA': 'Armchair',
      'CADEIRA': 'Armchair',
      'BANQUETA': 'Box',
      'COLCHÃO': 'BedDouble',
      'CARRO': 'Car',
      
      // Outros Serviços
      'CHAISE': 'Sofa',
      'CARRINHO DE BEBE': 'Baby',
      'BEBE CONFORTO': 'Baby',
      'CADEIRINHA': 'Baby',
      'PUFF': 'Box',
      'ESPUMA ACUSTICA': 'AudioWaveform',
      'CARPETE': 'Grid3x3',
      'AR CONDICIONADO': 'Wind',
      'NAMORADEIRA': 'Sofa',
      'LONGARINA': 'Armchair',
      'ONIBUS': 'Bus',
      'AERONAVE': 'Plane',
      'CAMINHAO': 'Truck',
      'EMBARCACAO': 'Ship',
      'DIVÃ': 'Sofa',
      'RECAMIER': 'Sofa',
      'TRAVESSEIRO': 'Package',
      'FANTASIA ESTOFADA': 'Sparkles',
      'MOISES': 'Baby',
      'BANCO DE IGREJA': 'Building2',
      'AUDITORIO': 'Building2',
      'CINEMA': 'Clapperboard',
      'LIMPEZA DE PISO': 'Droplets',
      'IMPERMEABILIZAÇÃO DE PISO': 'Shield',
      'IMPERMEABILIZAÇÃO DE PEDRAS': 'Shield'
    };
    
    return iconMap[normalized] || 'Package';
  };

  // Ordena itens conforme ordem personalizada
  const sortByCustomOrder = (items: ServiceItem[], orderMap: Record<string, number>): ServiceItem[] => {
    return [...items].sort((a, b) => {
      const orderA = orderMap[a.dbData?.subcategoria?.toUpperCase() || ''] ?? 999;
      const orderB = orderMap[b.dbData?.subcategoria?.toUpperCase() || ''] ?? 999;
      return orderA - orderB;
    });
  };

  // Converte dados do Supabase para formato do ServiceItem
  useEffect(() => {
    if (servicosData) {
      const servicosFormatados: ServiceItem[] = servicosData.map((s) => ({
        id: s.id,
        name: s.item + (s.tamanho ? ` (${s.tamanho})` : ''),
        icon: getIconForService(s.item, s.subcategoria),
        dbData: s
      }));
      setServicos(servicosFormatados);
    }
  }, [servicosData]);

  // Index loaded

  const handleItemClick = (item: ServiceItem) => {
    setSelectedSubcategoria(item.dbData?.subcategoria || item.name);
    setIsModalOpen(true);
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
    
    // Tocar som de confirmação
    playAddToCartSound();
    
    // Track Facebook Pixel - AddToCart
    trackAddToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    });
    
    // Abrir carrinho automaticamente
    setIsCartDrawerOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddUpsell = (upsell: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === upsell.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === upsell.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, upsell];
    });
    
    // Tocar som de confirmação
    playAddToCartSound();
    
    // Abrir carrinho automaticamente
    setIsCartDrawerOpen(true);
  };


  const handleBookingComplete = (bookingData: BookingData) => {
    navigate('/checkout', { state: { bookingData } });
  };

  const handleScheduleClick = () => {
    if (cartItems.length === 0) {
      // toast or alert about empty cart
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleComboClick = (combo: ComboItem) => {
    setSelectedCombo(combo);
    setIsComboModalOpen(true);
  };

  const handleComboConfirm = (comboDetails: {
    originalCombo: ComboItem;
    extraServices: string[];
  }) => {
    const extrasText = comboDetails.extraServices.length > 0 
      ? ` + ${comboDetails.extraServices.length} serviços extras`
      : '';
    
    const comboCartItem: CartItem = {
      id: `combo-${comboDetails.originalCombo.id}-${Date.now()}`,
      name: comboDetails.originalCombo.name,
      details: `Combo completo${extrasText}`,
      quantity: 1,
      price: 0 // Você pode definir preços específicos aqui
    };
    handleAddToCart(comboCartItem);
  };

  const handleRentalKitClick = (equipamento: string) => {
    setSelectedEquipamento(equipamento);
    setIsRentalModalOpen(true);
  };

  // Atualizar URL quando categoria mudar (preservando ?ref= quando existir)
  const handleCategoryChange = (category: 'home' | 'rental') => {
    setActiveCategory(category);

    const next = new URLSearchParams(searchParams);

    if (category === 'rental') {
      next.set('tab', 'economizar');
    } else {
      // Remover apenas o tab para manter a URL limpa sem perder tracking
      next.delete('tab');
    }

    setSearchParams(next, { replace: true });
  };

  // Ordem personalizada para Mais Agendados
  const maisAgendadosOrder: Record<string, number> = {
    'SOFÁ': 1,
    'TAPETE': 2,
    'POLTRONA': 3,
    'CADEIRA': 4,
    'BANQUETA': 5,
    'COLCHÃO': 6,
    'CARRO': 7
  };

  // Ordem personalizada para Outros Serviços
  const outrosServicosOrder: Record<string, number> = {
    'CHAISE': 1,
    'CARRINHO DE BEBE': 2,
    'BEBE CONFORTO': 3,
    'CADEIRINHA': 4,
    'PUFF': 5,
    'ESPUMA ACUSTICA': 6,
    'CARPETE': 7,
    'AR CONDICIONADO': 8,
    'NAMORADEIRA': 9,
    'LONGARINA': 10,
    'ONIBUS': 11,
    'AERONAVE': 12,
    'CAMINHAO': 13,
    'EMBARCACAO': 14,
    'DIVÃ': 15,
    'RECAMIER': 16,
    'TRAVESSEIRO': 17,
    'FANTASIA ESTOFADA': 18,
    'MOISES': 19,
    'BANCO DE IGREJA': 20,
    'AUDITORIO': 21,
    'CINEMA': 22,
    'LIMPEZA DE PISO': 23,
    'IMPERMEABILIZAÇÃO DE PISO': 24,
    'IMPERMEABILIZAÇÃO DE PEDRAS': 25
  };

  // Agrupa serviços por subcategoria
  const maisAgendados = servicos.filter(s => s.dbData?.categoria === 'MAIS AGENDADOS');
  const outrosServicos = servicos.filter(s => s.dbData?.categoria?.startsWith('OUTROS'));
  
  const maisAgendadosAgrupados = sortByCustomOrder(
    Array.from(
      new Map(
        maisAgendados.map(s => [
          s.dbData?.subcategoria,
          {
            id: s.dbData?.subcategoria || s.id,
            name: formatSubcategoriaName(s.dbData?.subcategoria || s.name),
            icon: getIconForService(s.dbData?.item || '', s.dbData?.subcategoria || ''),
            dbData: s.dbData
          }
        ])
      ).values()
    ),
    maisAgendadosOrder
  );

  const outrosServicosAgrupados = sortByCustomOrder(
    Array.from(
      new Map(
        outrosServicos.map(s => [
          s.dbData?.subcategoria,
          {
            id: s.dbData?.subcategoria || s.id,
            name: formatSubcategoriaName(s.dbData?.subcategoria || s.name),
            icon: getIconForService(s.dbData?.item || '', s.dbData?.subcategoria || ''),
            dbData: s.dbData
          }
        ])
      ).values()
    ),
    outrosServicosOrder
  );

  // Agrupa aluguéis por equipamento
  const alugueisAgrupados = Array.from(
    new Map(
      (alugueisData || []).map(a => [
        a.equipamento,
        {
          id: a.equipamento,
          name: a.equipamento,
          icon: 'Wrench'
        }
      ])
    ).values()
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        cartItemsCount={cartItems.length}
        cartItems={cartItems}
        onScheduleClick={handleScheduleClick}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddUpsell={handleAddUpsell}
        isCartDrawerOpen={isCartDrawerOpen}
        onCartDrawerChange={setIsCartDrawerOpen}
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      />
      
      <div className="flex flex-1">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-8 lg:py-12">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-4 sm:px-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight animate-fade-in">
                {activeCategory === 'rental' 
                  ? 'Alugue nossa máquina e economize'
                  : 'Selecione os itens que deseja limpar ou impermeabilizar'
                }
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {activeCategory === 'rental'
                  ? 'Máquinas profissionais para uso próprio • Economia garantida • Suporte completo'
                  : 'Profissionais especializados • Produtos premium • Garantia total'
                }
              </p>
              <div className="mt-6 lg:mt-8">
                <CategoryToggle
                  activeCategory={activeCategory}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            </div>

            {activeCategory === 'rental' ? (
              <RentalMachineSection 
                activeCategory={activeCategory}
                onAddToCart={handleAddToCart}
              />
            ) : (
              <>
                <ServiceGrid
                  title="Mais agendados"
                  items={maisAgendadosAgrupados}
                  onItemClick={handleItemClick}
                />

                <ServiceGrid
                  title="Outros serviços"
                  items={outrosServicosAgrupados}
                  onItemClick={handleItemClick}
                />
              </>
            )}
          </div>
        </main>

        {/* Desktop Cart - Only visible when there are items */}
        {cartItems.length > 0 && (
          <div className="hidden lg:block">
            <Cart 
              items={cartItems} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onAddUpsell={handleAddUpsell}
            />
          </div>
        )}
      </div>

      <ItemConfigModal
        subcategoria={selectedSubcategoria}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubcategoria(null);
        }}
        onAddToCart={handleAddToCart}
      />

      <KitDetailsModal
        isOpen={isRentalModalOpen}
        onClose={() => {
          setIsRentalModalOpen(false);
          setSelectedEquipamento(null);
        }}
        equipamento={selectedEquipamento}
        onConfirm={(items) => {
          items.forEach(item => handleAddToCart(item));
        }}
      />

      <ComboCustomizationModal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        combo={selectedCombo}
        onConfirm={handleComboConfirm}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        cartItems={cartItems}
        onBookingComplete={handleBookingComplete}
      />

      <WelcomeCupomModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        cupomCodigo={cupomCodigoPopup}
      />
      
      <Toaster />
      <Footer />
    </div>
  );
};

export default Index;
