import { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParceiroConversoes, ParceiroConversao } from '@/hooks/useParceiroConversoes';
import { cn } from '@/lib/utils';

export default function ParceiroConversoes() {
  const { 
    conversoes, 
    loading, 
    totalPendente, 
    totalAprovada, 
    totalPaga,
    conversoesPorStatus 
  } = useParceiroConversoes();

  const [activeTab, setActiveTab] = useState('todas');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'aprovada':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paga':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'cancelada':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case 'aprovada':
        return "bg-green-50 text-green-700 border-green-200";
      case 'paga':
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 'cancelada':
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "";
    }
  };

  const filteredConversoes = activeTab === 'todas' 
    ? conversoes 
    : conversoesPorStatus[activeTab] || [];

  const renderConversaoCard = (conversao: ParceiroConversao) => (
    <div 
      key={conversao.id}
      className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(conversao.status)}
            <span className="font-medium">
              {conversao.agendamento?.nome_cliente || 'Cliente'}
            </span>
            <Badge variant="outline" className={cn("text-xs", getStatusColor(conversao.status))}>
              {conversao.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(conversao.created_at)}
          </p>
          {conversao.link && (
            <p className="text-xs text-muted-foreground mt-1">
              via /p/{conversao.link.codigo}
              {conversao.link.nome_campanha && ` (${conversao.link.nome_campanha})`}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-primary">
            +{formatCurrency(conversao.valor_comissao)}
          </p>
          <p className="text-xs text-muted-foreground">
            {conversao.comissao_percentual}% de {formatCurrency(conversao.valor_agendamento)}
          </p>
        </div>
      </div>

      {conversao.agendamento && (
        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
          <p>
            Serviço: {conversao.agendamento.data_agendamento ? 
              format(new Date(conversao.agendamento.data_agendamento + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR }) : 
              'Não agendado'}
          </p>
        </div>
      )}

      {conversao.status === 'aprovada' && (
        <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
          ✓ Comissão adicionada ao seu saldo
          {conversao.aprovada_em && ` em ${formatDate(conversao.aprovada_em)}`}
        </div>
      )}

      {conversao.status === 'paga' && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
          ✓ Comissão paga
          {conversao.paga_em && ` em ${formatDate(conversao.paga_em)}`}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Minhas Conversões</h1>
        <p className="text-muted-foreground">
          Acompanhe os agendamentos gerados pelos seus links
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-1">{conversoes.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50/50 border-yellow-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-700">Pendentes</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-1 text-yellow-700 truncate">
              {formatCurrency(totalPendente)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">Aprovadas</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-1 text-green-700 truncate">
              {formatCurrency(totalAprovada)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">Pagas</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-1 text-blue-700 truncate">
              {formatCurrency(totalPaga)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversões List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Histórico</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
              <TabsTrigger value="todas" className="min-w-fit text-xs sm:text-sm">
                Todas ({conversoes.length})
              </TabsTrigger>
              <TabsTrigger value="pendente" className="min-w-fit text-xs sm:text-sm">
                Pendentes ({conversoesPorStatus['pendente']?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="aprovada" className="min-w-fit text-xs sm:text-sm">
                Aprovadas ({conversoesPorStatus['aprovada']?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="paga" className="min-w-fit text-xs sm:text-sm">
                Pagas ({conversoesPorStatus['paga']?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : filteredConversoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conversão {activeTab !== 'todas' ? 'nesta categoria' : 'ainda'}</p>
                  {activeTab === 'todas' && (
                    <p className="text-xs">Compartilhe seu link para começar a ganhar!</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredConversoes.map(renderConversaoCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Como funciona?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Pendente:</strong> Aguardando o serviço ser realizado</li>
            <li>• <strong>Aprovada:</strong> Serviço concluído, comissão liberada para saque</li>
            <li>• <strong>Paga:</strong> Saque realizado com sucesso</li>
            <li>• <strong>Cancelada:</strong> Agendamento cancelado, sem comissão</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
