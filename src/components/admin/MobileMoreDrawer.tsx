import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, Users, FileText, ShoppingCart, TrendingDown, TrendingUp,
  Wallet, Target, Wrench, MapPinned, Download, Settings, HelpCircle, Lock
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantModules } from '@/hooks/useTenantModules';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface DrawerItem {
  label: string;
  url: string;
  icon: LucideIcon;
  requiredModule?: string;
  category: 'gestao' | 'vendas' | 'financas' | 'operacao' | 'sistema';
}

const drawerItems: DrawerItem[] = [
  // Gestão
  { label: 'Relatórios', url: '/admin/relatorios', icon: BarChart3, category: 'gestao' },
  { label: 'Equipe', url: '/admin/equipe', icon: Users, category: 'gestao' },
  { label: 'Orçamentos', url: '/admin/orcamentos', icon: FileText, requiredModule: 'loja_online', category: 'gestao' },
  
  // Vendas
  { label: 'Carrinhos Abandonados', url: '/admin/carrinhos-abandonados', icon: ShoppingCart, requiredModule: 'marketing_tools', category: 'vendas' },
  
  // Finanças
  { label: 'Despesas', url: '/admin/financeiro/despesas', icon: TrendingDown, requiredModule: 'financeiro', category: 'financas' },
  { label: 'Receitas', url: '/admin/financeiro/receitas', icon: TrendingUp, requiredModule: 'financeiro', category: 'financas' },
  { label: 'Fluxo de Caixa', url: '/admin/financeiro/fluxo-caixa', icon: Wallet, requiredModule: 'financeiro', category: 'financas' },
  { label: 'Metas', url: '/admin/financeiro/metas', icon: Target, requiredModule: 'financeiro', category: 'financas' },
  
  // Operação
  { label: 'Técnicos', url: '/admin/tecnicos', icon: Wrench, requiredModule: 'rastreamento_rota', category: 'operacao' },
  { label: 'Histórico Tracking', url: '/admin/tracking', icon: MapPinned, requiredModule: 'rastreamento_rota', category: 'operacao' },
  
  // Sistema
  { label: 'Instalar App', url: '/admin/instalar-app', icon: Download, category: 'sistema' },
  { label: 'Configurações', url: '/admin/perfil', icon: Settings, category: 'sistema' },
  { label: 'Ajuda', url: '/admin/ajuda', icon: HelpCircle, category: 'sistema' },
];

const categoryLabels: Record<string, string> = {
  gestao: 'Gestão',
  vendas: 'Vendas',
  financas: 'Finanças',
  operacao: 'Operação',
  sistema: 'Sistema',
};

const categoryOrder = ['gestao', 'vendas', 'financas', 'operacao', 'sistema'];

interface MobileMoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileMoreDrawer({ open, onOpenChange }: MobileMoreDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasModule } = useTenantModules();

  const handleItemClick = (item: DrawerItem) => {
    if (item.requiredModule && !hasModule(item.requiredModule)) {
      toast.error('Módulo não disponível', {
        description: 'Fale com o suporte para ativar este recurso.',
      });
      return;
    }
    
    onOpenChange(false);
    navigate(item.url);
  };

  // Group items by category
  const groupedItems = categoryOrder.reduce((acc, category) => {
    const items = drawerItems.filter(item => item.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<string, DrawerItem[]>);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-background/95 backdrop-blur-xl border-t border-border/50">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg font-semibold text-foreground">
            Menu
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="overflow-y-auto px-4 pb-8 space-y-6">
          {categoryOrder.map(category => {
            const items = groupedItems[category];
            if (!items) return null;
            
            return (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {categoryLabels[category]}
                </h3>
                <div className="space-y-1">
                  {items.map(item => {
                    const isActive = location.pathname === item.url || 
                      (item.url !== '/admin' && location.pathname.startsWith(item.url));
                    const isLocked = item.requiredModule && !hasModule(item.requiredModule);
                    
                    return (
                      <button
                        key={item.url}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                          "hover:bg-accent/50 active:scale-[0.98]",
                          isActive && "bg-primary/10 text-primary",
                          isLocked && "opacity-60"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-xl",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted/50 text-muted-foreground"
                        )}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <span className={cn(
                          "flex-1 text-left font-medium",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {item.label}
                        </span>
                        {isLocked && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
