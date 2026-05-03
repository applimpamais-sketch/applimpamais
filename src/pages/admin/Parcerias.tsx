import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users2, 
  TrendingUp, 
  DollarSign, 
  Link as LinkIcon,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreHorizontal,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ParceiroDetailsModal from '@/components/admin/ParceiroDetailsModal';
import ConfirmarPagamentoSaqueModal from '@/components/admin/ConfirmarPagamentoSaqueModal';
import { useRealtimeParcerias } from '@/hooks/useRealtimeParcerias';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';

type ParceiroStatus = 'pendente' | 'ativo' | 'suspenso' | 'inativo';

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
  status: ParceiroStatus;
  saldo_disponivel: number;
  total_ganhos: number;
  dados_bancarios: Record<string, unknown> | null;
  redes_sociais: Record<string, unknown> | null;
  created_at: string;
  aprovado_em: string | null;
}

interface ParceiroConversao {
  id: string;
  parceiro_id: string;
  agendamento_id: string;
  valor_agendamento: number;
  valor_comissao: number;
  status: string;
  created_at: string;
  parceiros?: {
    nome: string;
    codigo_referencia: string;
  };
}

interface ParceiroSaque {
  id: string;
  parceiro_id: string;
  valor: number;
  metodo: string;
  dados_pagamento: {
    tipo_chave_pix?: string;
    chave_pix?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
  } | null;
  status: string;
  created_at: string;
  processado_em: string | null;
  parceiros?: {
    nome: string;
    codigo_referencia: string;
    dados_bancarios?: Record<string, unknown> | null;
  };
}

export default function Parcerias() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParceiro, setSelectedParceiro] = useState<Parceiro | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ chavePix: string; nomeParceiro: string; valor: number } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pagamentoModal, setPagamentoModal] = useState<{
    id: string;
    valor: number;
    parceiro_nome: string;
    chave_pix?: string;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getTipoChaveLabel = (tipo: string | undefined) => {
    const labels: Record<string, string> = {
      'aleatoria': 'Chave Aleatória',
      'cpf': 'CPF',
      'cnpj': 'CNPJ',
      'email': 'E-mail',
      'telefone': 'Telefone',
    };
    return labels[tipo?.toLowerCase() || ''] || 'Chave PIX';
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast({ title: 'Chave copiada!' });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Realtime para atualização automática
  const handleRealtimeUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-parceiros'] });
    queryClient.invalidateQueries({ queryKey: ['admin-parcerias-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-conversoes'] });
    queryClient.invalidateQueries({ queryKey: ['admin-saques'] });
  }, [queryClient]);
  
  useRealtimeParcerias(handleRealtimeUpdate);

  // Fetch parceiros
  const { data: parceiros, isLoading: loadingParceiros } = useQuery({
    queryKey: ['admin-parceiros'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parceiros')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Parceiro[];
    }
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-parcerias-stats'],
    queryFn: async () => {
      const [parceirosRes, conversoesRes, saquesRes] = await Promise.all([
        supabase.from('parceiros').select('status, saldo_disponivel, total_ganhos'),
        supabase.from('parceiro_conversoes').select('valor_agendamento, valor_comissao, status'),
        supabase.from('parceiro_saques').select('valor, status')
      ]);

      const parceirosData = parceirosRes.data || [];
      const conversoesData = conversoesRes.data || [];
      const saquesData = saquesRes.data || [];

      return {
        totalParceiros: parceirosData.filter(p => p.status === 'ativo').length,
        pendentesAprovacao: parceirosData.filter(p => p.status === 'pendente').length,
        receitaViaParceiros: conversoesData.reduce((sum, c) => sum + (c.valor_agendamento || 0), 0),
        comissoesPendentes: conversoesData
          .filter(c => c.status === 'aprovada')
          .reduce((sum, c) => sum + (c.valor_comissao || 0), 0),
        comissoesPagas: saquesData
          .filter(s => s.status === 'pago')
          .reduce((sum, s) => sum + (s.valor || 0), 0),
        saquesPendentes: saquesData
          .filter(s => s.status === 'solicitado')
          .reduce((sum, s) => sum + (s.valor || 0), 0)
      };
    }
  });

  // Fetch conversões recentes
  const { data: conversoesRecentes } = useQuery({
    queryKey: ['admin-conversoes-recentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parceiro_conversoes')
        .select('*, parceiros(nome, codigo_referencia)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as ParceiroConversao[];
    }
  });

  // Fetch saques pendentes
  const { data: saquesPendentes } = useQuery({
    queryKey: ['admin-saques-pendentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parceiro_saques')
        .select('*, parceiros(nome, codigo_referencia, dados_bancarios)')
        .in('status', ['solicitado', 'processando'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ParceiroSaque[];
    }
  });

  // Mutation para aprovar/rejeitar parceiro
  const updateParceiroStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ParceiroStatus }) => {
      const updateData: Record<string, unknown> = { status };
      if (status === 'ativo') {
        updateData.aprovado_em = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('parceiros')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Se aprovado, enviar boas-vindas via WhatsApp
      if (status === 'ativo') {
        const { data: parceiro } = await supabase
          .from('parceiros')
          .select('nome, telefone, codigo_referencia')
          .eq('id', id)
          .single();
        
        if (parceiro?.telefone) {
          await supabase.functions.invoke('send-welcome-bot', {
            body: {
              tipo: 'parceiro',
              nome: parceiro.nome,
              telefone: parceiro.telefone,
              codigo: parceiro.codigo_referencia,
            },
          });
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-parceiros'] });
      queryClient.invalidateQueries({ queryKey: ['admin-parcerias-stats'] });
      toast({ 
        title: variables.status === 'ativo' 
          ? '✅ Parceiro aprovado! Boas-vindas enviada via WhatsApp.' 
          : 'Status do parceiro atualizado!' 
      });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  });

  // Mutation para processar saque
  const processarSaque = useMutation({
    mutationFn: async ({ id, status, comprovante_url, observacoes }: { 
      id: string; 
      status: string; 
      comprovante_url?: string | null;
      observacoes?: string;
    }) => {
      const updateData: Record<string, unknown> = { 
        status,
        processado_em: new Date().toISOString()
      };
      
      if (comprovante_url) {
        updateData.comprovante_url = comprovante_url;
      }
      
      if (observacoes) {
        updateData.motivo_rejeicao = observacoes; // Reutilizando campo para observações
      }
      
      const { error } = await supabase
        .from('parceiro_saques')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      return status;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ['admin-saques-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-parcerias-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-parceiros'] });
      
      if (status === 'pago') {
        toast({ 
          title: '✅ Saque confirmado como pago!',
          description: 'O parceiro já pode visualizar a atualização na dashboard.'
        });
      } else {
        toast({ title: 'Saque rejeitado' });
      }
    },
    onError: () => {
      toast({ title: 'Erro ao processar saque', variant: 'destructive' });
    }
  });

  const handleConfirmarPagamento = (saqueId: string, comprovanteUrl: string | null, observacoes: string) => {
    processarSaque.mutate({ 
      id: saqueId, 
      status: 'pago', 
      comprovante_url: comprovanteUrl,
      observacoes 
    });
  };

  const filteredParceiros = parceiros?.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      ativo: { variant: 'default', label: 'Ativo' },
      pendente: { variant: 'secondary', label: 'Pendente' },
      suspenso: { variant: 'destructive', label: 'Suspenso' },
      inativo: { variant: 'outline', label: 'Inativo' },
      solicitado: { variant: 'secondary', label: 'Solicitado' },
      processando: { variant: 'secondary', label: 'Processando' },
      pago: { variant: 'default', label: 'Pago' },
      rejeitado: { variant: 'destructive', label: 'Rejeitado' },
      aprovada: { variant: 'default', label: 'Aprovada' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Programa de Parcerias"
        description="Gerencie parceiros, influencers e afiliados"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card data-tour="parcerias-ativos">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Parceiros Ativos</p>
                <p className="text-xl font-bold">{stats?.totalParceiros || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-tour="parcerias-pendentes">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold">{stats?.pendentesAprovacao || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-tour="parcerias-receita">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receita Parceiros</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.receitaViaParceiros || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Comissões Pendentes</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.comissoesPendentes || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Comissões Pagas</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.comissoesPagas || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saques Pendentes</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.saquesPendentes || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="parceiros" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parceiros">Parceiros</TabsTrigger>
          <TabsTrigger value="conversoes" data-tour="parcerias-conversoes">Conversões Recentes</TabsTrigger>
          <TabsTrigger value="saques" data-tour="parcerias-saques">Saques Pendentes</TabsTrigger>
        </TabsList>

        {/* Tab: Parceiros */}
        <TabsContent value="parceiros">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Parceiros</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar parceiro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingParceiros ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : filteredParceiros?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum parceiro encontrado</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parceiro</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Total Ganhos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParceiros?.map((parceiro) => (
                      <TableRow key={parceiro.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{parceiro.nome}</p>
                            <p className="text-xs text-muted-foreground">{parceiro.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">{parceiro.codigo_referencia}</code>
                        </TableCell>
                        <TableCell className="capitalize">{parceiro.tipo}</TableCell>
                        <TableCell>{parceiro.comissao_percentual}%</TableCell>
                        <TableCell>{formatCurrency(parceiro.saldo_disponivel)}</TableCell>
                        <TableCell>{formatCurrency(parceiro.total_ganhos)}</TableCell>
                        <TableCell>{getStatusBadge(parceiro.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedParceiro(parceiro);
                                setDetailsOpen(true);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              {parceiro.status === 'pendente' && (
                                <>
                                  <DropdownMenuItem onClick={() => updateParceiroStatus.mutate({ id: parceiro.id, status: 'ativo' })}>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    Aprovar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateParceiroStatus.mutate({ id: parceiro.id, status: 'inativo' })}>
                                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                    Rejeitar
                                  </DropdownMenuItem>
                                </>
                              )}
                              {parceiro.status === 'ativo' && (
                                <DropdownMenuItem onClick={() => updateParceiroStatus.mutate({ id: parceiro.id, status: 'suspenso' })}>
                                  <XCircle className="h-4 w-4 mr-2 text-orange-500" />
                                  Suspender
                                </DropdownMenuItem>
                              )}
                              {parceiro.status === 'suspenso' && (
                                <DropdownMenuItem onClick={() => updateParceiroStatus.mutate({ id: parceiro.id, status: 'ativo' })}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  Reativar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Conversões */}
        <TabsContent value="conversoes">
          <Card>
            <CardHeader>
              <CardTitle>Conversões Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {conversoesRecentes?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma conversão ainda</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parceiro</TableHead>
                      <TableHead>Valor Venda</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversoesRecentes?.map((conversao) => (
                      <TableRow key={conversao.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{conversao.parceiros?.nome || '-'}</p>
                            <code className="text-xs text-muted-foreground">{conversao.parceiros?.codigo_referencia}</code>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(conversao.valor_agendamento)}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(conversao.valor_comissao)}
                        </TableCell>
                        <TableCell>{getStatusBadge(conversao.status)}</TableCell>
                        <TableCell>
                          {format(new Date(conversao.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Saques */}
        <TabsContent value="saques">
          <Card>
            <CardHeader>
              <CardTitle>Saques Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {saquesPendentes?.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum saque pendente</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parceiro</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Dados para Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Solicitado em</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saquesPendentes?.map((saque) => {
                      // Prioriza dados_pagamento do saque, senão usa dados_bancarios do parceiro
                      const dadosPag = saque.dados_pagamento || (saque.parceiros?.dados_bancarios as typeof saque.dados_pagamento);
                      const tipoChave = dadosPag?.tipo_chave_pix;
                      const chavePix = dadosPag?.chave_pix;
                      const banco = dadosPag?.banco;
                      const agencia = dadosPag?.agencia;
                      const conta = dadosPag?.conta;
                      
                      return (
                        <TableRow key={saque.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{saque.parceiros?.nome || '-'}</p>
                              <code className="text-xs text-muted-foreground">{saque.parceiros?.codigo_referencia}</code>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-green-600">{formatCurrency(saque.valor)}</TableCell>
                          <TableCell className="uppercase">
                            <Badge variant="outline">{saque.metodo}</Badge>
                          </TableCell>
                          <TableCell>
                            {saque.metodo === 'pix' && chavePix ? (
                              <div className="space-y-2">
                                <Badge variant="secondary" className="text-xs">
                                  {getTipoChaveLabel(tipoChave)}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm bg-muted px-2 py-1 rounded break-all max-w-[200px] truncate">
                                    {chavePix}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => handleCopyKey(chavePix)}
                                  >
                                    {copiedKey === chavePix ? (
                                      <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1"
                                    onClick={() => setQrCodeData({
                                      chavePix,
                                      nomeParceiro: saque.parceiros?.nome || 'Parceiro',
                                      valor: saque.valor
                                    })}
                                  >
                                    <QrCode className="h-3.5 w-3.5" />
                                    QR Code
                                  </Button>
                                </div>
                              </div>
                            ) : saque.metodo === 'transferencia' && banco ? (
                              <div className="text-sm space-y-0.5">
                                <p><span className="text-muted-foreground">Banco:</span> {banco}</p>
                                <p><span className="text-muted-foreground">Ag:</span> {agencia} | <span className="text-muted-foreground">Conta:</span> {conta}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm italic">Dados não informados</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(saque.status)}</TableCell>
                          <TableCell>
                            {format(new Date(saque.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="space-x-1">
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                const chavePix = saque.dados_pagamento?.chave_pix 
                                  || (saque.parceiros?.dados_bancarios as Record<string, unknown>)?.chave_pix as string
                                  || undefined;
                                setPagamentoModal({
                                  id: saque.id,
                                  valor: saque.valor,
                                  parceiro_nome: saque.parceiros?.nome || 'Parceiro',
                                  chave_pix: chavePix
                                });
                              }}
                              disabled={processarSaque.isPending}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Pagar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-destructive hover:bg-destructive/10"
                              onClick={() => processarSaque.mutate({ id: saque.id, status: 'rejeitado' })}
                              disabled={processarSaque.isPending}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Rejeitar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes */}
      <ParceiroDetailsModal
        parceiro={selectedParceiro}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {/* Modal Confirmar Pagamento */}
      <ConfirmarPagamentoSaqueModal
        open={!!pagamentoModal}
        onOpenChange={() => setPagamentoModal(null)}
        saque={pagamentoModal}
        onConfirm={handleConfirmarPagamento}
      />

      {/* Modal QR Code PIX */}
      <Dialog open={!!qrCodeData} onOpenChange={() => setQrCodeData(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>QR Code PIX</DialogTitle>
          </DialogHeader>
          {qrCodeData && (
            <div className="space-y-4 py-4">
              <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                <QRCodeSVG 
                  value={qrCodeData.chavePix} 
                  size={200}
                  level="H"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Escaneie o QR Code acima para copiar a chave PIX
                </p>
                <p className="font-medium">{qrCodeData.nomeParceiro}</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(qrCodeData.valor)}
                </p>
              </div>
              <div className="pt-2 space-y-2">
                <p className="text-xs text-muted-foreground">Chave PIX:</p>
                <code className="text-sm bg-muted px-3 py-2 rounded block break-all select-all">
                  {qrCodeData.chavePix}
                </code>
                <Button 
                  className="w-full gap-2" 
                  onClick={() => handleCopyKey(qrCodeData.chavePix)}
                >
                  {copiedKey === qrCodeData.chavePix ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar Chave
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminContainer>
  );
}
