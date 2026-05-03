import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Download, 
  Bell, 
  Zap, 
  Wifi, 
  CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { PLATFORM_NAME } from '@/lib/constants';

export default function InstalarApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error('Instalação não disponível no momento. Use as instruções abaixo para instalar manualmente.');
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App instalado com sucesso!');
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <Smartphone className="w-8 h-8 text-primary" />
            Instalar Aplicativo {PLATFORM_NAME}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status de instalação */}
          {isInstalled && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>App já instalado!</AlertTitle>
              <AlertDescription>
                O aplicativo já está instalado no seu dispositivo.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Instruções Android */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-primary" />
              📱 Como instalar no Android
            </h3>
            <ol className="space-y-2 list-decimal list-inside text-sm md:text-base text-muted-foreground">
              <li>Abra este site no navegador <strong>Chrome</strong> do seu Android</li>
              <li>Toque no menu <strong>(⋮)</strong> no canto superior direito</li>
              <li>Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar app"</strong></li>
              <li>Confirme tocando em <strong>"Adicionar"</strong> ou <strong>"Instalar"</strong></li>
              <li>O ícone da {PLATFORM_NAME} aparecerá na sua tela inicial 🎉</li>
            </ol>
          </div>
          
          <Separator />
          
          {/* Instruções iOS */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-primary" />
              🍎 Como instalar no iOS (iPhone/iPad)
            </h3>
            <ol className="space-y-2 list-decimal list-inside text-sm md:text-base text-muted-foreground">
              <li>Abra este site no <strong>Safari</strong> (navegador padrão do iPhone)</li>
              <li>Toque no botão de compartilhar <strong>(□↑)</strong> na parte inferior</li>
              <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
              <li>Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
              <li>O ícone da {PLATFORM_NAME} aparecerá na sua tela inicial 🎉</li>
            </ol>
          </div>
          
          <Separator />
          
          {/* Recursos do App */}
          <div>
            <h3 className="text-lg font-semibold mb-4">✨ Recursos do App</h3>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas instantâneos de novos agendamentos, mesmo com o app fechado
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Acesso Rápido</p>
                  <p className="text-sm text-muted-foreground">
                    Abra direto da tela inicial, sem precisar do navegador
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Funciona Offline</p>
                  <p className="text-sm text-muted-foreground">
                    Visualize dados em cache mesmo sem conexão à internet
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botão de instalação */}
          {!isInstalled && (
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleInstallClick}
            >
              <Download className="mr-2 h-5 w-5" />
              {deferredPrompt ? 'Baixar Agora' : 'Seguir Instruções Acima'}
            </Button>
          )}
          
          {isInstalled && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Você já pode fechar esta aba e usar o app através do ícone na tela inicial! 🚀
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
