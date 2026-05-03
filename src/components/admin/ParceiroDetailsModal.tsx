import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Link as LinkIcon,
  MousePointer,
  TrendingUp,
  Instagram,
  Youtube,
  Facebook,
  Wallet,
  CreditCard,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  Percent,
  ExternalLink,
  Copy,
  Check,
  QrCode
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Parceiro {
  id: string;
  user_id: string;
  nome: string;
  nome_exibicao: string | null;
  email: string;
  telefone: string | null;
  documento: string | null;
  tipo: string;
  codigo_referencia: string;
  comissao_percentual: number;
  status: string;
  saldo_disponivel: number;
  total_ganhos: number;
  total_cliques?: number;
  dados_bancarios: Record<string, unknown> | null;
  redes_sociais: Record<string, unknown> | null;
  created_at: string;
  aprovado_em: string | null;
}

interface ParceiroDetailsModalProps {
  parceiro: Parceiro | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ParceiroDetailsModal({ parceiro, open, onOpenChange }: ParceiroDetailsModalProps) {
  const [copiedPix, setCopiedPix] = useState(false);

  // Fetch conversões do parceiro
  const { data: conversoes, isLoading: loadingConversoes } = useQuery({
    queryKey: ['parceiro-conversoes-detail', parceiro?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parceiro_conversoes')
        .select('*, agendamento:agendamentos(nome_cliente, data_agendamento, status)')
        .eq('parceiro_id', parceiro!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!parceiro && open
  });

  // Fetch links do parceiro
  const { data: links, isLoading: loadingLinks } = useQuery({
    queryKey: ['parceiro-links-detail', parceiro?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parceiro_links')
        .select('*')
        .eq('parceiro_id', parceiro!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!parceiro && open
  });

  // Fetch saques do parceiro
  const { data: saques, isLoading: loadingSaques } = useQuery({
    queryKey: ['parceiro-saques-detail', parceiro?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parceiro_saques')
        .select('*')
        .eq('parceiro_id', parceiro!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!parceiro && open
  });

  // Calcular KPIs
  const kpis = useMemo(() => {
    const conv = conversoes || [];
    const lnks = links || [];
    const saq = saques || [];

    // Total de cliques vem do parceiro (inclui link principal + links de campanha)
    const totalCliques = parceiro?.total_cliques || 0;
    // Cliques apenas dos links de campanha (para referência)
    const cliquesLinks = lnks.reduce((sum, l) => sum + (l.cliques || 0), 0);
    
    return {
      // Conversões por status
      conversoesPendentes: conv.filter(c => c.status === 'pendente').length,
      conversoesAprovadas: conv.filter(c => c.status === 'aprovada').length,
      conversoesPagas: conv.filter(c => c.status === 'paga').length,
      conversoesCanceladas: conv.filter(c => c.status === 'cancelada').length,
      
      // Valores por status
      valorPendente: conv.filter(c => c.status === 'pendente').reduce((sum, c) => sum + (c.valor_comissao || 0), 0),
      valorAprovado: conv.filter(c => c.status === 'aprovada').reduce((sum, c) => sum + (c.valor_comissao || 0), 0),
      valorPago: conv.filter(c => c.status === 'paga').reduce((sum, c) => sum + (c.valor_comissao || 0), 0),
      
      // Links
      totalLinks: lnks.length,
      totalCliques,
      cliquesLinks,
      totalConversoes: conv.length,
      taxaConversao: totalCliques > 0 ? ((conv.length / totalCliques) * 100).toFixed(1) : '0',
      
      // Saques
      totalSaques: saq.length,
      saquesPendentes: saq.filter(s => s.status === 'solicitado' || s.status === 'processando').length,
      saquesPagos: saq.filter(s => s.status === 'pago').length,
      valorSaquesPendentes: saq.filter(s => s.status === 'solicitado' || s.status === 'processando').reduce((sum, s) => sum + (s.valor || 0), 0),
      valorSaquesPagos: saq.filter(s => s.status === 'pago').reduce((sum, s) => sum + (s.valor || 0), 0),
    };
  }, [conversoes, links, saques, parceiro]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
      ativo: { variant: 'default', label: 'Ativo' },
      pendente: { variant: 'secondary', label: 'Pendente' },
      suspenso: { variant: 'destructive', label: 'Suspenso' },
      inativo: { variant: 'outline', label: 'Inativo' },
      solicitado: { variant: 'secondary', label: 'Solicitado' },
      processando: { variant: 'secondary', label: 'Processando' },
      pago: { variant: 'default', label: 'Pago', className: 'bg-green-600' },
      paga: { variant: 'default', label: 'Paga', className: 'bg-green-600' },
      rejeitado: { variant: 'destructive', label: 'Rejeitado' },
      aprovada: { variant: 'default', label: 'Aprovada', className: 'bg-blue-600' },
      cancelada: { variant: 'destructive', label: 'Cancelada' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const handleCopyPix = async (chavePix: string) => {
    try {
      await navigator.clipboard.writeText(chavePix);
      setCopiedPix(true);
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopiedPix(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const getTipoChaveLabel = (tipo: string | undefined) => {
    const labels: Record<string, string> = {
      'aleatoria': 'Chave Aleatória',
      'cpf': 'CPF',
      'email': 'E-mail',
      'telefone': 'Telefone',
    };
    return labels[tipo?.toLowerCase() || ''] || 'Chave PIX';
  };

  const formatDadosBancarios = (dados: Record<string, unknown> | null) => {
    if (!dados || Object.keys(dados).length === 0) {
      return <p className="text-muted-foreground text-sm">Não informado</p>;
    }

    const chavePix = dados.chave_pix ? String(dados.chave_pix) : null;
    const tipoChave = dados.tipo_chave_pix ? String(dados.tipo_chave_pix) : null;
    
    return (
      <div className="space-y-4">
        {chavePix && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border">
              <QRCodeSVG 
                value={chavePix} 
                size={140} 
                level="H"
                includeMargin={true}
              />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <QrCode className="h-3 w-3" />
                <span>Escaneie para pagar</span>
              </div>
            </div>

            {/* Dados da chave */}
            <div className="flex-1 space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">
                  {getTipoChaveLabel(tipoChave)}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Chave PIX:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-3 py-2 rounded block break-all flex-1 select-all">
                    {chavePix}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyPix(chavePix)}
                    className="shrink-0"
                  >
                    {copiedPix ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Dados bancários adicionais se existirem */}
              {dados.banco && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Banco:</span>
                  <span className="text-sm font-medium">{String(dados.banco)}</span>
                </div>
              )}
              {(dados.agencia || dados.conta) && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ag/Conta:</span>
                  <span className="text-sm font-medium">{String(dados.agencia || '-')} / {String(dados.conta || '-')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Se não tem PIX, mostrar outros dados bancários */}
        {!chavePix && (
          <div className="space-y-2 text-sm">
            {dados.banco && (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Banco:</span>
                <span className="font-medium">{String(dados.banco)}</span>
              </div>
            )}
            {(dados.agencia || dados.conta) && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ag/Conta:</span>
                <span className="font-medium">{String(dados.agencia || '-')} / {String(dados.conta || '-')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const formatRedesSociais = (redes: Record<string, unknown> | null) => {
    if (!redes || Object.keys(redes).length === 0) {
      return <p className="text-muted-foreground text-sm">Não informado</p>;
    }

    const getSocialIcon = (key: string) => {
      const icons: Record<string, React.ReactNode> = {
        instagram: <Instagram className="h-4 w-4" />,
        youtube: <Youtube className="h-4 w-4" />,
        facebook: <Facebook className="h-4 w-4" />,
        tiktok: <span className="text-sm">📱</span>,
      };
      return icons[key.toLowerCase()] || <ExternalLink className="h-4 w-4" />;
    };

    const getSocialUrl = (key: string, value: string) => {
      const username = value.replace('@', '');
      const urls: Record<string, string> = {
        instagram: `https://instagram.com/${username}`,
        youtube: `https://youtube.com/@${username}`,
        facebook: `https://facebook.com/${username}`,
        tiktok: `https://tiktok.com/@${username}`,
      };
      return urls[key.toLowerCase()] || '#';
    };
    
    return (
      <div className="flex flex-wrap gap-3">
        {Object.entries(redes).map(([key, value]) => (
          value && (
            <a
              key={key}
              href={getSocialUrl(key, String(value))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-primary/10 transition-colors"
            >
              {getSocialIcon(key)}
              <span>{String(value)}</span>
            </a>
          )
        ))}
      </div>
    );
  };

  if (!parceiro) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Detalhes do Parceiro</span>
            {getStatusBadge(parceiro.status)}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="conversoes">
              Conversões {conversoes?.length ? `(${conversoes.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="links">
              Links {links?.length ? `(${links.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="saques">
              Saques {saques?.length ? `(${saques.length})` : ''}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="geral" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              {/* KPIs Financeiros */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">Pendente</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{formatCurrency(kpis.valorPendente)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Disponível</span>
                    </div>
                    <p className="text-xl font-bold mt-1 text-green-600">{formatCurrency(parceiro.saldo_disponivel)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">Total Ganho</span>
                    </div>
                    <p className="text-xl font-bold mt-1">{formatCurrency(parceiro.total_ganhos)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Informações do Parceiro */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informações do Parceiro
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Nome:</span>
                        <span className="text-sm font-medium">{parceiro.nome}</span>
                      </div>
                      {parceiro.nome_exibicao && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Exibição:</span>
                          <span className="text-sm font-medium">{parceiro.nome_exibicao}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="text-sm font-medium">{parceiro.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Telefone:</span>
                        <span className="text-sm font-medium">{parceiro.telefone || '-'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <span className="text-sm font-medium capitalize">{parceiro.tipo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Código:</span>
                        <code className="text-sm bg-muted px-2 py-0.5 rounded">{parceiro.codigo_referencia}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Comissão:</span>
                        <span className="text-sm font-medium">{parceiro.comissao_percentual}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Desde:</span>
                        <span className="text-sm font-medium">
                          {format(new Date(parceiro.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados Bancários */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Dados Bancários
                  </h4>
                  {formatDadosBancarios(parceiro.dados_bancarios)}
                </CardContent>
              </Card>

              {/* Redes Sociais */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Redes Sociais
                  </h4>
                  {formatRedesSociais(parceiro.redes_sociais)}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Tab: Conversões */}
          <TabsContent value="conversoes" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              {/* KPIs de Conversões */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.conversoesPendentes}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                    <p className="text-xs font-medium text-yellow-600">{formatCurrency(kpis.valorPendente)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <CheckCircle className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.conversoesAprovadas}</p>
                    <p className="text-xs text-muted-foreground">Aprovadas</p>
                    <p className="text-xs font-medium text-blue-600">{formatCurrency(kpis.valorAprovado)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.conversoesPagas}</p>
                    <p className="text-xs text-muted-foreground">Pagas</p>
                    <p className="text-xs font-medium text-green-600">{formatCurrency(kpis.valorPago)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.conversoesCanceladas}</p>
                    <p className="text-xs text-muted-foreground">Canceladas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de Conversões */}
              {loadingConversoes ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : conversoes?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma conversão encontrada</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor Venda</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversoes?.map((conv) => (
                      <TableRow key={conv.id}>
                        <TableCell className="text-sm">
                          {format(new Date(conv.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{conv.agendamento?.nome_cliente || '-'}</p>
                            {conv.agendamento?.data_agendamento && (
                              <p className="text-xs text-muted-foreground">
                                Serviço: {format(new Date(conv.agendamento.data_agendamento + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(conv.valor_agendamento)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(conv.valor_comissao)}
                        </TableCell>
                        <TableCell>{getStatusBadge(conv.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Tab: Links */}
          <TabsContent value="links" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              {/* KPIs de Links */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <LinkIcon className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.totalLinks}</p>
                    <p className="text-xs text-muted-foreground">Links Criados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <MousePointer className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.totalCliques}</p>
                    <p className="text-xs text-muted-foreground">Total Cliques</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.totalConversoes}</p>
                    <p className="text-xs text-muted-foreground">Conversões</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <TrendingUp className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.taxaConversao}%</p>
                    <p className="text-xs text-muted-foreground">Taxa Conversão</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de Links */}
              {loadingLinks ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : links?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum link encontrado</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Cliques</TableHead>
                      <TableHead>Conversões</TableHead>
                      <TableHead>Receita</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links?.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">{link.codigo}</code>
                        </TableCell>
                        <TableCell>{link.nome_campanha || '-'}</TableCell>
                        <TableCell className="font-medium">{link.cliques || 0}</TableCell>
                        <TableCell>{link.conversoes || 0}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(link.receita_gerada || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(link.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Tab: Saques */}
          <TabsContent value="saques" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              {/* KPIs de Saques */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.saquesPendentes}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                    <p className="text-xs font-medium text-yellow-600">{formatCurrency(kpis.valorSaquesPendentes)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.saquesPagos}</p>
                    <p className="text-xs text-muted-foreground">Pagos</p>
                    <p className="text-xs font-medium text-green-600">{formatCurrency(kpis.valorSaquesPagos)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold">{kpis.totalSaques}</p>
                    <p className="text-xs text-muted-foreground">Total Saques</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de Saques */}
              {loadingSaques ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : saques?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum saque encontrado</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data Solicitação</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saques?.map((saque) => (
                      <TableRow key={saque.id}>
                        <TableCell>
                          {format(new Date(saque.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(saque.valor)}</TableCell>
                        <TableCell className="uppercase">{saque.metodo}</TableCell>
                        <TableCell>{getStatusBadge(saque.status)}</TableCell>
                        <TableCell>
                          {saque.processado_em
                            ? format(new Date(saque.processado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
