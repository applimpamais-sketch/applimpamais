import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';

export function useRealtimeAgendamentos(onUpdate: () => void) {
  const { tenantId } = useTenantContext();
  
  useEffect(() => {
    if (!tenantId) return;
    
    const channel = supabase
      .channel(`agendamentos-realtime-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos',
          filter: `tenant_id=eq.${tenantId}`
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate, tenantId]);
}
