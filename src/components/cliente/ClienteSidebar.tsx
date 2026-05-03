import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTenantContext } from '@/hooks/useTenantContext';
import { 
  LayoutDashboard, 
  Settings, 
  CreditCard, 
  Package, 
  Users, 
  HelpCircle,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  { path: '/cliente', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/cliente/modulos', icon: Package, label: 'Módulos' },
  { path: '/cliente/assinatura', icon: CreditCard, label: 'Assinatura' },
  { path: '/cliente/equipe', icon: Users, label: 'Equipe' },
  { path: '/cliente/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function ClienteSidebar() {
  const location = useLocation();
  const { tenant } = useTenantContext();
  const { signOut } = useAuth();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await signOut('/auth');
  };

  // Cores customizadas do tenant
  const corPrimaria = tenant?.cores_personalizadas?.primaria;

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Header com logo do tenant */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {tenant?.logo_url ? (
            <img 
              src={tenant.logo_url} 
              alt={tenant.nome_empresa} 
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary"
              style={corPrimaria ? { backgroundColor: corPrimaria } : undefined}
            >
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">
              {tenant?.nome_fantasia || tenant?.nome_empresa || 'Minha Empresa'}
            </h2>
            <span className="text-xs text-muted-foreground capitalize">
              Plano {tenant?.plano || 'starter'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <Separator className="my-4" />

        <Link
          to="/cliente/ajuda"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive('/cliente/ajuda')
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <HelpCircle className="h-4 w-4" />
          Ajuda
        </Link>
      </nav>

      {/* Footer com logout */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
