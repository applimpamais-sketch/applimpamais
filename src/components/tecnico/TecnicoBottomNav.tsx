import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { 
    to: '/tecnico/servicos', 
    icon: Calendar, 
    label: 'Serviços',
    matchPaths: ['/tecnico', '/tecnico/servicos']
  },
  { 
    to: '/tecnico/perfil', 
    icon: User, 
    label: 'Perfil',
    matchPaths: ['/tecnico/perfil']
  },
];

export default function TecnicoBottomNav() {
  const location = useLocation();

  const isActive = (matchPaths: string[]) => {
    return matchPaths.some(path => 
      path === '/tecnico' 
        ? location.pathname === '/tecnico' || location.pathname === '/tecnico/servicos'
        : location.pathname.startsWith(path)
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Wave/Curve Background */}
      <div className="relative">
        <svg
          className="absolute bottom-full left-0 w-full h-6"
          viewBox="0 0 400 24"
          preserveAspectRatio="none"
        >
          <path
            d="M0,24 L0,12 Q100,0 200,12 Q300,24 400,12 L400,24 Z"
            className="fill-background"
          />
        </svg>
        
        <div className="bg-background border-t border-border/50 px-4 pb-safe">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const active = isActive(item.matchPaths);
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center gap-1 py-2 px-6 min-w-[80px] touch-target"
                >
                  <div
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
