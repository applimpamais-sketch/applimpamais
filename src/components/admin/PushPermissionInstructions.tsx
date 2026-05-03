import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Chrome, Globe, Info } from 'lucide-react';

interface PushPermissionInstructionsProps {
  browser: string;
}

export default function PushPermissionInstructions({ browser }: PushPermissionInstructionsProps) {
  const getInstructions = () => {
    switch (browser) {
      case 'chrome':
      case 'edge':
        return {
          icon: <Chrome className="h-5 w-5" />,
          name: browser === 'chrome' ? 'Google Chrome' : 'Microsoft Edge',
          steps: [
            'Clique no ícone de cadeado 🔒 ou informações ℹ️ ao lado da URL',
            'Procure por "Notificações" nas permissões',
            'Mude de "Bloquear" para "Permitir"',
            'Recarregue a página'
          ]
        };
      case 'firefox':
        return {
          icon: <Globe className="h-5 w-5" />,
          name: 'Mozilla Firefox',
          steps: [
            'Clique no ícone de cadeado 🔒 ao lado da URL',
            'Clique na seta ">" ao lado de "Permissões"',
            'Encontre "Receber notificações"',
            'Remova o bloqueio ou permita',
            'Recarregue a página'
          ]
        };
      case 'safari':
        return {
          icon: <Globe className="h-5 w-5" />,
          name: 'Safari',
          steps: [
            'Abra Safari → Preferências (ou Configurações)',
            'Vá para a aba "Sites"',
            'Clique em "Notificações" no menu lateral',
            'Encontre este site na lista',
            'Mude para "Permitir"',
            'Recarregue a página'
          ]
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          name: 'Seu Navegador',
          steps: [
            'Abra as configurações do navegador',
            'Procure por "Notificações" ou "Permissões"',
            'Encontre este site na lista',
            'Altere a permissão para "Permitir"',
            'Recarregue a página'
          ]
        };
    }
  };

  const instructions = getInstructions();

  return (
    <Card className="border-border/50 bg-background/60 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          {instructions.icon}
          <CardTitle className="text-lg">Como Reativar Notificações</CardTitle>
        </div>
        <CardDescription>
          Instruções para {instructions.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            As notificações foram bloqueadas pelo navegador. Siga os passos abaixo para reativar:
          </AlertDescription>
        </Alert>

        <ol className="space-y-3">
          {instructions.steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {index + 1}
              </span>
              <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <Alert className="bg-muted/50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Dica:</strong> Se as notificações continuarem bloqueadas, tente limpar os dados do site nas configurações do navegador e solicitar a permissão novamente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
