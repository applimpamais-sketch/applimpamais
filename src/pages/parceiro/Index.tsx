import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

export default function ParceiroIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate('/parceiro/auth', { replace: true });
        return;
      }

      const { data: parceiro } = await supabase
        .from('parceiros')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (parceiro) {
        navigate('/parceiro/dashboard', { replace: true });
      } else {
        navigate('/parceiro/auth', { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  return <LoadingSpinner />;
}
