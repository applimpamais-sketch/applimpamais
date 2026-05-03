import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export interface PushStats {
  totalDispositivos: number;
  dispositivosAtivos: number;
  taxaEntrega: number;
  notificacoesEnviadas: number;
  porDispositivo: {
    android: number;
    ios: number;
    desktop: number;
  };
  historicoEnvios: Array<{
    data: string;
    total: number;
    sucesso: number;
    falha: number;
  }>;
  logsRecentes: Array<{
    id: string;
    tipo_evento: string;
    total_destinatarios: number;
    enviados_sucesso: number;
    enviados_falha: number;
    titulo: string;
    created_at: string;
  }>;
}

import type { PeriodType } from '@/components/admin/PeriodFilter';
import { usePeriodDateRange } from './usePeriodDateRange';

export function usePushStats(
  period: PeriodType = '7dias',
  customRange?: { start: Date; end: Date }
) {
  return useQuery({
    queryKey: ['push-stats', period, customRange],
    queryFn: async () => {
      const dateRange = usePeriodDateRange(period, customRange);
      
      const dataInicio = dateRange 
        ? startOfDay(dateRange.start)
        : startOfDay(subDays(new Date(), 7)); // Fallback para 7 dias
      
      const dataFim = dateRange 
        ? endOfDay(dateRange.end)
        : endOfDay(new Date());

      // Total de dispositivos inscritos
      const { count: totalDispositivos } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Dispositivos ativos (últimas 24h)
      const { count: dispositivosAtivos } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true)
        .gte('ultimo_uso', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Logs do período
      const { data: logs, error: logsError } = await supabase
        .from('push_notifications_log')
        .select('*')
        .gte('created_at', dataInicio.toISOString())
        .lte('created_at', dataFim.toISOString())
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Calcular estatísticas
      const totalEnviados = logs?.reduce((acc, log) => acc + log.total_destinatarios, 0) || 0;
      const totalSucesso = logs?.reduce((acc, log) => acc + log.enviados_sucesso, 0) || 0;
      const totalFalhas = logs?.reduce((acc, log) => acc + log.enviados_falha, 0) || 0;
      
      const taxaEntrega = totalEnviados > 0 ? (totalSucesso / totalEnviados) * 100 : 0;

      // Estatísticas por dispositivo
      const androidTotal = logs?.reduce((acc, log) => acc + log.enviados_android, 0) || 0;
      const iosTotal = logs?.reduce((acc, log) => acc + log.enviados_ios, 0) || 0;
      const desktopTotal = logs?.reduce((acc, log) => acc + log.enviados_desktop, 0) || 0;

      // Agrupar por data para o gráfico
      const logsMap = new Map<string, { sucesso: number; falha: number }>();
      
      logs?.forEach(log => {
        const data = format(new Date(log.created_at), 'yyyy-MM-dd');
        const existing = logsMap.get(data) || { sucesso: 0, falha: 0 };
        logsMap.set(data, {
          sucesso: existing.sucesso + log.enviados_sucesso,
          falha: existing.falha + log.enviados_falha
        });
      });

      const historicoEnvios = Array.from(logsMap.entries()).map(([data, stats]) => ({
        data,
        total: stats.sucesso + stats.falha,
        sucesso: stats.sucesso,
        falha: stats.falha
      })).sort((a, b) => a.data.localeCompare(b.data));

      const stats: PushStats = {
        totalDispositivos: totalDispositivos || 0,
        dispositivosAtivos: dispositivosAtivos || 0,
        taxaEntrega: Math.round(taxaEntrega * 10) / 10,
        notificacoesEnviadas: totalEnviados,
        porDispositivo: {
          android: androidTotal,
          ios: iosTotal,
          desktop: desktopTotal
        },
        historicoEnvios,
        logsRecentes: logs?.slice(0, 20) || []
      };

      return stats;
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });
}
