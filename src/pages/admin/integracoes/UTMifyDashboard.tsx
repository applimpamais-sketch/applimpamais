import { useState } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import DashboardKPICard from '@/components/admin/DashboardKPICard';
import PeriodFilter, { PeriodType } from '@/components/admin/PeriodFilter';
import { useUtmifyDashboard } from '@/hooks/useUtmifyDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Target, Percent, ShoppingCart, AlertCircle, Receipt, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatRoas = (value: number) => `${value.toFixed(2)}x`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export default function UTMifyDashboard() {
  const [period, setPeriod] = useState<PeriodType>('7dias');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | undefined>();

  const { data, isLoading } = useUtmifyDashboard(period, customRange);

  if (isLoading) {
    return (
      <AdminContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
      </AdminContainer>
    );
  }

  if (!data?.isActive) {
    return (
      <AdminContainer>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">UTMify não está ativa</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Configure a integração UTMify em Integrações → UTMify para ver os dados de campanhas aqui.
          </p>
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard UTMify</h1>
          <p className="text-sm text-muted-foreground">Métricas de anúncios e vendas em tempo real</p>
        </div>
        <PeriodFilter
          value={period}
          onChange={setPeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <DashboardKPICard title="Faturamento Líquido" value={formatCurrency(data.faturamentoLiquido)} icon={DollarSign} />
        <DashboardKPICard title="Gastos com Anúncios" value={formatCurrency(data.gastosAnuncios)} icon={Receipt} />
        <DashboardKPICard title="Lucro" value={formatCurrency(data.lucro)} icon={data.lucro >= 0 ? TrendingUp : TrendingDown} />
        <DashboardKPICard title="ROAS" value={formatRoas(data.roas)} icon={Target} />
        <DashboardKPICard title="Margem" value={formatPercent(data.margem)} icon={Percent} />
      </div>

      {/* KPIs Secundários */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPICard title="Ticket Médio (ARPU)" value={formatCurrency(data.arpu)} icon={ShoppingCart} />
        <DashboardKPICard title="Vendas Pendentes" value={formatCurrency(data.vendasPendentes)} icon={AlertCircle} />
        <DashboardKPICard title="CPA" value={formatCurrency(data.cpa)} icon={BarChart3} />
        <DashboardKPICard title="Imposto Meta (~12.5%)" value={formatCurrency(data.impostoMeta)} icon={Receipt} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vendas por Horário */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vendas por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.vendasPorHora}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'valor' ? formatCurrency(value) : value
                    }
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vendas por Plataforma */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vendas por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            {data.vendasPorPlataforma.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Sem dados no período
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.vendasPorPlataforma}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.vendasPorPlataforma.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reembolsos + Totais */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <DashboardKPICard title="Total de Vendas" value={data.totalVendas} icon={ShoppingCart} />
        <DashboardKPICard title="Reembolsos" value={`${data.totalReembolsos} (${formatCurrency(data.valorReembolsos)})`} icon={TrendingDown} />
        <DashboardKPICard title="Campanhas Ativas" value={data.campanhas.length} icon={Target} />
      </div>

      {/* Tabela de Campanhas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Performance por Campanha</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {data.campanhas.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Nenhuma campanha no período selecionado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="text-right">Custo Ads</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                  <TableHead className="text-right">CPA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.campanhas.map((c) => (
                  <TableRow key={c.campanha}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={c.campanha}>
                      {c.campanha}
                    </TableCell>
                    <TableCell className="text-right">{c.vendas}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.valor)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.custo)}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={c.roas >= 1 ? 'text-green-600' : 'text-red-600'}>
                        {formatRoas(c.roas)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(c.cpa)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminContainer>
  );
}
