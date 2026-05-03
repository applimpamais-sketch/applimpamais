import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckResult {
  id: string;
  instance_type: string;
  instance_id: string | null;
  status: string;
  substatus: string | null;
  latency_ms: number;
  is_healthy: boolean;
  error_message: string | null;
  created_at: string;
}

export function useWhatsAppHealthCheck() {
  const [checks, setChecks] = useState<HealthCheckResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLatestChecks = async () => {
    try {
      // Get latest check for each instance type
      const { data, error } = await supabase
        .from('whatsapp_health_checks' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get only the latest per instance_type
      const latestByType = new Map<string, HealthCheckResult>();
      ((data || []) as any[]).forEach((check: any) => {
        if (!latestByType.has(check.instance_type)) {
          latestByType.set(check.instance_type, check as HealthCheckResult);
        }
      });

      setChecks(Array.from(latestByType.values()));
    } catch (error) {
      console.error('Erro ao buscar health checks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestChecks();

    // Listen for realtime updates
    const channel = supabase
      .channel('whatsapp-health-checks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_health_checks',
        },
        () => {
          fetchLatestChecks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const runManualCheck = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('health-check-whatsapp');
      if (error) throw error;
      await fetchLatestChecks();
    } catch (error) {
      console.error('Erro ao executar health check:', error);
    } finally {
      setLoading(false);
    }
  };

  const allHealthy = checks.length > 0 && checks.every(c => c.is_healthy);
  const anyUnhealthy = checks.some(c => !c.is_healthy);

  return {
    checks,
    loading,
    allHealthy,
    anyUnhealthy,
    runManualCheck,
    refresh: fetchLatestChecks,
  };
}
