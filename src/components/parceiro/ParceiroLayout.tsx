import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Link2, 
  TrendingUp, 
  Wallet, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Package,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { TenantLogo } from '@/components/branding/TenantLogo';


interface ParceiroLayoutProps {
  children: ReactNode;
}

interface ParceiroData {
  id: string;
  nome: string;
  nome_exibicao: string | null;
  codigo_referencia: string;
  status: string;
  saldo_disponivel: number;
}

const menuItems = [
  { title: 'Dashboard', path: '/parceiro/dashboard', icon: LayoutDashboard },
  { title: 'Meus Links', path: '/parceiro/links', icon: Link2 },
  { title: 'Materiais', path: '/parceiro/materiais', icon: Package },
  { title: 'ConversÃµes', path: '/parceiro/conversoes', icon: TrendingUp },
  { title: 'Saques', path: '/parceiro/saques', icon: Wallet },
  { title: 'Meu Perfil', path: '/parceiro/perfil', icon: User },
];

export default function ParceiroLayout({ children }: ParceiroLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parceiro, setParceiro] = useState<ParceiroData | null>(null);

  useEffect(() => {
    const fetchParceiro = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from('parceiros')
        .select('id, nome, nome_exibicao, codigo_referencia, status, saldo_disponivel, tenant_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data) {
        setParceiro(data);
      }
    };

    fetchParceiro();
  }, []);
  
  // Buscar dados do tenant do parceiro para branding
  const { data: tenantData } = useQuery({
    queryKey: ['parceiro-tenant', (parceiro as any)?.tenant_id],
    queryFn: async () => {
      const tenantId = (parceiro as any)?.tenant_id;
      if (!tenantId) return null;
      
      const { data } = await supabase
        .from('saas_tenants')
        .select('id, nome_fantasia, nome_empresa, logo_url')
        .eq('id', tenantId)
        .single();
      
      return data;
    },
    enabled: !!(parceiro as any)?.tenant_id,
    staleTime: Infinity,
  });
  
  // Verificar tenant master
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/parceiro/auth', { replace: true });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: '#074FD5' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link to="/parceiro/dashboard" className="flex items-center gap-2">
              {tenantData?.logo_url ? (
                <TenantLogo 
                  logoUrl={tenantData.logo_url} 
                  companyName={tenantData.nome_fantasia || tenantData.nome_empresa} 
                  className="h-8 w-auto"
                />
              ) : (
                <div className="flex items-center gap-2 text-white">
                  <Users className="h-8 w-8 text-white" />
                  <span className="font-semibold">Limpamais</span>
                </div>
              )}
              <span className="font-semibold text-white">+ Parceiro</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Parceiro Info */}
          {parceiro && (
            <div className="p-4 border-b border-white/10">
              <p className="text-sm text-white/70">OlÃ¡,</p>
              <p className="font-bold text-base sm:text-lg truncate text-white">{parceiro.nome_exibicao || parceiro.nome}</p>
              <div className="mt-2">
                <span className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium",
                  parceiro.status === 'ativo' ? "bg-[#1FE785]/20 text-[#1FE785]" :
                  parceiro.status === 'pendente' ? "bg-yellow-400/20 text-yellow-300" :
                  "bg-red-400/20 text-red-300"
                )}>
                  {parceiro.status}
                </span>
              </div>
              <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/10">
                <p className="text-xs text-white/70 mb-1">Saldo disponÃ­vel</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(parceiro.saldo_disponivel)}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1.5 px-3">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-[#1FE785] text-white shadow-md" 
                        : "text-white hover:bg-white/10"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:text-red-300 hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-3 border-b bg-card md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm">Ãrea do Parceiro</span>
          {parceiro && (
            <span className="text-xs font-medium text-primary">
              {formatCurrency(parceiro.saldo_disponivel)}
            </span>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


