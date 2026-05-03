import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TableInfo {
  table_name: string;
  row_count: number;
  size_mb: number;
}

export interface Alert {
  type: 'warning' | 'critical';
  message: string;
}

export interface DatabaseMetrics {
  // Storage
  database_size_mb: number;
  estimated_limit_mb: number;
  storage_percent: number;
  
  // Connections
  active_connections: number;
  max_connections: number;
  connections_percent: number;
  
  // Tables
  total_tables: number;
  total_rows: number;
  largest_tables: TableInfo[];
  
  // Multi-tenancy
  tables_with_tenant_id: number;
  tables_without_tenant_id: number;
  multi_tenancy_ready_percent: number;
  
  // Capacity
  current_tenants: number;
  estimated_capacity: number;
  
  // Alerts
  alerts: Alert[];
  
  // Metadata
  collected_at: string;
}

async function fetchDatabaseMetrics(): Promise<DatabaseMetrics> {
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (!sessionData?.session?.access_token) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.functions.invoke('database-metrics', {
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
  });

  if (error) {
    console.error('Error fetching database metrics:', error);
    throw new Error(error.message || 'Failed to fetch database metrics');
  }

  return data as DatabaseMetrics;
}

export function useDatabaseMetrics(autoRefresh = false) {
  return useQuery({
    queryKey: ['database-metrics'],
    queryFn: fetchDatabaseMetrics,
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds if auto-refresh enabled
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 2,
  });
}
