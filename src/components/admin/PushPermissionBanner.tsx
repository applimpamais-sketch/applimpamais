import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, CheckCircle2, BellOff } from 'lucide-react';
import { usePushPermission, PermissionStatus } from '@/hooks/usePushPermission';
import PushOnboardingModal from './PushOnboardingModal';
import PushPermissionInstructions from './PushPermissionInstructions';

export default function PushPermissionBanner() {
  const { permissionStatus, isSupported, getBrowserName } = usePushPermission();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isSupported) {
    return (
      <Alert variant="destructive" className="backdrop-blur-md bg-background/60 border-border/50">
        <BellOff className="h-4 w-4" />
        <AlertTitle>Notificações Não Suportadas</AlertTitle>
        <AlertDescription>
          Seu navegador não suporta notificações push. Atualize para a versão mais recente ou utilize Chrome, Firefox ou Edge.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusConfig = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return {
          variant: 'default' as const,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          title: 'Notificações Ativas',
          description: 'Você receberá alertas em tempo real sobre novos agendamentos e pagamentos.',
          action: null,
          className: 'border-green-500/20 bg-green-500/5'
        };
      case 'denied':
        return {
          variant: 'destructive' as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Notificações Bloqueadas',
          description: 'As notificações foram bloqueadas pelo navegador. Clique em "Ver Como Reativar" para instruções.',
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? 'Ocultar Instruções' : 'Ver Como Reativar'}
            </Button>
          ),
          className: 'border-destructive/20'
        };
      case 'default':
      default:
        return {
          variant: 'default' as const,
          icon: <Bell className="h-4 w-4 text-yellow-500" />,
          title: 'Ative as Notificações',
          description: 'Receba alertas instantâneos de novos agendamentos, pagamentos e atualizações importantes.',
          action: (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setShowOnboarding(true)}
            >
              Ativar Agora
            </Button>
          ),
          className: 'border-yellow-500/20 bg-yellow-500/5'
        };
    }
  };

  const config = getStatusConfig(permissionStatus);

  return (
    <>
      <div className="space-y-4">
        <Alert variant={config.variant} className={`backdrop-blur-md bg-background/60 border-border/50 ${config.className}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {config.icon}
              <div className="flex-1">
                <AlertTitle className="mb-1">{config.title}</AlertTitle>
                <AlertDescription className="text-sm">
                  {config.description}
                </AlertDescription>
              </div>
            </div>
            {config.action && (
              <div className="flex-shrink-0">
                {config.action}
              </div>
            )}
          </div>
        </Alert>

        {showInstructions && permissionStatus === 'denied' && (
          <PushPermissionInstructions browser={getBrowserName()} />
        )}
      </div>

      <PushOnboardingModal 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding}
        onSuccess={() => {
          // Recarregar permissões após sucesso
          window.location.reload();
        }}
      />
    </>
  );
}
