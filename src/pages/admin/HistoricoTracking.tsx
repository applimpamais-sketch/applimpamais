import { useState } from 'react';
import { MapPin } from 'lucide-react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import PeriodFilter, { type PeriodType } from '@/components/admin/PeriodFilter';
import TrackingKPICards from '@/components/admin/TrackingKPICards';
import TrackingSessionsTable from '@/components/admin/TrackingSessionsTable';
import TecnicoPunctualityChart from '@/components/admin/TecnicoPunctualityChart';
import RouteOptimizerCard from '@/components/admin/RouteOptimizerCard';
import { useTrackingHistory } from '@/hooks/useTrackingHistory';

export default function HistoricoTracking() {
  const [period, setPeriod] = useState<PeriodType>('7dias');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });
  const [tecnicoFilter, setTecnicoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pontualidadeFilter, setPontualidadeFilter] = useState('');

  const { data, isLoading } = useTrackingHistory(period, customRange, tecnicoFilter || undefined);

  return (
    <AdminContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Histórico de Rastreamento"
          description="Acompanhe trajetos e pontualidade dos técnicos"
          icon={MapPin}
        />
        
        <PeriodFilter
          value={period}
          onChange={setPeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {/* KPI Cards */}
      <TrackingKPICards metrics={data?.metrics} isLoading={isLoading} />

      {/* Route Optimizer and Punctuality Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RouteOptimizerCard />
        <TecnicoPunctualityChart
          data={data?.tecnicosPunctuality || []}
          isLoading={isLoading}
        />
      </div>

      {/* Sessions Table - full width */}
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Sessões de Rastreamento</h2>
        <TrackingSessionsTable
          sessions={data?.sessions || []}
          isLoading={isLoading}
          tecnicoFilter={tecnicoFilter}
          onTecnicoFilterChange={setTecnicoFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          pontualidadeFilter={pontualidadeFilter}
          onPontualidadeFilterChange={setPontualidadeFilter}
        />
      </div>
    </AdminContainer>
  );
}
