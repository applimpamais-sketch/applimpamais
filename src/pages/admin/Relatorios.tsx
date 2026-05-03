import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { User, Users, MapPin } from 'lucide-react';
import AdminContainer from '@/components/admin/AdminContainer';
import { ModernDonutChart } from '@/components/charts/ModernDonutChart';
import { useRealtimeRelatorios } from '@/hooks/useRealtimeRelatorios';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface BairroStats {
  bairro: string;
  quantidade: number;
  receita: number;
  concluidos: number;
}

interface ItemStats {
  nome: string;
  quantidade: number;
  valorTotal: number;
}

interface GeneroStats {
  masculino: { quantidade: number; receita: number };
  feminino: { quantidade: number; receita: number };
  nao_identificado: { quantidade: number; receita: number };
}

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [bairros, setBairros] = useState<BairroStats[]>([]);
  const [itens, setItens] = useState<ItemStats[]>([]);
  const [generoStats, setGeneroStats] = useState<GeneroStats | null>(null);

  const loadRelatorios = useCallback(async () => {
    try {
      setLoading(true);
      const { data: agendamentosData } = await supabase
        .from('agendamentos')
        .select('*');

      if (!agendamentosData) return;

      // Relatório de Bairros
      const bairrosMap: Record<string, BairroStats> = {};
      
      agendamentosData.forEach((agendamento: any) => {
        const bairro = agendamento.bairro || 'Não informado';
        
        if (!bairrosMap[bairro]) {
          bairrosMap[bairro] = {
            bairro,
            quantidade: 0,
            receita: 0,
            concluidos: 0,
          };
        }
        
        bairrosMap[bairro].quantidade += 1;
        bairrosMap[bairro].receita += Number(agendamento.valor_total || 0);
        
        if (agendamento.status === 'concluido') {
          bairrosMap[bairro].concluidos += 1;
        }
      });

      const bairrosArray = Object.values(bairrosMap)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      setBairros(bairrosArray);

      // Relatório de Itens
      const itensMap: Record<string, ItemStats> = {};
      
      agendamentosData.forEach((agendamento: any) => {
        const itens = agendamento.itens_carrinho as any[];
        itens?.forEach((item: any) => {
          const nome = `${item.name || 'Sem nome'}`;
          
          if (!itensMap[nome]) {
            itensMap[nome] = {
              nome,
              quantidade: 0,
              valorTotal: 0,
            };
          }
          
          itensMap[nome].quantidade += item.quantity || 1;
          itensMap[nome].valorTotal += (item.price || 0) * (item.quantity || 1);
        });
      });

      const itensArray = Object.values(itensMap)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      setItens(itensArray);

      // Análise por Gênero
      const genero: GeneroStats = {
        masculino: { quantidade: 0, receita: 0 },
        feminino: { quantidade: 0, receita: 0 },
        nao_identificado: { quantidade: 0, receita: 0 },
      };

      agendamentosData.forEach((agendamento: any) => {
        const generoCliente = agendamento.genero_cliente || 'nao_identificado';
        
        if (genero[generoCliente as keyof GeneroStats]) {
          genero[generoCliente as keyof GeneroStats].quantidade += 1;
          genero[generoCliente as keyof GeneroStats].receita += Number(agendamento.valor_total || 0);
        }
      });

      setGeneroStats(genero);

    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRelatorios();
  }, [loadRelatorios]);

  // Realtime para atualização automática
  useRealtimeRelatorios(loadRelatorios);

  return (
    <AdminContainer>
      {/* Header */}
      <div className="space-y-1 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Análises detalhadas e métricas do negócio</p>
      </div>

      {/* Top 10 Bairros */}
      <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Top 10 Bairros</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Bairros com mais agendamentos</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Carregando...</div>
          ) : bairros.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Sem dados disponíveis</div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table className="min-w-[500px] sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Bairro</TableHead>
                      <TableHead className="text-right text-xs">Total</TableHead>
                      <TableHead className="text-right text-xs hidden sm:table-cell">Concluídos</TableHead>
                      <TableHead className="text-right text-xs">Receita</TableHead>
                      <TableHead className="text-right text-xs hidden md:table-cell">Ticket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bairros.map((bairro, idx) => (
                      <TableRow key={bairro.bairro}>
                        <TableCell className="py-2">
                          <Badge variant="outline" className="text-[10px] sm:text-xs">{idx + 1}º</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm py-2 truncate max-w-[100px] sm:max-w-none">{bairro.bairro}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm py-2">{bairro.quantidade}</TableCell>
                        <TableCell className="text-right py-2 hidden sm:table-cell">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">{bairro.concluidos}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs sm:text-sm py-2">
                          {formatCurrency(bairro.receita)}
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm py-2 hidden md:table-cell">
                          {formatCurrency(bairro.receita / bairro.quantidade)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 sm:mt-6">
                <ModernDonutChart
                  title="Top 5 Bairros"
                  description="Distribuição de agendamentos"
                  data={bairros.slice(0, 5).map(b => ({
                    name: b.bairro,
                    value: b.quantidade,
                  }))}
                  centerIcon={MapPin}
                  centerText={bairros.slice(0, 5).reduce((sum, b) => sum + b.quantidade, 0).toString()}
                  centerSubtext="agendamentos"
                  colorScheme="blue"
                  showPercentage={false}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Top 10 Itens */}
      <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Top 10 Itens</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Itens mais solicitados</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Carregando...</div>
          ) : itens.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Sem dados disponíveis</div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <Table className="min-w-[400px] sm:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Item</TableHead>
                    <TableHead className="text-right text-xs">Qtd</TableHead>
                    <TableHead className="text-right text-xs">Total</TableHead>
                    <TableHead className="text-right text-xs hidden sm:table-cell">Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item, idx) => (
                    <TableRow key={item.nome}>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">{idx + 1}º</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm py-2 truncate max-w-[120px] sm:max-w-none">{item.nome}</TableCell>
                      <TableCell className="text-right text-xs sm:text-sm py-2">{item.quantidade}</TableCell>
                      <TableCell className="text-right font-semibold text-xs sm:text-sm py-2">
                        {formatCurrency(item.valorTotal)}
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm py-2 hidden sm:table-cell">
                        {formatCurrency(item.valorTotal / item.quantidade)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise por Gênero */}
      <Card className="backdrop-blur-md bg-background/60 rounded-2xl shadow-lg border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Análise por Gênero</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Distribuição por gênero (identificado automaticamente)</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading || !generoStats ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Carregando...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Card className="backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-background/60 border-2 border-blue-500/20 rounded-xl sm:rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">Masculino</span>
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold">{generoStats.masculino.quantidade}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 truncate">
                      {formatCurrency(generoStats.masculino.receita)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-gradient-to-br from-pink-500/10 to-background/60 border-2 border-pink-500/20 rounded-xl sm:rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">Feminino</span>
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold">{generoStats.feminino.quantidade}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 truncate">
                      {formatCurrency(generoStats.feminino.receita)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-gradient-to-br from-gray-500/10 to-background/60 border-2 border-gray-500/20 rounded-xl sm:rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">Não Identificado</span>
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold">{generoStats.nao_identificado.quantidade}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 truncate">
                      {formatCurrency(generoStats.nao_identificado.receita)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { genero: 'Masculino', quantidade: generoStats.masculino.quantidade, receita: generoStats.masculino.receita },
                    { genero: 'Feminino', quantidade: generoStats.feminino.quantidade, receita: generoStats.feminino.receita },
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="genderQuantityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(220, 91%, 60%)" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(220, 91%, 45%)" stopOpacity={0.85} />
                    </linearGradient>
                    <linearGradient id="genderRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(151, 80%, 60%)" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(151, 80%, 45%)" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="0" 
                    stroke="hsl(var(--border))" 
                    opacity={0.08}
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="genero" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--accent)/0.05)', radius: 8 }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 blur-xl rounded-2xl" />
                          <div className="relative backdrop-blur-2xl bg-background/95 border-2 border-primary/20 rounded-2xl p-4 shadow-2xl min-w-[200px]">
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg" />
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              {payload[0].payload.genero}
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Quantidade:</span>{' '}
                                <span className="font-bold">{payload[0].payload.quantidade}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-muted-foreground">Receita:</span>{' '}
                                <span className="font-bold">{formatCurrency(payload[0].payload.receita)}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                  <Bar 
                    yAxisId="left" 
                    dataKey="quantidade" 
                    fill="url(#genderQuantityGradient)" 
                    name="Quantidade" 
                    radius={[12, 12, 0, 0]}
                    maxBarSize={60}
                    className="transition-all duration-300 hover:opacity-90"
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="receita" 
                    fill="url(#genderRevenueGradient)" 
                    name="Receita (R$)" 
                    radius={[12, 12, 0, 0]}
                    maxBarSize={60}
                    className="transition-all duration-300 hover:opacity-90"
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </CardContent>
      </Card>
    </AdminContainer>
  );
}
