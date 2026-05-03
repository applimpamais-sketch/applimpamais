import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

interface ProtectedParceiroRouteProps {
  children: ReactNode;
}

type RouteState = 'loading' | 'authorized' | 'suspended';

export default function ProtectedParceiroRoute({ children }: ProtectedParceiroRouteProps) {
  const [state, setState] = useState<RouteState>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate('/parceiro/auth', { replace: true });
        return;
      }

      const { data: parceiro } = await supabase
        .from('parceiros')
        .select('id, status')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!parceiro) {
        navigate('/parceiro/auth', { replace: true });
        return;
      }

      if (parceiro.status === 'suspenso' || parceiro.status === 'inativo') {
        setState('suspended');
        return;
      }

      setState('authorized');
    };

    checkAccess();

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/parceiro/auth', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (state === 'loading') {
    return <LoadingSpinner />;
  }

  if (state === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Conta Suspensa</h1>
          <p className="text-muted-foreground mb-6">
            Sua conta de parceiro foi suspensa. 
            Entre em contato conosco para mais informações.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
