import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useTenantContext } from '@/hooks/useTenantContext';

interface UseRealtimeSubscriptionProps {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<any>) => void;
  skipTenantFilter?: boolean; // Para tabelas globais
}

export function useRealtimeSubscription({
  table,
  event = '*',
  schema = 'public',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  skipTenantFilter = false,
}: UseRealtimeSubscriptionProps) {
  const { tenantId } = useTenantContext();
  
  useEffect(() => {
    // Se não tem tenant e não é tabela global, não subscever
    if (!tenantId && !skipTenantFilter) return;
    
    const channelName = `realtime-${table}-${tenantId || 'global'}-${Date.now()}`;
    
    // Construir filtro com tenant_id se aplicável
    let finalFilter = filter;
    if (tenantId && !skipTenantFilter) {
      finalFilter = filter 
        ? `${filter},tenant_id=eq.${tenantId}` 
        : `tenant_id=eq.${tenantId}`;
    }
    
    let subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter: finalFilter,
        } as any,
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`📡 Realtime ${payload.eventType} on ${table}:`, payload);
          
          // Call specific handlers
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload);
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload);
          }
          
          // Call general handler
          if (onChange) {
            onChange(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [table, event, schema, filter, onInsert, onUpdate, onDelete, onChange, tenantId, skipTenantFilter]);
}
