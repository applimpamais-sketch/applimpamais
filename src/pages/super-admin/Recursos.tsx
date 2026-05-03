import { RefreshCw, HardDrive, Network, Table2, Rows3, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ResourceGauge } from '@/components/super-admin/ResourceGauge';
import { TableSizeList } from '@/components/super-admin/TableSizeList';
import { AlertsList } from '@/components/super-admin/AlertsList';
import { useDatabaseMetrics } from '@/hooks/useDatabaseMetrics';

function KpiCard({ 
  label, 
  value, 
  icon: Icon, 
  sublabel 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType;
  sublabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {sublabel && <p className="text-xs text-muted-foreground/70">{sublabel}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuperAdminRecursos() {
  const { data: metrics, isLoading, error, refetch, isFetching } = useDatabaseMetrics(false);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p>Erro ao carregar métricas: {error.message}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitoramento de Recursos</h1>
          <p className="text-muted-foreground">
            Acompanhe a saúde e capacidade do banco de dados
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : metrics ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard 
              label="Armazenamento" 
              value={`${metrics.database_size_mb} MB`}
              icon={HardDrive}
              sublabel={`de ${(metrics.estimated_limit_mb / 1024).toFixed(0)} GB`}
            />
            <KpiCard 
              label="Conexões Ativas" 
              value={metrics.active_connections}
              icon={Network}
              sublabel={`máx. ${metrics.max_connections}`}
            />
            <KpiCard 
              label="Tabelas" 
              value={metrics.total_tables}
              icon={Table2}
            />
            <KpiCard 
              label="Total de Linhas" 
              value={metrics.total_rows.toLocaleString('pt-BR')}
              icon={Rows3}
            />
          </div>

          {/* Gauges */}
          <div className="grid md:grid-cols-2 gap-6">
            <ResourceGauge
              label="Armazenamento"
              value={metrics.database_size_mb}
              max={metrics.estimated_limit_mb}
              percent={metrics.storage_percent}
              unit=" MB"
              warningThreshold={80}
              criticalThreshold={95}
            />
            <ResourceGauge
              label="Conexões"
              value={metrics.active_connections}
              max={metrics.max_connections}
              percent={metrics.connections_percent}
              warningThreshold={70}
              criticalThreshold={90}
            />
          </div>

          {/* Multi-tenancy Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Prontidão Multi-Tenant</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {metrics.tables_with_tenant_id} de {metrics.total_tables} tabelas
                </span>
              </div>
              <Progress 
                value={metrics.multi_tenancy_ready_percent} 
                className="h-3"
                indicatorClassName={
                  metrics.multi_tenancy_ready_percent >= 70 
                    ? 'bg-emerald-500' 
                    : metrics.multi_tenancy_ready_percent >= 40 
                      ? 'bg-amber-500' 
                      : 'bg-destructive'
                }
              />
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-muted-foreground">
                  {metrics.multi_tenancy_ready_percent}% das tabelas têm tenant_id
                </span>
                <span className="font-medium text-foreground">
                  Capacidade estimada: ~{metrics.estimated_capacity} empresas
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <AlertsList alerts={metrics.alerts} />

          {/* Largest Tables */}
          <TableSizeList 
            tables={metrics.largest_tables} 
            totalRows={metrics.total_rows} 
          />

          {/* Last Update */}
          <p className="text-xs text-muted-foreground text-center">
            Última atualização: {new Date(metrics.collected_at).toLocaleString('pt-BR')}
          </p>
        </>
      ) : null}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
