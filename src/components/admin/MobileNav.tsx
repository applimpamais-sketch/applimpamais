import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Wallet, Eye, Menu, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantModules } from '@/hooks/useTenantModules';
import MobileMoreDrawer from './MobileMoreDrawer';

interface MobileNavProps {
  className?: string;
}

interface NavItem {
  label: string;
  url: string;
  icon: LucideIcon;
  end?: boolean;
  requiredModule?: string;
  isDrawer?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', url: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Agenda', url: '/admin/agendamentos', icon: Calendar },
  { label: 'Finanças', url: '/admin/financeiro', icon: Wallet, requiredModule: 'financeiro' },
  { label: 'Live', url: '/admin/live-view', icon: Eye, requiredModule: 'loja_online' },
  { label: 'Mais', url: '#more', icon: Menu, isDrawer: true },
];

const WaveShape = ({ activeIndex }: { activeIndex: number }) => {
  const centerX = (activeIndex * 20) + 10;
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      <defs>
        <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <path
        d={`
          M 0,25
          L ${Math.max(0, centerX - 12)}%,25
          Q ${centerX - 8}%,25 ${centerX - 6}%,15
          Q ${centerX}%,0 ${centerX + 6}%,15
          Q ${centerX + 8}%,25 ${Math.min(100, centerX + 12)}%,25
          L 100,25
          L 100,100
          L 0,100
          Z
        `}
        fill="url(#navGradient)"
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
};

export default function MobileNav({ className }: MobileNavProps) {
  const location = useLocation();
  const { hasModule } = useTenantModules();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Filter nav items based on modules (keep items without requiredModule or with active module)
  const visibleItems = navItems.filter(item => 
    !item.requiredModule || hasModule(item.requiredModule) || item.isDrawer
  );
  
  // Ensure we always have 5 items by filling with placeholders if needed
  const displayItems = visibleItems.length >= 5 ? visibleItems.slice(0, 5) : visibleItems;
  
  const activeIndex = displayItems.findIndex(item => 
    !item.isDrawer && (item.end ? location.pathname === item.url : location.pathname.startsWith(item.url))
  );

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.isDrawer) {
      e.preventDefault();
      setDrawerOpen(true);
    }
  };

  return (
    <>
      <nav className={cn(
        "fixed bottom-0 inset-x-0 h-20 z-50 pb-safe",
        "bg-gradient-to-t from-blue-900 to-blue-700",
        className
      )}>
        <div className="relative h-full">
          <WaveShape activeIndex={activeIndex >= 0 ? activeIndex : displayItems.length - 1} />
          
          <div className="relative h-full flex items-end justify-around pb-2">
            {displayItems.map((item, index) => {
              const isActive = !item.isDrawer && index === activeIndex;
              
              if (item.isDrawer) {
                return (
                  <button
                    key={item.url}
                    onClick={(e) => handleNavClick(item, e)}
                    className="relative flex flex-col items-center justify-center w-16 h-16 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-1 transition-all duration-300">
                      <item.icon className="h-5 w-5 text-blue-200" strokeWidth={2} />
                      <span className="text-[10px] font-medium text-blue-200">
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              }
              
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  end={item.end}
                  className="relative flex flex-col items-center justify-center w-16 h-16 transition-all duration-300"
                >
                  {isActive && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 
                                    w-14 h-14 rounded-full bg-success 
                                    shadow-xl shadow-success/50
                                    flex items-center justify-center
                                    transition-all duration-500 ease-out
                                    ring-4 ring-background
                                    animate-in zoom-in-95 duration-300
                                    before:absolute before:inset-0 before:rounded-full 
                                    before:bg-success/20 before:blur-lg before:-z-10">
                      <item.icon className="h-6 w-6 text-white drop-shadow-lg" 
                                 strokeWidth={2.5} />
                    </div>
                  )}
                  
                  {!isActive && (
                    <div className="flex flex-col items-center gap-1 transition-all duration-300">
                      <item.icon className="h-5 w-5 text-blue-200" strokeWidth={2} />
                      <span className="text-[10px] font-medium text-blue-200">
                        {item.label}
                      </span>
                    </div>
                  )}
                  
                  {isActive && (
                    <span className="absolute -bottom-1 text-[9px] font-bold text-primary 
                                     whitespace-nowrap tracking-wide uppercase opacity-0">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
      
      <MobileMoreDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
