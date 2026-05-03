import { useState } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { MessageSquare, Send, Clock, AlertCircle, CheckCircle2, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCentralMensagens, type MensagemUnificada } from '@/hooks/useCentralMensagens';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

const TIPO_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  checkout: { label: 'Checkout', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: '🛒' },
  pagamento: { label: 'Pagamento', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: '💰' },
  lembrete: { label: 'Lembrete', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: '🔔' },
  avaliacao: { label: 'Avaliação', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: '⭐' },
  carrinho: { label: 'Carrinho', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: '🛒' },
  tecnico: { label: 'Técnico', color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300', icon: '🔧' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  enviado: { label: 'Enviado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  pendente: { label: 'Na fila', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  erro: { label: 'Erro', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
};

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + 
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function timeUntil(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'agora';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function MensagemRow({ msg }: { msg: MensagemUnificada }) {
  const tipo = TIPO_CONFIG[msg.tipo] || TIPO_CONFIG.checkout;
  const status = STATUS_CONFIG[msg.status] || STATUS_CONFIG.pendente;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
      <span className="text-lg flex-shrink-0">{tipo.icon}</span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-foreground text-sm truncate">{msg.destinatario}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${tipo.color}`}>
            {tipo.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{msg.mensagem}</p>
        {msg.telefone && (
          <p className="text-xs text-muted-foreground/70">{msg.telefone}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex items-center gap-1 ${status.color}`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {msg.status === 'pendente' && msg.agendado_para 
            ? `em ${timeUntil(msg.agendado_para)}`
            : formatDate(msg.enviado_em || msg.created_at)}
        </span>
      </div>
    </div>
  );
}

export default function CentralMensagens() {
  const { allMessages, isLoading, metrics, refetch } = useCentralMensagens();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  const filtered = filtroTipo === 'todos' 
    ? allMessages 
    : allMessages.filter(m => m.tipo === filtroTipo || (filtroTipo === 'checkout' && m.tipo === 'pagamento'));

  const pendentes = allMessages.filter(m => m.status === 'pendente');
  const enviados = allMessages.filter(m => m.status === 'enviado');

  if (isLoading) return <AdminContainer><LoadingSpinner /></AdminContainer>;

  return (
    <AdminContainer>
      <PageHeader 
        title="Central de Mensagens" 
        subtitle="Acompanhe todas as mensagens WhatsApp enviadas e na fila"
        icon={MessageSquare}
        actions={
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Send className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Enviados</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalEnviados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Na Fila</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalPendentes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Erros</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalErros}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{allMessages.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Type breakdown */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(metrics.porTipo).map(([tipo, count]) => {
          const config = TIPO_CONFIG[tipo];
          if (!config || count === 0) return null;
          return (
            <Badge key={tipo} variant="outline" className={`${config.color} text-xs`}>
              {config.icon} {config.label}: {count}
            </Badge>
          );
        })}
      </div>

      {/* Tabs: Fila / Histórico */}
      <Tabs defaultValue="fila" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fila" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            Fila ({pendentes.length})
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Enviados ({enviados.length})
          </TabsTrigger>
          <TabsTrigger value="todos" className="gap-1">
            <Filter className="h-3.5 w-3.5" />
            Todos
          </TabsTrigger>
        </TabsList>

        {/* Filter by type */}
        <div className="flex gap-2 flex-wrap">
          {['todos', 'checkout', 'lembrete', 'avaliacao', 'carrinho'].map(tipo => (
            <Button
              key={tipo}
              variant={filtroTipo === tipo ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroTipo(tipo)}
              className="text-xs h-7"
            >
              {tipo === 'todos' ? 'Todos' : (TIPO_CONFIG[tipo]?.icon || '') + ' ' + (TIPO_CONFIG[tipo]?.label || tipo)}
            </Button>
          ))}
        </div>

        <TabsContent value="fila">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Mensagens aguardando envio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendentes.filter(m => filtroTipo === 'todos' || m.tipo === filtroTipo).length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma mensagem na fila</p>
              ) : (
                pendentes
                  .filter(m => filtroTipo === 'todos' || m.tipo === filtroTipo)
                  .map(msg => <MensagemRow key={msg.id} msg={msg} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Mensagens enviadas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {enviados.filter(m => filtroTipo === 'todos' || m.tipo === filtroTipo || (filtroTipo === 'checkout' && m.tipo === 'pagamento')).length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma mensagem enviada</p>
              ) : (
                enviados
                  .filter(m => filtroTipo === 'todos' || m.tipo === filtroTipo || (filtroTipo === 'checkout' && m.tipo === 'pagamento'))
                  .map(msg => <MensagemRow key={msg.id} msg={msg} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todos">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Todas as mensagens
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma mensagem encontrada</p>
              ) : (
                filtered.map(msg => <MensagemRow key={msg.id} msg={msg} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminContainer>
  );
}
