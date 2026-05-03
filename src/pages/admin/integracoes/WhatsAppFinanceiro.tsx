import { useState } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWhatsAppFinanceiro, useWhatsAppFinanceiroStats } from '@/hooks/useWhatsAppFinanceiro';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { MessageCircle, Image, Mic, CheckCircle, XCircle, Clock, ShieldAlert, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

const CATEGORIAS_DESPESAS = [
  { value: 'produtos_insumos', label: 'Produtos e Insumos' },
  { value: 'equipamentos', label: 'Equipamentos e Ferramentas' },
  { value: 'marketing', label: 'Marketing e Publicidade' },
  { value: 'salarios', label: 'Salários e Comissões' },
  { value: 'fixas', label: 'Despesas Fixas' },
  { value: 'combustivel', label: 'Combustível e Transporte' },
  { value: 'impostos', label: 'Impostos e Taxas' },
  { value: 'outras', label: 'Outras Despesas' }
];

const CATEGORIAS_RECEITAS = [
  { value: 'servicos_limpeza', label: 'Serviços de Limpeza' },
  { value: 'servicos_impermeabilizacao', label: 'Serviços de Impermeabilização' },
  { value: 'aluguel_equipamentos', label: 'Aluguel de Equipamentos' },
  { value: 'venda_produtos', label: 'Venda de Produtos' },
  { value: 'outros_servicos', label: 'Outros Serviços' }
];

function getCategoriaLabel(categoria: string, tipo: 'despesa' | 'receita'): string {
  const categorias = tipo === 'despesa' ? CATEGORIAS_DESPESAS : CATEGORIAS_RECEITAS;
  const found = categorias.find(c => c.value === categoria);
  return found?.label || categoria;
}

export default function WhatsAppFinanceiro() {
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'despesa' | 'receita'>('todos');
  
  const { data: logs = [], isLoading } = useWhatsAppFinanceiro(
    filtroAtivo === 'todos' ? undefined : filtroAtivo
  );
  const { data: stats, isLoading: isLoadingStats } = useWhatsAppFinanceiroStats(
    filtroAtivo === 'todos' ? undefined : filtroAtivo
  );

  const getTipoIcon = (tipo: string) => {
    switch(tipo) {
      case 'texto': return <MessageCircle className="h-4 w-4" />;
      case 'imagem': return <Image className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'sucesso':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> Sucesso</Badge>;
      case 'erro':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Erro</Badge>;
      case 'processando':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Processando</Badge>;
      case 'nao_autorizado':
        return <Badge variant="outline" className="gap-1"><ShieldAlert className="h-3 w-3" /> Não Autorizado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTipoLancamentoBadge = (tipo: string | null) => {
    if (!tipo) return null;
    
    return tipo === 'despesa' 
      ? <Badge variant="destructive" className="gap-1"><TrendingDown className="h-3 w-3" /> Despesa</Badge>
      : <Badge variant="default" className="gap-1 bg-green-600"><TrendingUp className="h-3 w-3" /> Receita</Badge>;
  };

  if (isLoading || isLoadingStats) {
    return (
      <AdminContainer>
        <LoadingSpinner />
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <PageHeader
        title="Gestão Financeira via WhatsApp"
        subtitle="Registre despesas e receitas automaticamente através de mensagens no WhatsApp"
      />

      {/* Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processado</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Todas as mensagens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.valorTotalDespesas || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{stats?.despesas || 0} lançamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.valorTotalReceitas || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{stats?.receitas || 0} lançamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (stats?.valorTotalReceitas || 0) - (stats?.valorTotalDespesas || 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatCurrency((stats?.valorTotalReceitas || 0) - (stats?.valorTotalDespesas || 0))}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert com Webhook URL */}
      <Alert className="mb-6">
        <AlertDescription>
          <strong>Webhook URL para UltraMsg:</strong><br/>
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {import.meta.env.VITE_SUPABASE_URL}/functions/v1/receive-whatsapp-webhook
          </code>
        </AlertDescription>
      </Alert>

      {/* Tabs de Filtros */}
      <Tabs value={filtroAtivo} onValueChange={(v) => setFiltroAtivo(v as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="despesa">Despesas</TabsTrigger>
          <TabsTrigger value="receita">Receitas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
          <CardDescription>
            Acompanhe todas as mensagens processadas e seus status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Remetente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Lançamento</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Análise IA</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.telefone_remetente.replace('@c.us', '')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTipoIcon(log.tipo_mensagem)}
                          <span className="capitalize">{log.tipo_mensagem}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTipoLancamentoBadge(log.tipo_lancamento)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm">
                          {log.conteudo_original || log.transcricao_ia || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.analise_ia ? (
                          <div className="text-sm space-y-1">
                            <div className="font-semibold">
                              {formatCurrency((log.analise_ia as any).valor || 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(log.analise_ia as any).descricao}
                            </div>
                            <div className="text-xs">
                              <Badge variant="outline" className="text-xs">
                                {getCategoriaLabel(
                                  (log.analise_ia as any).categoria, 
                                  log.tipo_lancamento || 'despesa'
                                )}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Confiança: {(log.analise_ia as any).confianca}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(log.processamento_status)}
                          {log.erro_mensagem && (
                            <div className="text-xs text-red-600">
                              {log.erro_mensagem}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminContainer>
  );
}
