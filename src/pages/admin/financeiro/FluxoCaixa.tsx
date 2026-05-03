import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminContainer from '@/components/admin/AdminContainer';
import PeriodFilter, { type PeriodType } from '@/components/admin/PeriodFilter';
import { KPICard } from '@/components/financeiro/KPICard';
import { FluxoCaixaChart } from '@/components/financeiro/FluxoCaixaChart';
import { ProjecaoCard } from '@/components/financeiro/ProjecaoCard';
import { AlertasPanel } from '@/components/financeiro/AlertasPanel';
import { DRETable } from '@/components/financeiro/DRETable';
import { useFluxoCaixa } from '@/hooks/useFluxoCaixa';
import { useRealtimeLedger } from '@/hooks/useRealtimeLedger';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, Target, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinanceiroFluxoCaixa() {
  const [period, setPeriod] = useState<PeriodType>('mes');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>();
  const { data, isLoading } = useFluxoCaixa({ period, customRange });

  // Realtime do ledger - fonte única de verdade
  useRealtimeLedger();

  return (
    <AdminContainer>
      <PageHeader 
        title="Fluxo de Caixa" 
        description="Análise de entradas, saídas e projeções financeiras"
      />

      {/* Filtro de Período */}
      <div className="flex justify-end mb-6 gap-2" data-tour="fluxo-periodo">
        <PeriodFilter
          value={period}
          onChange={setPeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      ) : data ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div data-tour="fluxo-saldo">
              <KPICard 
                title="Saldo Atual"
                value={data.kpis.saldoAtual}
                icon={Wallet}
                isCurrency
              />
            </div>
            <KPICard
              title="Média de Entradas/dia"
              value={data.kpis.mediaEntradas}
              icon={TrendingUp}
              isCurrency
            />
            <KPICard 
              title="Média de Saídas/dia"
              value={data.kpis.mediaSaidas}
              icon={TrendingDown}
              isCurrency
            />
            <KPICard 
              title="Ponto de Equilíbrio"
              value={data.kpis.pontoEquilibrio}
              icon={Target}
              isCurrency
            />
          </div>
          
          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Gráfico de Fluxo (2 colunas) */}
            <div className="lg:col-span-2" data-tour="fluxo-grafico">
              <FluxoCaixaChart movimentacoes={data.movimentacoes} />
            </div>
            
            {/* Alertas (1 coluna) */}
            <AlertasPanel alertas={data.alertas} />
          </div>
          
          {/* Projeções */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Projeções Futuras</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.projecoes.map(projecao => (
                <ProjecaoCard key={projecao.periodo} {...projecao} />
              ))}
            </div>
          </div>
          
          {/* DRE */}
          <DRETable dre={data.dre} />
        </>
      ) : null}
    </AdminContainer>
  );
}
