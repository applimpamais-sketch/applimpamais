import { UserPlus, RotateCcw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/lib/utils';

interface SegmentationData {
  novos: number;
  recorrentes: number;
  percentualNovos: number;
  percentualRecorrentes: number;
  ticketMedioNovos: number;
  ticketMedioRecorrentes: number;
  taxaRecompra: number;
}

interface LiveViewSegmentationProps {
  data: SegmentationData;
  loading?: boolean;
  period?: string;
}

export function LiveViewSegmentation({ data, loading = false, period = '30d' }: LiveViewSegmentationProps) {
  const total = data.novos + data.recorrentes;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Segmentação de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
            </div>
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Segmentação de Clientes</CardTitle>
          <Badge variant="outline" className="text-xs">{period}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum cliente no período
          </p>
        ) : (
          <>
            {/* Cards de segmentação */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Novos */}
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Novos</span>
                </div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {data.percentualNovos.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.novos} clientes
                </p>
                <p className="text-xs text-muted-foreground">
                  Ticket: {formatCurrency(data.ticketMedioNovos)}
                </p>
              </div>

              {/* Recorrentes */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Recorrentes</span>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {data.percentualRecorrentes.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.recorrentes} clientes
                </p>
                <p className="text-xs text-muted-foreground">
                  Ticket: {formatCurrency(data.ticketMedioRecorrentes)}
                </p>
              </div>
            </div>

            {/* Taxa de recompra */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm">Taxa de Recompra</span>
              </div>
              <Badge 
                variant={data.taxaRecompra >= 20 ? "default" : "secondary"}
                className={cn(
                  data.taxaRecompra >= 30 && "bg-green-600 hover:bg-green-700"
                )}
              >
                {data.taxaRecompra.toFixed(1)}%
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
