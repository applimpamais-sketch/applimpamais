import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  UserPlus,
  Settings,
  LogOut,
  Crown,
  Server,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/super-admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    title: 'Empresas',
    url: '/super-admin/tenants',
    icon: Building2,
  },
  {
    title: 'Financeiro',
    url: '/super-admin/financeiro',
    icon: DollarSign,
  },
  {
    title: 'Novo Cliente',
    url: '/super-admin/novo-tenant',
    icon: UserPlus,
  },
  {
    title: 'Catálogo',
    url: '/super-admin/catalogo',
    icon: Package,
  },
  {
    title: 'Recursos',
    url: '/super-admin/recursos',
    icon: Server,
  },
];

export function SuperAdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const collapsed = state === 'collapsed';

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={cn(collapsed ? 'w-14' : 'w-64')} collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <Crown className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground">Super Admin</span>
              <span className="text-xs text-muted-foreground">Gestão SaaS</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        isActive(item.url, item.end)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Admin Normal</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => signOut('/auth')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="border-t border-border/50 p-2">
        <SidebarTrigger className="w-full" />
      </div>
    </Sidebar>
  );
}
