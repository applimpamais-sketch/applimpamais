import { ReactNode } from 'react';
import { useTenantModules } from '@/hooks/useTenantModules';
import { MODULE_NAMES } from '@/config/moduleMenuMapping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

interface ModuleGateProps {
  module: string;
  children: ReactNode;
  fallback?: ReactNode;
  showLockedCard?: boolean;
  moduleName?: string;
}

export function ModuleGate({ 
  module, 
  children, 
  fallback, 
  showLockedCard = true,
  moduleName 
}: ModuleGateProps) {
  const { hasModule, isLoading } = useTenantModules();

  // Durante loading, mostra spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasModule(module)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLockedCard) {
      return <LockedModuleCard moduleName={moduleName || MODULE_NAMES[module] || module} moduleCode={module} />;
    }

    return null;
  }

  return <>{children}</>;
}

interface LockedModuleCardProps {
  moduleName: string;
  moduleCode: string;
}

function LockedModuleCard({ moduleName, moduleCode }: LockedModuleCardProps) {
  const whatsappMessage = encodeURIComponent(`Olá! Gostaria de saber mais sobre o módulo ${moduleName}`);
  
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">
            Módulo Não Incluído
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            O módulo <strong>{moduleName}</strong> não está incluído no seu plano atual.
            Entre em contato para ativar esta funcionalidade.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button className="w-full" asChild>
              <a 
                href={`https://wa.me/5511999999999?text=${whatsappMessage}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                Falar com Comercial
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para esconder item de menu se não tem módulo
interface ModuleMenuItemProps {
  module: string;
  children: ReactNode;
}

export function ModuleMenuItem({ module, children }: ModuleMenuItemProps) {
  const { hasModule, isLoading } = useTenantModules();

  // Durante loading, não mostra nada para evitar flash
  if (isLoading) return null;

  if (!hasModule(module)) {
    return null;
  }

  return <>{children}</>;
}
