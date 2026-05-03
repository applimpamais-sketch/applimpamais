import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type AppRole = 'admin' | 'operador' | 'visualizador' | 'tecnico';

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: (redirectPath?: string) => Promise<void>;
  hasRole: (role: AppRole) => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (import.meta.env.DEV) {
          console.log('Auth event:', event, session ? 'Session active' : 'No session');
        }
        
        if (event === 'SIGNED_OUT') {
          // Não redirecionar automaticamente - deixar a página gerenciar
        }
        
        if (event === 'TOKEN_REFRESHED') {
          if (import.meta.env.DEV) {
            console.log('Token renovado com sucesso');
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // 🔒 SECURITY: Limpar tokens da URL após autenticação
        if (event === 'SIGNED_IN' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Verificação periódica da sessão (heartbeat)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error('Sessão expirou, fazendo logout automático');
        await signOut();
      }
    }, 5 * 60 * 1000); // Verifica a cada 5 minutos

    return () => clearInterval(interval);
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async (redirectPath: string = '/auth') => {
    await supabase.auth.signOut();
    navigate(redirectPath);
  };

  const hasRole = useCallback(async (role: AppRole): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { data, error } = await (supabase as any).rpc('has_role', {
        _user_id: user.id,
        _role: role
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error checking role:', error);
        }
        return false;
      }

      return data || false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Exception checking role:', error);
      }
      return false;
    }
  }, [user]);

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    hasRole,
  };
}
