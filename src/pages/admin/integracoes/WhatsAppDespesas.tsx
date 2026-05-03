import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminContainer from "@/components/admin/AdminContainer";
import PageHeader from "@/components/admin/PageHeader";
import { useWhatsAppDespesas, useWhatsAppDespesasStats } from "@/hooks/useWhatsAppDespesas";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import { MessageSquare, Image, Mic, CheckCircle2, XCircle, Clock, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WhatsAppDespesas() {
  const { data: logs, isLoading } = useWhatsAppDespesas();
  const { data: stats } = useWhatsAppDespesasStats();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'texto': return <MessageSquare className="h-4 w-4" />;
      case 'imagem': return <Image className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Processado</Badge>;
      case 'erro':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Erro</Badge>;
      case 'processando':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Despesas via WhatsApp"
        description="Mensagens recebidas e processadas com IA"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Hoje: {stats?.hoje || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.sucesso || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total ? ((stats.sucesso / stats.total) * 100).toFixed(0) : 0}% de sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.valorTotal || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Despesas identificadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Tipo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 text-sm">
              <span>📝 {stats?.porTipo.texto || 0}</span>
              <span>📷 {stats?.porTipo.imagem || 0}</span>
              <span>🎤 {stats?.porTipo.audio || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook URL Info */}
      <Alert className="mb-6">
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">🔗 Configure este webhook no UltraMsg:</p>
            <code className="block bg-muted p-2 rounded text-xs break-all">
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/receive-whatsapp-webhook
            </code>
            <p className="text-xs text-muted-foreground">
              Vá em <strong>Settings → Webhooks</strong> no painel do UltraMsg e adicione esta URL
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
          <CardDescription>
            Todas as mensagens recebidas via WhatsApp para lançamento de despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Análise IA</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.telefone_remetente}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTipoIcon(log.tipo_mensagem)}
                        <span className="text-xs capitalize">{log.tipo_mensagem}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {log.tipo_mensagem === 'texto' && (
                        <p className="text-sm truncate">{log.conteudo_original}</p>
                      )}
                      {log.tipo_mensagem === 'imagem' && (
                        <div>
                          {log.arquivo_url && (
                            <a href={log.arquivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">
                              Ver imagem
                            </a>
                          )}
                          {log.conteudo_original && (
                            <p className="text-xs text-muted-foreground mt-1">{log.conteudo_original}</p>
                          )}
                        </div>
                      )}
                      {log.tipo_mensagem === 'audio' && (
                        <div>
                          {log.arquivo_url && (
                            <a href={log.arquivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">
                              Ouvir áudio
                            </a>
                          )}
                          {log.transcricao_ia && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {log.transcricao_ia}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.analise_ia ? (
                        <div className="text-xs space-y-1">
                          {log.analise_ia.valor && (
                            <div className="font-semibold text-green-600">
                              {formatCurrency(log.analise_ia.valor)}
                            </div>
                          )}
                          {log.analise_ia.descricao && (
                            <div className="text-muted-foreground truncate max-w-[200px]">
                              {log.analise_ia.descricao}
                            </div>
                          )}
                          {log.analise_ia.categoria && (
                            <Badge variant="outline" className="text-xs">
                              {log.analise_ia.categoria}
                            </Badge>
                          )}
                          {log.analise_ia.confianca !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              Confiança: {log.analise_ia.confianca}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.processamento_status)}
                      {log.erro_mensagem && (
                        <p className="text-xs text-red-500 mt-1">{log.erro_mensagem}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma mensagem recebida ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminContainer>
  );
}
