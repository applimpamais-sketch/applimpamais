import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { usePushPermission } from '@/hooks/usePushPermission';
import { toast } from 'sonner';

interface PushOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function PushOnboardingModal({ open, onOpenChange, onSuccess }: PushOnboardingModalProps) {
  const { requestPermission, isLoading } = usePushPermission();
  const [showError, setShowError] = useState(false);

  const benefits = [
    {
      icon: <Calendar className="h-5 w-5 text-primary" />,
      title: 'Novos Agendamentos',
      description: 'Receba alertas instantâneos quando um cliente finalizar um agendamento'
    },
    {
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      title: 'Pagamentos Confirmados',
      description: 'Seja notificado imediatamente quando um pagamento for recebido'
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-blue-500" />,
      title: 'Status de Serviços',
      description: 'Acompanhe em tempo real quando serviços são iniciados ou concluídos'
    }
  ];

  const handleActivate = async () => {
    const result = await requestPermission();
    
    if (result === 'granted') {
      toast.success('Notificações ativadas com sucesso!');
      onOpenChange(false);
      onSuccess?.();
    } else if (result === 'denied') {
      setShowError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-background/95">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Ativar Notificações Push
          </DialogTitle>
          <DialogDescription className="text-center">
            Mantenha-se sempre atualizado sobre o que acontece no seu negócio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/30">
              <div className="flex-shrink-0 mt-1">
                {benefit.icon}
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">{benefit.title}</h4>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}

          {showError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs text-destructive">
                <p className="font-medium mb-1">Permissão negada</p>
                <p>As notificações foram bloqueadas. Você precisará permitir manualmente nas configurações do navegador.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            onClick={handleActivate} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Aguardando...' : 'Ativar Notificações'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="w-full"
            disabled={isLoading}
          >
            Agora não
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
