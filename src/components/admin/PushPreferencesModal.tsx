import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePushPreferences } from '@/hooks/usePushPreferences';
import { usePushPermission } from '@/hooks/usePushPermission';
import { Loader2, AlertTriangle, CheckCircle2, Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PushPermissionInstructions from './PushPermissionInstructions';
import PushOnboardingModal from './PushOnboardingModal';

interface PushPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PushPreferencesModal({ open, onOpenChange }: PushPreferencesModalProps) {
  const { preferences, isLoading, updatePreferences, sendTestNotification } = usePushPreferences();
  const { permissionStatus, isSupported, getBrowserName } = usePushPermission();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (isLoading || !preferences) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-background/95">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences.mutate({ [key]: value });
  };

  const handleTimeChange = (key: 'horario_inicio' | 'horario_fim', value: string) => {
    updatePreferences.mutate({ [key]: value });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-background/95 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preferências de Notificações</DialogTitle>
            <DialogDescription>
              Configure quando você deseja receber notificações push
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!isSupported ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Seu navegador não suporta notificações push.
                </AlertDescription>
              </Alert>
            ) : permissionStatus === 'granted' ? (
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-sm text-green-700 dark:text-green-300">
                  Notificações ativas e funcionando!
                </AlertDescription>
              </Alert>
            ) : permissionStatus === 'denied' ? (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    As notificações estão bloqueadas pelo navegador.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  {showInstructions ? 'Ocultar' : 'Ver Como Reativar'}
                </Button>
                {showInstructions && (
                  <PushPermissionInstructions browser={getBrowserName()} />
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                  <Bell className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-300">
                    Notificações não ativadas. Ative para receber alertas.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowOnboarding(true)}
                >
                  Ativar Notificações
                </Button>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Tipos de Notificações</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="novo_agendamento" className="cursor-pointer text-sm">
                    Novos Agendamentos
                  </Label>
                  <Switch
                    id="novo_agendamento"
                    checked={preferences.novo_agendamento || false}
                    onCheckedChange={(checked) => handleToggle('novo_agendamento', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pagamento_recebido" className="cursor-pointer text-sm">
                    Pagamentos Recebidos
                  </Label>
                  <Switch
                    id="pagamento_recebido"
                    checked={preferences.pagamento_recebido || false}
                    onCheckedChange={(checked) => handleToggle('pagamento_recebido', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="agendamento_concluido" className="cursor-pointer text-sm">
                    Agendamentos Concluídos
                  </Label>
                  <Switch
                    id="agendamento_concluido"
                    checked={preferences.agendamento_concluido || false}
                    onCheckedChange={(checked) => handleToggle('agendamento_concluido', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Horário de Notificações</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horario_inicio" className="text-xs">Início</Label>
                  <Input
                    id="horario_inicio"
                    type="time"
                    value={preferences.horario_inicio || '08:00'}
                    onChange={(e) => handleTimeChange('horario_inicio', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario_fim" className="text-xs">Fim</Label>
                  <Input
                    id="horario_fim"
                    type="time"
                    value={preferences.horario_fim || '20:00'}
                    onChange={(e) => handleTimeChange('horario_fim', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="permitir_final_semana" className="cursor-pointer text-sm">
                  Permitir nos fins de semana
                </Label>
                <Switch
                  id="permitir_final_semana"
                  checked={preferences.permitir_final_semana || false}
                  onCheckedChange={(checked) => handleToggle('permitir_final_semana', checked)}
                />
              </div>
            </div>

            <Separator />

            <Button 
              onClick={() => sendTestNotification.mutate()}
              disabled={sendTestNotification.isPending || permissionStatus !== 'granted'}
              className="w-full"
              variant="outline"
            >
              {sendTestNotification.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Notificação de Teste'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PushOnboardingModal 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
