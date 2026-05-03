import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send,
  LayoutDashboard, 
  Calendar, 
  Wrench,
  ShoppingCart,
  Ticket,
  BarChart3,
  UserPlus,
  DollarSign,
  Plug,
  ChevronDown,
  ChevronRight,
  Link2,
  TrendingUp,
  Wallet,
  Target,
  Receipt,
  LineChart,
  FileText,
  Megaphone,
  Eye,
  Zap,
  MessageSquare,
  Users2,
  FileSpreadsheet,
  Star,
  MapPinned,
  HelpCircle,
  Shield,
  Lock,
  Package,
  BookOpen,
  Wand2,
  ListTodo,
  Settings,
  Palette,
  Image,
  Layout,
  Activity,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTenantModules } from '@/hooks/useTenantModules';
import { useTenantContext } from '@/hooks/useTenantContext';
import { MODULE_NAMES } from '@/config/moduleMenuMapping';
import { TenantLogo } from '@/components/branding/TenantLogo';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SessionMonitor } from './SessionMonitor';

interface SidebarProps {
  className?: string;
}

interface MenuItemType {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  requiredModule?: string;
}

const principalItems: MenuItemType[] = [
  { title: 'VisÃ£o Geral', path: '/admin', icon: LayoutDashboard, end: true },
  { title: 'Analytics', path: '/admin/analytics', icon: Activity, requiredModule: 'loja_online' },
  { title: 'Agendamentos', path: '/admin/agendamentos', icon: Calendar },
  { title: 'TÃ©cnicos', path: '/admin/tecnicos', icon: Wrench, requiredModule: 'rastreamento_rota' },
  { title: 'HistÃ³rico Tracking', path: '/admin/tracking', icon: MapPinned, requiredModule: 'rastreamento_rota' },
];

const blogItems: MenuItemType[] = [
  { title: 'Dashboard', path: '/admin/blog', icon: LayoutDashboard, end: true },
  { title: 'Gerar Posts', path: '/admin/blog/gerar', icon: Wand2 },
  { title: 'Fila & RevisÃ£o', path: '/admin/blog/fila', icon: ListTodo },
  { title: 'Banco Keywords', path: '/admin/blog/keywords', icon: FileText },
  { title: 'Importar Keywords', path: '/admin/blog/importar', icon: FileSpreadsheet },
  { title: 'ConfiguraÃ§Ãµes', path: '/admin/blog/configuracoes', icon: Settings },
];

const iarcItems: MenuItemType[] = [
  { title: 'Dashboard', path: '/admin/iarc', icon: LayoutDashboard, end: true },
  { title: 'Criativos', path: '/admin/iarc/criativos', icon: Image },
  { title: 'Landing Pages', path: '/admin/iarc/landing-pages', icon: Layout },
  { title: 'Gerador de Copy', path: '/admin/iarc/copy-generator', icon: FileText },
];

const marketingItems: MenuItemType[] = [
  { title: 'Marketing', path: '/admin/marketing', icon: Megaphone, requiredModule: 'marketing_tools' },
  { title: 'Carrinhos Abandonados', path: '/admin/carrinhos-abandonados', icon: ShoppingCart, requiredModule: 'marketing_tools' },
  { title: 'Cupons', path: '/admin/cupons', icon: Ticket, requiredModule: 'marketing_tools' },
  { title: 'Central Mensagens', path: '/admin/central-mensagens', icon: Send, requiredModule: 'whatsapp_bot' },
  { title: 'Templates WhatsApp', path: '/admin/templates', icon: MessageSquare, requiredModule: 'whatsapp_bot' },
  { title: 'Comandos do Bot', path: '/admin/comandos-bot', icon: Bot, requiredModule: 'whatsapp_bot' },
  { title: 'NotificaÃ§Ãµes Push', path: '/admin/push-notifications', icon: Zap, requiredModule: 'marketing_tools' },
  { title: 'Config. AvaliaÃ§Ãµes', path: '/admin/avaliacoes-config', icon: Star, requiredModule: 'marketing_tools' },
];

const gestaoItems: MenuItemType[] = [
  { title: 'Meus ServiÃ§os', path: '/admin/servicos', icon: Package, requiredModule: 'loja_online' },
  { title: 'OrÃ§amentos', path: '/admin/orcamentos', icon: FileSpreadsheet, requiredModule: 'loja_online' },
  { title: 'RelatÃ³rios', path: '/admin/relatorios', icon: BarChart3, requiredModule: 'relatorios_avancados' },
  { title: 'Equipe', path: '/admin/equipe', icon: UserPlus },
  { title: 'Parcerias', path: '/admin/parcerias', icon: Users2, requiredModule: 'parcerias' },
  { title: 'Notas Fiscais', path: '/admin/notas-fiscais', icon: FileText, requiredModule: 'financeiro' },
];

const financeiroItems: MenuItemType[] = [
  { title: 'Dashboard', path: '/admin/financeiro', icon: LayoutDashboard, end: true },
  { title: 'Consolidado', path: '/admin/financeiro/consolidado', icon: TrendingUp },
  { title: 'Receitas', path: '/admin/financeiro/receitas', icon: Wallet },
  { title: 'Despesas', path: '/admin/financeiro/despesas', icon: Receipt },
  { title: 'Fluxo de Caixa', path: '/admin/financeiro/fluxo-caixa', icon: LineChart },
  { title: 'Metas', path: '/admin/financeiro/metas', icon: Target },
];

const integracoesItems: MenuItemType[] = [
  { title: 'Canais de Origem', path: '/admin/integracoes/canais', icon: Link2 },
  { title: 'WhatsApp', path: '/admin/integracoes/whatsapp', icon: MessageSquare, requiredModule: 'whatsapp_bot' },
  { title: 'AnÃºncios', path: '/admin/integracoes/anuncios', icon: Megaphone, requiredModule: 'api_access' },
  
  { title: 'Webhook', path: '/admin/integracoes/webhook', icon: Zap, requiredModule: 'api_access' },
  { title: 'UTMify', path: '/admin/integracoes/utmify', icon: BarChart3, requiredModule: 'api_access' },
  { title: 'Dashboard UTMify', path: '/admin/integracoes/utmify-dashboard', icon: TrendingUp, requiredModule: 'api_access' },
];

// MenuItem que verifica se o mÃ³dulo estÃ¡ disponÃ­vel
const MenuItem = ({ item, hasModule }: { item: MenuItemType; hasModule: (code: string) => boolean }) => {
  const isLocked = item.requiredModule && !hasModule(item.requiredModule);
  const moduleName = item.requiredModule ? MODULE_NAMES[item.requiredModule] || item.requiredModule : '';

  if (isLocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg",
              "text-white/40 cursor-not-allowed"
            )}
          >
            <Lock className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{item.title}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-background text-foreground border">
          <p className="text-sm">
            MÃ³dulo <strong>{moduleName}</strong> nÃ£o incluÃ­do no seu plano
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200",
        "hover:bg-white/10",
        isActive 
          ? "bg-[#1FE785] text-white font-medium" 
          : "text-white"
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span>{item.title}</span>
    </NavLink>
  );
};

// Submenu bloqueÃ¡vel
const LockedSubmenu = ({ 
  title, 
  icon: Icon, 
  items, 
  expanded, 
  setExpanded, 
  requiredModule, 
  hasModule 
}: { 
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItemType[];
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  requiredModule: string;
  hasModule: (code: string) => boolean;
}) => {
  const isLocked = !hasModule(requiredModule);
  const moduleName = MODULE_NAMES[requiredModule] || requiredModule;

  if (isLocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full flex items-center justify-between px-3 py-2.5 mx-2 text-white/40 cursor-not-allowed rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4" />
              <span className="text-sm">{title}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-background text-foreground border">
          <p className="text-sm">
            MÃ³dulo <strong>{moduleName}</strong> nÃ£o incluÃ­do no seu plano
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-all"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <span className="text-sm">{title}</span>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {expanded && (
        <div className="ml-6 mt-1 space-y-1">
          {items.map((item) => (
            <MenuItem key={item.path} item={item} hasModule={hasModule} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar({ className }: SidebarProps) {
  const [financeiroExpanded, setFinanceiroExpanded] = useState(true);
  const [integracoesExpanded, setIntegracoesExpanded] = useState(true);
  const [blogExpanded, setBlogExpanded] = useState(true);
  const [iarcExpanded, setIarcExpanded] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const { hasModule, isLoading: modulesLoading } = useTenantModules();
  const { tenant } = useTenantContext();

  // Check if user is super_admin
  useEffect(() => {
    async function checkSuperAdmin() {
      if (!user) return;
      const { data, error } = await supabase.rpc('is_super_admin', { _user_id: user.id });
      console.log('[Sidebar] Super Admin check:', { userId: user.id, data, error });
      setIsSuperAdmin(data === true);
    }
    checkSuperAdmin();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  // Detectar tenant master
  // Logo dinÃ¢mico: tenant com white_label usa logo_url
  const showTenantLogo = hasModule('white_label') && tenant?.logo_url;

  return (
    /**
     * ESTRUTURA DO SIDEBAR - 3 BLOCOS:
     * 1. HEADER FIXO (logo) - flex-shrink-0
     * 2. NAV SCROLLÃVEL (menu) - flex-1 min-h-0 overflow-y-auto
     * 3. FOOTER FIXO (ajuda/avatar) - flex-shrink-0
     * 
     * IMPORTANTE: O <aside> recebe className externo (hidden/md:flex) 
     * para controlar visibilidade SEM quebrar o display:flex do <nav> interno.
     */
    <aside className={className}>
      <nav className="h-screen w-64 flex flex-col overflow-hidden border-r border-white/10 bg-[#074FD5]">
        {/* ===== BLOCO A: HEADER FIXO - Logo ===== */}
        <div className="flex-shrink-0 border-b border-white/10 flex items-center justify-center px-4 py-6">
          {showTenantLogo ? (
            <TenantLogo
              logoUrl={tenant!.logo_url!}
              companyName={tenant!.nome_fantasia || tenant!.nome_empresa || 'Limpamais'}
              className="h-12 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-10 w-10 text-white" />
              <span className="font-bold text-white text-lg">Limpamais</span>
            </div>
          )}
        </div>

        {/* ===== BLOCO B: NAV SCROLLÃVEL - ÃšNICO CONTAINER COM SCROLL ===== */}
        <div 
          className="sidebar-content flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-4"
          style={{
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
        >
        {/* PRINCIPAL */}
        <div className="space-y-2">
          <h3 className="px-3 text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
            Principal
          </h3>
          {principalItems.map((item) => (
            <MenuItem key={item.path} item={item} hasModule={hasModule} />
          ))}
        </div>

        {/* MARKETING */}
        <div className="space-y-2">
          <h3 className="px-3 text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
            Marketing
          </h3>
          
          {/* Blog / SEO - Submenu bloqueÃ¡vel */}
          <LockedSubmenu
            title="Blog / SEO"
            icon={BookOpen}
            items={blogItems}
            expanded={blogExpanded}
            setExpanded={setBlogExpanded}
            requiredModule="blog_seo"
            hasModule={hasModule}
          />

          {/* IARC Studio - Submenu bloqueÃ¡vel */}
          <LockedSubmenu
            title="IARC Studio"
            icon={Palette}
            items={iarcItems}
            expanded={iarcExpanded}
            setExpanded={setIarcExpanded}
            requiredModule="iarc_criativos"
            hasModule={hasModule}
          />

          {marketingItems.map((item) => (
            <MenuItem key={item.path} item={item} hasModule={hasModule} />
          ))}
        </div>

        {/* GESTÃƒO */}
        <div className="space-y-2">
          <h3 className="px-3 text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
            GestÃ£o
          </h3>
          {gestaoItems.map((item) => (
            <MenuItem key={item.path} item={item} hasModule={hasModule} />
          ))}

          {/* Financeiro - Submenu bloqueÃ¡vel */}
          <LockedSubmenu
            title="Financeiro"
            icon={DollarSign}
            items={financeiroItems}
            expanded={financeiroExpanded}
            setExpanded={setFinanceiroExpanded}
            requiredModule="financeiro"
            hasModule={hasModule}
          />

          {/* IntegraÃ§Ãµes - Submenu bloqueÃ¡vel */}
          <LockedSubmenu
            title="IntegraÃ§Ãµes"
            icon={Plug}
            items={integracoesItems}
            expanded={integracoesExpanded}
            setExpanded={setIntegracoesExpanded}
            requiredModule="api_access"
            hasModule={hasModule}
          />
        </div>

        {/* Padding extra no final para garantir que o Ãºltimo item nÃ£o fique colado */}
        <div className="h-4" aria-hidden="true" />
      </div>

      {/* ===== BLOCO C: FOOTER FIXO - Central de Ajuda + Avatar ===== */}
      <div className="flex-shrink-0 border-t border-white/10 p-4 space-y-3">
        {/* Link Super Admin - sÃ³ aparece se for super_admin */}
        {isSuperAdmin && (
          <NavLink
            to="/super-admin"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
              "hover:bg-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30",
              isActive 
                ? "bg-purple-600 text-white font-medium" 
                : "text-purple-200"
            )}
          >
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Super Admin</span>
          </NavLink>
        )}
        
        {/* Link para Ajuda */}
        <NavLink
          to="/admin/ajuda"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
            "hover:bg-white/10",
            isActive 
              ? "bg-[#1FE785] text-white font-medium" 
              : "text-white/80"
          )}
        >
          <HelpCircle className="h-5 w-5" />
          <span className="text-sm">Central de Ajuda</span>
        </NavLink>
        
        <SessionMonitor />
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-all">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-white/20 text-white text-xs">
                  {profile?.nome_completo?.slice(0, 2).toUpperCase() || 'US'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">{profile?.nome_completo}</p>
                <p className="text-xs text-white/70">{profile?.email}</p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 bg-[#074FD5] border-white/20 text-white" side="top">
            <div className="space-y-2">
              <NavLink
                to="/admin/perfil"
                className="block px-3 py-2 text-sm hover:bg-white/10 rounded transition-colors"
              >
                Perfil
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded transition-colors"
              >
                Sair
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      </nav>
    </aside>
  );
}



