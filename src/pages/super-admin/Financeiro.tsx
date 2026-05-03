import { useSaasMetrics } from '@/hooks/useSaasMetrics';
import { useTenants } from '@/hooks/useTenants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';
import { MRRChart } from '@/components/super-admin/MRRChart';
import { PlanDistributionChart } from '@/components/super-admin/PlanDistributionChart';
import { Skeleton } from '@/components/ui/skeleton';

export default function Financeiro() {
  const { metrics, mrrHistorico, churnRate, isLoading } = useSaasMetrics();
  const { tenants, isLoading: tenantsLoading } = useTenants();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calcular métricas financeiras
  const mrrAtual = metrics.mrr;
  const arrProjected = mrrAtual * 12;
  const ltv = mrrAtual * 12; // Simplificado: assume 12 meses de vida média
  const clientesAtivos = metrics.clientes_ativos;
  const arpu = clientesAtivos > 0 ? mrrAtual / clientesAtivos : 0;

  // Trials que podem converter
  const potentialMRR = tenants
    .filter(t => t.status === 'trial')
    .reduce((acc, t) => acc + t.valor_mensal, 0);

  const financialKpis = [
    {
      title: 'MRR Atual',
      value: formatCurrency(mrrAtual),
      change: '+12% vs mês anterior',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'ARR Projetado',
      value: formatCurrency(arrProjected),
      subtitle: 'Receita anual recorrente',
      icon: TrendingUp,
    },
    {
      title: 'ARPU',
      value: formatCurrency(arpu),
      subtitle: 'Receita média por cliente',
      icon: Users,
    },
    {
      title: 'Pipeline Trial',
      value: formatCurrency(potentialMRR),
      subtitle: `${metrics.clientes_trial} trials ativos`,
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro SaaS</h1>
        <p className="text-muted-foreground">Métricas de receita e crescimento</p>
      </div>

      {/* Financial KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financialKpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  {kpi.change && (
                    <p className={`text-xs flex items-center gap-1 ${
                      kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.changeType === 'positive' ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {kpi.change}
                    </p>
                  )}
                  {kpi.subtitle && (
                    <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do MRR</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <MRRChart data={mrrHistorico} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <PlanDistributionChart
                starter={metrics.mrr_starter}
                professional={metrics.mrr_professional}
                enterprise={metrics.mrr_enterprise}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold ${
                Number(churnRate) > 5 ? 'text-red-600' : 
                Number(churnRate) > 2 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {churnRate}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics.churn_mes} cancelamento(s) este mês
              </p>
              <Badge 
                variant="outline" 
                className={`mt-3 ${
                  Number(churnRate) <= 2 ? 'bg-green-100 text-green-800' :
                  Number(churnRate) <= 5 ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {Number(churnRate) <= 2 ? 'Excelente' :
                 Number(churnRate) <= 5 ? 'Aceitável' : 'Atenção'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Conversão Trial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {metrics.total_tenants > 0 
                  ? ((metrics.clientes_ativos / metrics.total_tenants) * 100).toFixed(0)
                  : 0}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics.clientes_ativos} ativos de {metrics.total_tenants} total
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium">{metrics.trials_expirando}</span> trials expirando em 7 dias
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saúde Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Inadimplentes</span>
                <Badge variant={metrics.clientes_inadimplentes > 0 ? 'destructive' : 'outline'}>
                  {metrics.clientes_inadimplentes}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pausados</span>
                <Badge variant="outline">
                  {tenants.filter(t => t.status === 'pausado').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cancelados (mês)</span>
                <Badge variant={metrics.churn_mes > 0 ? 'secondary' : 'outline'}>
                  {metrics.churn_mes}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { plano: 'Starter', mrr: metrics.mrr_starter, clientes: tenants.filter(t => t.plano === 'starter' && t.status === 'ativo').length, cor: 'bg-blue-500' },
              { plano: 'Professional', mrr: metrics.mrr_professional, clientes: tenants.filter(t => t.plano === 'professional' && t.status === 'ativo').length, cor: 'bg-violet-500' },
              { plano: 'Enterprise', mrr: metrics.mrr_enterprise, clientes: tenants.filter(t => t.plano === 'enterprise' && t.status === 'ativo').length, cor: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.plano} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${item.cor}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{item.plano}</span>
                    <span className="font-bold">{formatCurrency(item.mrr)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{item.clientes} cliente(s)</span>
                    <span>{mrrAtual > 0 ? ((item.mrr / mrrAtual) * 100).toFixed(0) : 0}% do MRR</span>
                  </div>
                  <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.cor}`}
                      style={{ width: `${mrrAtual > 0 ? (item.mrr / mrrAtual) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
