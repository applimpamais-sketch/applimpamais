import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PixelEvent {
  id: string;
  type: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';
  timestamp: string;
  value?: number;
  product?: string;
}

export interface PixelStats {
  pageViews: number;
  addToCart: number;
  initiateCheckout: number;
  purchases: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  totalRevenue: number;
}

export interface PixelTrendData {
  date: string;
  PageView: number;
  AddToCart: number;
  InitiateCheckout: number;
  Purchase: number;
}

import type { PeriodType } from '@/components/admin/PeriodFilter';
export const usePixelStats = (
  period: PeriodType = '7dias',
  customRange?: { start: Date; end: Date }
) => {
  const [stats, setStats] = useState<PixelStats | null>(null);
  const [events, setEvents] = useState<PixelEvent[]>([]);
  const [trendData, setTrendData] = useState<PixelTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchPixelStats = async () => {
    setLoading(true);
    setError(null);

    try {
      let periodParam: '24h' | '7d' | '30d' = '7d';
      
      // Mapear PeriodType para formato esperado pela edge function
      if (period === 'hoje') periodParam = '24h';
      else if (period === '7dias') periodParam = '7d';
      else if (period === 'mes') periodParam = '30d';
      else if (period === 'ontem') periodParam = '24h';
      else periodParam = '7d';

      // Debug removed for production

      const { data, error: invokeError } = await supabase.functions.invoke('facebook-pixel-stats', {
        body: { period: periodParam },
      });

      if (invokeError) {
        throw invokeError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Debug removed for production

      setStats(data.stats);
      setEvents(data.events || []);
      setTrendData(data.trendData || []);
      setLastUpdate(data.lastUpdate || new Date().toISOString());
    } catch (err: any) {
      console.error('Error fetching pixel stats:', err);
      setError(err.message || 'Erro ao buscar estatísticas do Pixel');
      
      // Definir dados vazios em caso de erro
      setStats({
        pageViews: 0,
        addToCart: 0,
        initiateCheckout: 0,
        purchases: 0,
        conversionRate: 0,
        cartAbandonmentRate: 0,
        totalRevenue: 0,
      });
      setEvents([]);
      setTrendData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPixelStats();
  }, [period]);

  return { 
    stats, 
    events, 
    trendData, 
    loading, 
    error,
    lastUpdate,
    refetch: fetchPixelStats 
  };
};
