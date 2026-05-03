import { Menu, User, MapPin, RefreshCw, Ticket, RotateCcw, Gift, Home, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import MobileCartDrawer from './MobileCartDrawer';

interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: number;
}

interface HeaderProps {
  onMenuClick?: () => void;
  cartItemsCount: number;
  cartItems?: CartItem[];
  onScheduleClick?: () => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onAddUpsell?: (upsell: any) => void;
  isCartDrawerOpen?: boolean;
  onCartDrawerChange?: (open: boolean) => void;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}

const Header = ({ 
  onMenuClick, 
  cartItemsCount, 
  cartItems = [], 
  onScheduleClick, 
  onUpdateQuantity, 
  onRemoveItem, 
  onAddUpsell, 
  isCartDrawerOpen, 
  onCartDrawerChange,
  isMenuOpen = false,
  onMenuOpenChange 
}: HeaderProps) => {
  
  const menuItems = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Gift, label: 'Cupons de Desconto', href: '/cupons' },
    { icon: Star, label: 'Avaliações', href: '/avaliacoes' },
  ];

  return (
    <>
      <Sheet open={isMenuOpen} onOpenChange={onMenuOpenChange}>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>
              <img 
                src="/logo-rc-limpa-mais.png" 
                alt="RC Limpa+" 
                className="h-8 w-auto object-contain"
              />
            </SheetTitle>
          </SheetHeader>
          
          <nav className="mt-8 flex flex-col gap-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                onClick={() => onMenuOpenChange?.(false)}
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-base font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <header className="h-16 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-center lg:justify-between px-4 sm:px-6 sticky top-0 z-50 shadow-soft relative">
      <div className="flex items-center gap-3 sm:gap-6 absolute left-4 sm:left-6 lg:relative lg:left-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMenuOpenChange?.(true)}
          className="text-primary hover:text-primary-hover hover:bg-primary-light transition-colors duration-fast lg:block"
        >
          <Menu size={20} className="sm:w-5 sm:h-5" />
        </Button>
        
        <div className="hidden lg:flex items-center">
          <img 
            src="/logo-rc-limpa-mais.png" 
            alt="RC Limpa+ - Soluções para Estofados" 
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </div>
      </div>

      {/* Mobile centered logo */}
      <div className="flex items-center lg:hidden">
        <img 
          src="/logo-rc-limpa-mais.png" 
          alt="RC Limpa+ - Soluções para Estofados" 
          className="h-8 sm:h-10 w-auto object-contain"
        />
      </div>

      <div className="flex items-center gap-1 sm:gap-2 absolute right-4 sm:right-6 lg:relative lg:right-auto">
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:text-primary-hover hover:bg-primary-light transition-colors duration-fast hidden lg:flex"
          title="Recorrência"
        >
          <RotateCcw size={18} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:text-primary-hover hover:bg-primary-light transition-colors duration-fast hidden lg:flex"
          title="Cupom de desconto"
        >
          <Gift size={18} />
        </Button>

        <div className="relative hidden lg:block">
          <Input
            placeholder="Digite seu CEP"
            className="w-36 h-9 text-sm border-border focus:border-primary focus:ring-primary/20 bg-background"
          />
          <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:text-primary-hover hover:bg-primary-light transition-colors duration-fast hidden sm:flex"
        >
          <User size={18} />
        </Button>

        {/* Mobile Cart Drawer */}
        <div className="lg:hidden">
          <MobileCartDrawer 
            items={cartItems}
            cartItemsCount={cartItemsCount}
            onScheduleClick={onScheduleClick}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onAddUpsell={onAddUpsell}
            isOpen={isCartDrawerOpen}
            onOpenChange={onCartDrawerChange}
          />
        </div>
      </div>
      </header>
    </>
  );
};

export default Header;