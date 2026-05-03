import { Link } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  MousePointerClick, 
  DollarSign,
  Link2,
  ArrowUpRight,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useParceiro } from '@/hooks/useParceiro';
import { useParceiroLinks } from '@/hooks/useParceiroLinks';
import { useParceiroConversoes } from '@/hooks/useParceiroConversoes';
import { cn } from '@/lib/utils';
import ComandosWhatsAppCard from '@/components/shared/ComandosWhatsAppCard';

export default function ParceiroDashboard() {
  const { parceiro } = useParceiro();
  const { links, totalConversoes, totalReceita } = useParceiroLinks();
  const { conversoes, totalAprovada } = useParceiroConversoes();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Total de cliques vem direto do parceiro (inclui link principal + links campanha)
  const totalCliques = parceiro?.total_cliques || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/p/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Conversões aprovadas/pagas (dados reais)
  const conversoesAprovadas = conversoes.filter(c => 
    c.status === 'aprovada' || c.status === 'paga'
  );
  const totalConversoesReal = conversoesAprovadas.length;
  const totalReceitaReal = conversoesAprovadas.reduce(
    (acc, c) => acc + (c.valor_agendamento || 0), 0
  );

  // Taxa baseada em cliques totais vs conversões reais
  const conversaoRate = totalCliques > 0 
    ? ((totalConversoesReal / totalCliques) * 100).toFixed(1) 
    : '0';

  const recentConversoes = conversoes.slice(0, 5);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe suas indicações e comissões
        </p>
      </div>

      {/* Status Alert - apenas para pendente */}
      {parceiro?.status === 'pendente' && (
        <div className="p-3 sm:p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
          <p className="font-medium">⏳ Seu cadastro está em análise</p>
          <p className="text-sm">
            Assim que for aprovado, você poderá gerar links e começar a ganhar comissões.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-1">
              <Wallet className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-xs">Disponível</Badge>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-2 truncate">
              {formatCurrency(parceiro?.saldo_disponivel || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Saldo para saque</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-2 truncate">
              {formatCurrency(parceiro?.total_ganhos || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total ganho</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-2">{totalConversoesReal}</p>
            <p className="text-xs text-muted-foreground">Conversões</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <MousePointerClick className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-2">{totalCliques}</p>
            <p className="text-xs text-muted-foreground">Cliques</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Conversions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversões Recentes</CardTitle>
              <Link to="/parceiro/conversoes">
                <Button variant="ghost" size="sm">
                  Ver todas <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentConversoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma conversão ainda</p>
                <p className="text-xs">Compartilhe seu link para começar!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentConversoes.map((conversao) => (
                  <div 
                    key={conversao.id} 
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {conversao.agendamento?.nome_cliente || 'Cliente'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conversao.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary">
                        +{formatCurrency(conversao.valor_comissao)}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          conversao.status === 'aprovada' && "bg-green-50 text-green-700 border-green-200",
                          conversao.status === 'pendente' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                          conversao.status === 'paga' && "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {conversao.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Links */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Meus Links</CardTitle>
              <Link to="/parceiro/links">
                <Button variant="ghost" size="sm">
                  Gerenciar <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Link principal */}
            <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-sm font-medium">Link Principal</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(parceiro?.codigo_referencia || '')}
                >
                  {copiedLink === parceiro?.codigo_referencia ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <code className="text-xs bg-background px-2 py-1 rounded block truncate break-all">
                {window.location.origin}/p/{parceiro?.codigo_referencia}
              </code>
            </div>

            {/* Other links */}
            {links.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Crie links para campanhas específicas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {links.slice(0, 3).map((link) => (
                  <div 
                    key={link.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-muted/50 text-sm gap-1 sm:gap-2"
                  >
                    <div className="truncate flex-1">
                      <span className="font-mono">/p/{link.codigo}</span>
                      {link.nome_campanha && (
                        <span className="text-muted-foreground ml-2">
                          ({link.nome_campanha})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{link.cliques} cliques</span>
                      <span>|</span>
                      <span>{link.conversoes} conv.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg sm:text-2xl font-bold text-primary">{conversaoRate}%</p>
              <p className="text-xs text-muted-foreground">Taxa de conversão</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{parceiro?.comissao_percentual || 10}%</p>
              <p className="text-xs text-muted-foreground">Sua comissão</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                {formatCurrency(totalReceitaReal)}
              </p>
              <p className="text-xs text-muted-foreground">Receita gerada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bot WhatsApp Card */}
      <ComandosWhatsAppCard tipo="parceiro" />

      {/* Como Funciona */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-3 sm:p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span> Como funciona?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2 flex-wrap">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 shrink-0">Pendente</Badge>
              <span>Aguardando o serviço ser realizado</span>
            </li>
            <li className="flex items-start gap-2 flex-wrap">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shrink-0">Aprovada</Badge>
              <span>Serviço concluído, comissão liberada para saque</span>
            </li>
            <li className="flex items-start gap-2 flex-wrap">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shrink-0">Paga</Badge>
              <span>Saque realizado com sucesso</span>
            </li>
            <li className="flex items-start gap-2 flex-wrap">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 shrink-0">Cancelada</Badge>
              <span>Agendamento cancelado, sem comissão</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
