import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContext } from '@/hooks/useTenantContext';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPPORT_EMAIL } from '@/lib/constants';

export default function ProtectedClienteRoute() {
  const { user, loading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading, tenantChecked, error } = useTenantContext();

  // Loading state: auth carregando OU tenant carregando OU verificaÃ§Ã£o nÃ£o concluÃ­da
  if (authLoading || tenantLoading || !tenantChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // NÃ£o autenticado
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // NOVO: Se houve erro ao buscar tenant, mostrar erro em vez de redirecionar
  // Isso evita loops quando hÃ¡ problemas de RLS ou rede
  if (error) {
    console.error('[ProtectedClienteRoute] Erro ao buscar tenant:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Erro ao Carregar</CardTitle>
            <CardDescription>
              NÃ£o foi possÃ­vel carregar os dados da sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Isso pode ser um problema temporÃ¡rio. Tente recarregar a pÃ¡gina.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
              <Button variant="destructive" onClick={() => window.location.href = '/auth'}>
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // VerificaÃ§Ã£o do tenant CONCLUÃDA e nÃ£o tem tenant â†’ Ã© master
  // IMPORTANTE: SÃ³ redireciona se nÃ£o houve erro e a verificaÃ§Ã£o estÃ¡ completa
  if (tenantChecked && !tenant && !error) {
    console.log('[ProtectedClienteRoute] UsuÃ¡rio sem tenant (master), redirecionando para /admin');
    return <Navigate to="/admin" replace />;
  }

  // Tenant suspenso ou cancelado
  if (tenant && (tenant.status === 'suspenso' || tenant.status === 'cancelado')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">âš ï¸</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Conta {tenant.status === 'suspenso' ? 'Suspensa' : 'Cancelada'}</h1>
          <p className="text-muted-foreground mb-4">
            {tenant.status === 'suspenso' 
              ? 'Sua conta estÃ¡ suspensa. Entre em contato com o suporte para regularizar sua situaÃ§Ã£o.'
              : 'Sua conta foi cancelada. Entre em contato se desejar reativar seu plano.'
            }
          </p>
          <a 
            href={`mailto:${SUPPORT_EMAIL}`} 
            className="text-primary hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

