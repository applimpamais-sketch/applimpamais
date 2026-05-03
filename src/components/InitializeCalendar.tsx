import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenantContext } from '@/hooks/useTenantContext';

export function InitializeCalendar() {
  const [initialized, setInitialized] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { tenantId } = useTenantContext();

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    if (!isAdminRoute || !user?.id || !tenantId) {
      return;
    }

    const initCalendar = async () => {
      if (initialized) return;
      
      try {
        // Verificar se já existem dados
        const { count } = await supabase
          .from('calendario_disponibilidade')
          .eq('tenant_id', tenantId)
          .select('*', { count: 'exact', head: true });
        
        // Se não houver dados, inicializar
        if (count === 0) {
          await supabase.functions.invoke('init-calendario', {
            body: { days: 60, tenant_id: tenantId }
          });
          console.log('Calendário inicializado com sucesso');
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Erro ao inicializar calendário:', error);
      }
    };

    initCalendar();
  }, [initialized, location.pathname, tenantId, user?.id]);

  return null; // Componente invisível
}
