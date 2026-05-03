import { ReactNode, useEffect, useState, Component, ErrorInfo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import AccessDenied from './AccessDenied';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type AppRole = 'admin' | 'operador' | 'visualizador' | 'tecnico';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
}

class ProtectedRouteErrorBoundary extends Component<
  { children: ReactNode; requiredRole: AppRole },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; requiredRole: AppRole }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ProtectedRoute Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const loginPath = this.props.requiredRole === 'tecnico' ? '/tecnico/auth' : '/auth';

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Erro ao Carregar</h1>
            <p className="text-muted-foreground mb-6">
              Ocorreu um erro ao verificar suas permissões.
              <br />
              Por favor, tente fazer login novamente.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
              <Button onClick={() => window.location.href = loginPath}>
                Fazer Login
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedRouteInner({
  children,
  requiredRole = 'admin'
}: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthorization() {
      if (!loading && !user) {
        if (isMounted) {
          setAuthorized(false);
          setCheckComplete(true);
        }
        return;
      }

      if (loading) {
        return;
      }

      try {
        const allowed = requiredRole === 'admin'
          ? ((await hasRole('admin')) || (await hasRole('operador')))
          : await hasRole(requiredRole);

        if (isMounted) {
          setAuthorized(allowed);
          setCheckComplete(true);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        if (isMounted) {
          setAuthorized(false);
          setCheckComplete(true);
        }
      }
    }

    checkAuthorization();

    return () => {
      isMounted = false;
    };
  }, [user, loading, requiredRole, hasRole]);

  if (loading || !checkComplete) {
    return <LoadingSpinner />;
  }

  if (!user) {
    const redirectTo = requiredRole === 'tecnico' ? '/tecnico/auth' : '/auth';
    return <Navigate to={redirectTo} replace />;
  }

  if (!authorized) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  return (
    <ProtectedRouteErrorBoundary requiredRole={props.requiredRole || 'admin'}>
      <ProtectedRouteInner {...props} />
    </ProtectedRouteErrorBoundary>
  );
}
