import { useState } from 'react';
import { Bell, BellOff, BellRing, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushPermission } from '@/hooks/usePushPermission';
import PushPreferencesModal from './PushPreferencesModal';
import { cn } from '@/lib/utils';
import { useTenantContext } from '@/hooks/useTenantContext';
import { useTenantModules } from '@/hooks/useTenantModules';
import { TenantLogo } from '@/components/branding/TenantLogo';

export default function AdminHeader() {
  const [showPreferences, setShowPreferences] = useState(false);
  const { permissionStatus, isSupported } = usePushPermission();
  const { tenant } = useTenantContext();
  const { hasModule } = useTenantModules();

  const showTenantLogo = hasModule('white_label') && tenant?.logo_url;

  const getIconAndColor = () => {
    if (!isSupported) {
      return { icon: BellOff, className: 'text-muted-foreground' };
    }

    switch (permissionStatus) {
      case 'granted':
        return { icon: BellRing, className: 'text-green-500' };
      case 'denied':
        return { icon: BellOff, className: 'text-destructive' };
      default:
        return { icon: Bell, className: 'text-yellow-500' };
    }
  };

  const { icon: BellIcon, className } = getIconAndColor();

  return (
    <>
      <header className="sticky top-0 z-40 h-16 backdrop-blur-xl bg-background/80 border-b border-border/40 shadow-sm">
        <div className="h-full flex items-center justify-between px-4 gap-4">
          {showTenantLogo ? (
            <TenantLogo
              logoUrl={tenant!.logo_url!}
              companyName={tenant!.nome_fantasia || tenant!.nome_empresa || 'Limpamais'}
              className="h-10 w-auto object-contain md:hidden"
            />
          ) : (
            <div className="flex items-center gap-2 md:hidden">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <span className="font-semibold text-foreground">Limpamais</span>
            </div>
          )}

          <div className="flex-1 md:hidden" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPreferences(true)}
            className="ml-auto relative"
            title={
              permissionStatus === 'granted'
                ? 'Notificações Ativas'
                : permissionStatus === 'denied'
                ? 'Notificações Bloqueadas'
                : 'Ativar Notificações'
            }
          >
            <BellIcon className={cn('h-5 w-5', className)} />
            {permissionStatus === 'default' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
            )}
          </Button>
        </div>
      </header>

      <PushPreferencesModal open={showPreferences} onOpenChange={setShowPreferences} />
    </>
  );
}
