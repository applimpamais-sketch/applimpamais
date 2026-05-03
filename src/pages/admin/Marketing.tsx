import PageHeader from '@/components/admin/PageHeader';
import AdminContainer from '@/components/admin/AdminContainer';
import DashboardKPICard from '@/components/admin/DashboardKPICard';
import ConversionFunnelChart from '@/components/admin/ConversionFunnelChart';
import { ModernBarChart } from '@/components/charts/ModernBarChart';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { useMarketingStats } from '@/hooks/useMarketingStats';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  Megaphone,
  BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Marketing() {
  const { data: stats, isLoading } = useMarketingStats();

  if (isLoading) return <LoadingSpinner />;

  const kpis = [
    {
      title: 'Total de Leads',
      value: stats?.totalLeads || 0,
      icon: Users,
      trend: '+12%',
      color: 'text-blue-500',
    },
    {
      title: 'Leads Hoje',
      value: stats?.leadsHoje || 0,
      icon: TrendingUp,
      trend: '+5',
      color: 'text-success',
    },
    {
      title: 'Taxa de Conversão',
      value: `${stats?.taxaConversao.toFixed(1)}%`,
      icon: Target,
      trend: '+2.5%',
      color: 'text-warning',
    },
    {
      title: 'ROI',
      value: `${stats?.roi}%`,
      icon: DollarSign,
      trend: stats?.roi > 0 ? `+${stats?.roi}%` : '0%',
      color: 'text-purple-500',
    },
  ];

  return (
    <AdminContainer>
      <PageHeader 
        title="Marketing" 
        description="Análise de campanhas e conversão"
        icon={Megaphone}
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div data-tour="kpi-leads">
          <DashboardKPICard {...kpis[0]} />
        </div>
        <DashboardKPICard {...kpis[1]} />
        <div data-tour="kpi-taxa-conversao">
          <DashboardKPICard {...kpis[2]} />
        </div>
        <DashboardKPICard {...kpis[3]} />
      </div>

      {/* Funil e Canais */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div data-tour="funil">
          <ConversionFunnelChart data={stats?.funnelData || {
            visitantes: 0,
            carrinhosIniciados: 0,
            carrinhosAbandonados: 0,
            agendamentos: 0,
            pagamentos: 0,
          }} />
        </div>

        <div data-tour="leads-por-canal">
          <ModernBarChart
            title="Leads por Canal"
            description="Origem dos leads no mês atual"
            data={stats?.leadsPorCanal.map(c => ({
              name: c.canal,
              value: c.total,
            })) || []}
            colorScheme="brand"
            formatValue={(value) => `${value} leads`}
            icon={BarChart3}
          />
        </div>
      </div>

      {/* Evolução Mensal */}
      <div className="mb-6">
        <div className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border border-border/50 p-6">
          <h3 className="text-lg font-semibold mb-4">Evolução de Leads e Conversões</h3>
          <p className="text-sm text-muted-foreground mb-6">Últimos 6 meses</p>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.evolucaoMensal || []}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConversoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="mes" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                  name="Leads"
                />
                <Area 
                  type="monotone" 
                  dataKey="conversoes" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorConversoes)"
                  name="Conversões"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminContainer>
  );
}
