import AdminContainer from "@/components/admin/AdminContainer";
import PageHeader from "@/components/admin/PageHeader";
import { useDashboardFinanceiro } from "@/hooks/useDashboardFinanceiro";
import { KPICard } from "@/components/financeiro/KPICard";
import { EvolucaoChart } from "@/components/financeiro/EvolucaoChart";
import { DistribuicaoChart } from "@/components/financeiro/DistribuicaoChart";
import { HistoricoTransacoes } from "@/components/financeiro/HistoricoTransacoes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, Percent, Lock } from "lucide-react";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { formatCurrency } from "@/utils/format";
import { getCategoriaReceitaInfo } from "@/utils/financeiroHelpers";
import { useTenantLimits } from "@/hooks/useTenantLimits";
import { LockedFeatureBadge } from "@/components/admin/LockedFeatureCard";
import { Badge } from "@/components/ui/badge";

export default function FinanceiroDashboard() {
  const { data, isLoading } = useDashboardFinanceiro();
  const { hasFeature, plano } = useTenantLimits();

  const hasAdvancedReports = hasFeature('relatorios_avancados');
  const isStarter = plano === 'starter';

  if (isLoading || !data) {
    return (
      <AdminContainer>
        <LoadingSpinner />
      </AdminContainer>
    );
  }

  const { kpis, evolucaoMensal, despesasPorCategoria, receitasPorForma, receitasPorCategoria, historicoRecente } = data;

  return (
    <AdminContainer>
      <PageHeader
        title="Dashboard Financeiro"
        description="Visão geral das finanças da empresa"
      />

      {/* KPIs Principais - Sempre visíveis */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div data-tour="kpi-receita-mensal">
          <KPICard
            title="Receita Mensal"
            value={kpis.receitaMesAtual}
            icon={DollarSign}
            trend={kpis.crescimentoReceita}
          />
        </div>
        <div data-tour="kpi-despesa-mensal">
          <KPICard
            title="Despesa Mensal"
            value={kpis.despesaMesAtual}
            icon={TrendingDown}
            trend={kpis.crescimentoDespesa}
          />
        </div>
        <div data-tour="kpi-saldo">
          <KPICard
            title="Saldo"
            value={kpis.saldo}
            icon={TrendingUp}
          />
        </div>
        <KPICard
          title="Margem de Lucro"
          value={kpis.margemLucro}
          icon={Percent}
          isPercentage
          isCurrency={false}
        />
      </div>

      {/* Gráfico de Evolução - Professional+ */}
      {hasAdvancedReports ? (
        <div data-tour="chart-evolucao">
          <EvolucaoChart data={evolucaoMensal} />
        </div>
      ) : (
        <Card className="border-dashed opacity-75">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Gráfico de Evolução Mensal
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visualize a evolução de receitas e despesas ao longo do tempo
              </p>
            </div>
            <LockedFeatureBadge feature="relatorios_avancados" />
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-sm">
              Disponível no plano Professional
            </p>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Transações - Sempre visível */}
      <div data-tour="historico-transacoes">
        <HistoricoTransacoes transacoes={historicoRecente} />
      </div>

      {/* Distribuições - Professional+ */}
      {hasAdvancedReports ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <DistribuicaoChart
              title="Despesas por Categoria"
              description="Distribuição percentual das despesas"
              data={despesasPorCategoria.map(d => ({
                name: d.categoria,
                value: d.valor,
                percentual: d.percentual,
              }))}
            />
            <DistribuicaoChart
              title="Receitas por Forma de Pagamento"
              description="Distribuição percentual das receitas"
              data={receitasPorForma.map(r => ({
                name: r.forma,
                value: r.valor,
                percentual: r.percentual,
              }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DistribuicaoChart
              title="Receitas por Categoria"
              description="Distribuição percentual das receitas por tipo de serviço"
              data={receitasPorCategoria.map(r => ({
                name: getCategoriaReceitaInfo(r.categoria).label,
                value: r.valor,
                percentual: r.percentual,
              }))}
            />
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Total de Receitas</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(kpis.receitaTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <span className="text-sm font-medium text-red-900 dark:text-red-100">Total de Despesas</span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(kpis.despesaTotal)}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Saldo (Receita - Despesa)</span>
                  <span className={`text-lg font-bold ${kpis.saldo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(kpis.saldo)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Relatórios Avançados
              </CardTitle>
              <LockedFeatureBadge feature="relatorios_avancados" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {['Despesas por Categoria', 'Receitas por Forma', 'DRE Automático'].map((item) => (
                <div key={item} className="p-4 bg-muted/30 rounded-lg text-center">
                  <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Faça upgrade para o plano Professional para acessar relatórios completos
            </p>
          </CardContent>
        </Card>
      )}
    </AdminContainer>
  );
}
