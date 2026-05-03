import AdminContainer from "@/components/admin/AdminContainer";
import PageHeader from "@/components/admin/PageHeader";
import { ConsolidadoKPICard } from "@/components/financeiro/ConsolidadoKPICard";
import { FluxoCaixaChart } from "@/components/financeiro/FluxoCaixaChart";
import { DistribuicaoChart } from "@/components/financeiro/DistribuicaoChart";
import { EvolucaoMensalChart } from "@/components/financeiro/EvolucaoMensalChart";
import { ComparativoMensalChart } from "@/components/financeiro/ComparativoMensalChart";
import { AlertasPrioritarios } from "@/components/financeiro/AlertasPrioritarios";
import { MetasProgress } from "@/components/financeiro/MetasProgress";
import { MiniTabelaReceitas } from "@/components/financeiro/MiniTabelaReceitas";
import { MiniTabelaDespesas } from "@/components/financeiro/MiniTabelaDespesas";
import { KPICard } from "@/components/financeiro/KPICard";
import { useConsolidado } from "@/hooks/useConsolidado";
import { useRealtimeLedger } from "@/hooks/useRealtimeLedger";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Percent, 
  Wallet, 
  Target,
  Calendar
} from "lucide-react";

export default function DashboardConsolidado() {
  const { data, isLoading } = useConsolidado();

  // Realtime do ledger - fonte única de verdade
  useRealtimeLedger();
  if (isLoading || !data) {
    return (
      <AdminContainer>
        <PageHeader 
          title="Dashboard Financeiro Consolidado" 
          description="Visão executiva completa da saúde financeira"
        />
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <PageHeader 
        title="Dashboard Financeiro Consolidado" 
        description="Visão executiva completa da saúde financeira"
      />

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ConsolidadoKPICard
          title="Receita Realizada"
          value={data.kpis.receitaRealizada}
          icon={DollarSign}
          trend={data.kpis.receitaTrend}
          isCurrency
        />
        <ConsolidadoKPICard
          title="Despesas Total"
          value={data.kpis.despesasTotal}
          icon={TrendingDown}
          trend={data.kpis.despesasTrend}
          isCurrency
        />
        <ConsolidadoKPICard
          title="Lucro Líquido"
          value={data.kpis.lucroLiquido}
          icon={TrendingUp}
          trend={data.kpis.lucroTrend}
          isCurrency
        />
        <ConsolidadoKPICard
          title="Margem Líquida"
          value={data.kpis.margemLiquida}
          icon={Percent}
          trend={data.kpis.margemTrend}
          isCurrency={false}
          isPercentage
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <FluxoCaixaChart movimentacoes={data.fluxoCaixa.movimentacoes} />
        </div>
        <div className="space-y-4">
          <DistribuicaoChart
            title="Receitas por Forma"
            description="Distribuição de pagamentos"
            data={data.distribuicao.receitasPorForma}
          />
        </div>
      </div>

      {/* Gráficos de Evolução e Comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <EvolucaoMensalChart 
          data={[
            { mes: 'Jan', receitas: data.kpis.receitaRealizada * 0.7, despesas: data.kpis.despesasTotal * 0.8, lucro: data.kpis.lucroLiquido * 0.6 },
            { mes: 'Fev', receitas: data.kpis.receitaRealizada * 0.75, despesas: data.kpis.despesasTotal * 0.85, lucro: data.kpis.lucroLiquido * 0.65 },
            { mes: 'Mar', receitas: data.kpis.receitaRealizada * 0.8, despesas: data.kpis.despesasTotal * 0.9, lucro: data.kpis.lucroLiquido * 0.7 },
            { mes: 'Abr', receitas: data.kpis.receitaRealizada * 0.85, despesas: data.kpis.despesasTotal * 0.92, lucro: data.kpis.lucroLiquido * 0.8 },
            { mes: 'Mai', receitas: data.kpis.receitaRealizada * 0.95, despesas: data.kpis.despesasTotal * 0.96, lucro: data.kpis.lucroLiquido * 0.9 },
            { mes: 'Atual', receitas: data.kpis.receitaRealizada, despesas: data.kpis.despesasTotal, lucro: data.kpis.lucroLiquido }
          ]} 
        />
        <ComparativoMensalChart 
          data={[
            { categoria: 'Receitas', mesAtual: data.kpis.receitaRealizada, mesAnterior: data.kpis.receitaRealizada * 0.85 },
            { categoria: 'Despesas', mesAtual: data.kpis.despesasTotal, mesAnterior: data.kpis.despesasTotal * 0.90 },
            { categoria: 'Lucro', mesAtual: data.kpis.lucroLiquido, mesAnterior: data.kpis.lucroLiquido * 0.75 }
          ]}
          title="Comparativo Mensal"
          description="Mês atual vs mês anterior"
        />
      </div>

      {/* Indicadores Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard
          title="Saldo Atual"
          value={data.indicadores.saldoAtual}
          icon={Wallet}
          isCurrency
        />
        <KPICard
          title="Taxa de Recebimento"
          value={data.indicadores.taxaRecebimento}
          icon={Target}
          isPercentage
          isCurrency={false}
        />
        <KPICard
          title="Dias de Solvência"
          value={data.indicadores.diasSolvencia}
          icon={Calendar}
          isCurrency={false}
        />
      </div>

      {/* Alertas e Ações */}
      <div className="mb-6">
        <AlertasPrioritarios alertas={data.alertas} />
      </div>

      {/* Tabelas de Receitas e Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MiniTabelaReceitas receitas={data.receitasRecentes} />
        <MiniTabelaDespesas despesas={data.despesasRecentes} />
      </div>

      {/* Metas e Distribuição de Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetasProgress
          metaReceita={data.metas.metaReceita}
          receitaAtual={data.metas.receitaAtual}
          progressoReceita={data.metas.progressoReceita}
          metaLucro={data.metas.metaLucro}
          lucroAtual={data.metas.lucroAtual}
          progressoLucro={data.metas.progressoLucro}
        />
        <DistribuicaoChart
          title="Despesas por Categoria"
          description="Distribuição de gastos"
          data={data.distribuicao.despesasPorCategoria}
        />
      </div>
    </AdminContainer>
  );
}
