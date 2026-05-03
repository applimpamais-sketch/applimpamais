import { useSaasMetrics } from '@/hooks/useSaasMetrics';
import { useTenants } from '@/hooks/useTenants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Building2, 
  TrendingDown, 
  Clock, 
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MRRChart } from '@/components/super-admin/MRRChart';
import { PlanDistributionChart } from '@/components/super-admin/PlanDistributionChart';
import { TenantCard } from '@/components/super-admin/TenantCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { metrics, mrrHistorico, churnRate, isLoading, refetch } = useSaasMetrics();
  const { tenants, isLoading: tenantsLoading } = useTenants();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const kpis = [
    {
      title: 'MRR',
      value: formatCurrency(metrics.mrr),
      change: '+12%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Clientes Ativos',
      value: metrics.clientes_ativos.toString(),
      change: `+${metrics.clientes_trial} trials`,
      changeType: 'neutral' as const,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Taxa de Churn',
      value: `${churnRate}%`,
      change: metrics.churn_mes > 0 ? `${metrics.churn_mes} este mês` : 'Nenhum',
      changeType: metrics.churn_mes > 0 ? 'negative' as const : 'positive' as const,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Trials Expirando',
      value: metrics.trials_expirando.toString(),
      change: 'Próx. 7 dias',
      changeType: metrics.trials_expirando > 0 ? 'warning' as const : 'neutral' as const,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  // Últimos 5 tenants
  const recentTenants = tenants.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Gestão centralizada de clientes SaaS</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => navigate('/super-admin/novo-tenant')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className={`text-xs flex items-center gap-1 ${
                    kpi.changeType === 'positive' ? 'text-green-600' :
                    kpi.changeType === 'negative' ? 'text-red-600' :
                    kpi.changeType === 'warning' ? 'text-amber-600' :
                    'text-muted-foreground'
                  }`}>
                    {kpi.changeType === 'positive' && <ArrowUpRight className="h-3 w-3" />}
                    {kpi.changeType === 'negative' && <ArrowDownRight className="h-3 w-3" />}
                    {kpi.change}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receita por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <PlanDistributionChart
                starter={metrics.mrr_starter}
                professional={metrics.mrr_professional}
                enterprise={metrics.mrr_enterprise}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de MRR</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <MRRChart data={mrrHistorico} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Empresas Recentes</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/super-admin/tenants')}>
            Ver todas
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {tenantsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentTenants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma empresa cadastrada ainda</p>
              <Button 
                variant="link" 
                onClick={() => navigate('/super-admin/novo-tenant')}
                className="mt-2"
              >
                Adicionar primeiro cliente
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTenants.map((tenant) => (
                <TenantCard 
                  key={tenant.id} 
                  tenant={tenant} 
                  compact 
                  onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {(metrics.trials_expirando > 0 || metrics.clientes_inadimplentes > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">⚠️ Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.trials_expirando > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm">
                  <strong>{metrics.trials_expirando}</strong> trial(s) expirando nos próximos 7 dias
                </span>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                  Ação necessária
                </Badge>
              </div>
            )}
            {metrics.clientes_inadimplentes > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm">
                  <strong>{metrics.clientes_inadimplentes}</strong> cliente(s) inadimplente(s)
                </span>
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  Cobrança pendente
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
