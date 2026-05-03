import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTenantContext } from '@/hooks/useTenantContext';
import { useTenantModules } from '@/hooks/useTenantModules';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User, LogOut, Wrench } from 'lucide-react';
import { TenantLogo } from '@/components/branding/TenantLogo';

export default function TecnicoHeader() {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { tenant } = useTenantContext();
  const { hasModule } = useTenantModules();

  const nomeExibicao = profile?.nome_completo || 'Técnico';
  const iniciais = nomeExibicao
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const showTenantLogo = hasModule('white_label') && tenant?.logo_url;

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {showTenantLogo ? (
          <TenantLogo
            logoUrl={tenant!.logo_url}
            companyName={tenant!.nome_fantasia || tenant!.nome_empresa}
            className="h-10 object-contain"
          />
        ) : (
          <div className="flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">Limpamais Técnico</span>
          </div>
        )}

        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/tecnico/servicos"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Calendar className="h-4 w-4" />
            <span>Meus Serviços</span>
          </NavLink>

          <NavLink
            to="/tecnico/perfil"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{nomeExibicao}</p>
            <p className="text-xs text-muted-foreground">Técnico</p>
          </div>

          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">{iniciais}</AvatarFallback>
          </Avatar>

          <Button variant="ghost" size="icon" onClick={() => signOut('/tecnico/auth')} title="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
