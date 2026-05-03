import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, User, User2, MapPin, Calendar, Clock, Edit, MessageCircle, MoreHorizontal, Link, CreditCard, Smartphone, Banknote, Wallet, X } from 'lucide-react';
import { Agendamento } from '@/hooks/useAgendamentos';
import { formatCurrency, formatPhone } from '@/utils/format';
import { useIsMobile } from '@/hooks/use-mobile';
import { getServiceIcon } from '@/utils/dashboardHelpers';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TecnicoSelector from './TecnicoSelector';
import { useTecnicos } from '@/hooks/useTecnicos';
import StatusDropdown from './StatusDropdown';
import AgendamentoPaymentSummary from './AgendamentoPaymentSummary';
import AgendamentoTimeline from './AgendamentoTimeline';
import { OrigemAgendamentoBadge } from './OrigemAgendamentoBadge';
import EditarAgendamentoModal from './EditarAgendamentoModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AgendamentoDetailsModalProps {
  agendamento: Agendamento | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export default function AgendamentoDetailsModal({ 
  agendamento, 
  onClose,
  onUpdateStatus 
}: AgendamentoDetailsModalProps) {
  const isMobile = useIsMobile();
  const { data: tecnicos } = useTecnicos();
  const [showEditModal, setShowEditModal] = useState(false);

  if (!agendamento) return null;
  
  const tecnicoAtual = tecnicos?.find(t => t.id === (agendamento as any).tecnico_id);

  const tempoDecorrido = formatDistanceToNow(new Date(agendamento.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  const whatsappLink = `https://wa.me/55${agendamento.telefone.replace(/\D/g, '')}?text=Olá ${agendamento.nome_cliente}, tudo bem? Vim falar sobre seu agendamento.`;

  // Determinar tipo de origem para exibição
  const getOrigemInfo = () => {
    if (agendamento.parceiro_codigo) {
      return { tipo: 'Parceiro', descricao: `Indicação via código ${agendamento.parceiro_codigo}` };
    }
    if (agendamento.canal_origem) {
      return { tipo: 'Canal Orgânico', descricao: 'Link de campanha interna da empresa' };
    }
    if (agendamento.origem === 'whatsapp_bot') {
      return { tipo: 'Bot WhatsApp', descricao: 'Agendamento realizado via bot automatizado' };
    }
    if (agendamento.origem === 'atendente_whatsapp') {
      return { tipo: 'Atendente', descricao: 'Criado por funcionário via WhatsApp' };
    }
    if (agendamento.criado_manualmente) {
      return { tipo: 'Manual', descricao: 'Criado manualmente pelo administrador' };
    }
    return { tipo: 'Direto (Site)', descricao: 'Cliente acessou o site diretamente' };
  };

  const origemInfo = getOrigemInfo();

  // Pegar iniciais do técnico para avatar
  const getTecnicoInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <Dialog open={!!agendamento} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b px-4 py-4 md:px-6">
          <DialogHeader className="space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <DialogTitle className="text-lg md:text-xl">Detalhes do Agendamento</DialogTitle>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="font-mono text-xs">
                    #{agendamento.id.slice(0, 8).toUpperCase()}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tempoDecorrido}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
                    {agendamento.status !== 'cancelado' && (
                      <DropdownMenuItem className="text-destructive">
                        Cancelar Agendamento
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <StatusDropdown
                  value={agendamento.status}
                  onChange={(newStatus) => onUpdateStatus(agendamento.id, newStatus)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-9 rounded-full hover:bg-destructive/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-5">
          {/* Row 1: Cliente + Resumo de Pagamento */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Cliente Card */}
            <Card className="lg:col-span-3 backdrop-blur-md bg-background/60 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Nome</p>
                      <p className="font-medium truncate">{agendamento.nome_cliente}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Telefone</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatPhone(agendamento.telefone)}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30"
                          onClick={() => window.open(whatsappLink, '_blank')}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {agendamento.genero_cliente && (
                    <div className="flex items-start gap-3">
                      <User2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Gênero</p>
                        <Badge variant="secondary" className="text-xs">
                          {agendamento.genero_cliente === 'masculino' ? 'Masculino' :
                           agendamento.genero_cliente === 'feminino' ? 'Feminino' : 'Não identificado'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo de Pagamento */}
            <div className="lg:col-span-2">
              <AgendamentoPaymentSummary agendamento={agendamento} />
            </div>
          </div>

          {/* Row 2: Data e Local (Unified) */}
          <Card className="backdrop-blur-md bg-background/60 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quando */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Quando
                  </h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2.5 bg-primary/5 px-3 py-2 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {new Date(agendamento.data_agendamento + 'T00:00:00').toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {agendamento.horario && (
                      <div className="flex items-center gap-2.5 bg-muted/50 px-3 py-2 rounded-lg">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{agendamento.horario}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Onde */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Onde
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{agendamento.endereco}</p>
                    {agendamento.bairro && (
                      <p className="text-muted-foreground">
                        {agendamento.bairro} - {agendamento.cidade}
                      </p>
                    )}
                {agendamento.cep && <p className="text-muted-foreground">CEP: {agendamento.cep}</p>}
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div className="space-y-3 md:col-span-2 pt-4 border-t border-border/50">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5" />
                    Forma de Pagamento
                  </h4>
                  {agendamento.forma_pagamento ? (
                    <div className="flex items-center gap-2.5 bg-muted/50 px-3 py-2 rounded-lg w-fit">
                      {agendamento.forma_pagamento === 'cartao' && <CreditCard className="h-4 w-4 text-primary" />}
                      {agendamento.forma_pagamento === 'pix' && <Smartphone className="h-4 w-4 text-primary" />}
                      {agendamento.forma_pagamento === 'dinheiro' && <Banknote className="h-4 w-4 text-primary" />}
                      <span className="font-medium text-sm">
                        {agendamento.forma_pagamento === 'cartao' ? 'Cartão Crédito/Débito' :
                         agendamento.forma_pagamento === 'pix' ? 'PIX' :
                         agendamento.forma_pagamento === 'dinheiro' ? 'Dinheiro' :
                         agendamento.forma_pagamento}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Não informado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 3: Itens Solicitados */}
          <Card className="backdrop-blur-md bg-background/60 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-base">Itens Solicitados</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              {isMobile ? (
                <div className="space-y-3">
                  {agendamento.itens_carrinho.map((item: any, index: number) => {
                    const precoItem = item.price || 0;
                    const quantidadeItem = item.quantity || 1;
                    const subtotalItem = precoItem * quantidadeItem;
                    
                    return (
                      <div key={index} className="p-3.5 backdrop-blur-sm bg-background/40 border border-border/30 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getServiceIcon(item.name)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            {item.details && (
                              <p className="text-xs text-muted-foreground truncate">{item.details}</p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm pt-2 border-t border-border/30">
                          <div>
                            <p className="text-muted-foreground text-xs mb-0.5">Qtd</p>
                            <p className="font-medium">{quantidadeItem}x</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-0.5">Unit.</p>
                            <p className="font-medium">{formatCurrency(precoItem)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-0.5">Total</p>
                            <p className="font-medium text-primary">{formatCurrency(subtotalItem)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agendamento.itens_carrinho.map((item: any, index: number) => {
                      const precoItem = item.price || 0;
                      const quantidadeItem = item.quantity || 1;
                      const subtotalItem = precoItem * quantidadeItem;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{getServiceIcon(item.name)}</span>
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {item.details || '-'}
                          </TableCell>
                          <TableCell className="text-center font-medium">{quantidadeItem}x</TableCell>
                          <TableCell className="text-right">{formatCurrency(precoItem)}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {formatCurrency(subtotalItem)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Row 4: Técnico + Origem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Técnico Atribuído */}
            <Card className="backdrop-blur-md bg-background/60 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Técnico Atribuído
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                {tecnicoAtual ? (
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getTecnicoInitials(tecnicoAtual.nome_completo)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{tecnicoAtual.nome_completo}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {tecnicoAtual.telefone || 'Não informado'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum técnico atribuído</p>
                )}
                
                <TecnicoSelector 
                  agendamentoId={agendamento.id} 
                  tecnicoAtualId={(agendamento as any).tecnico_id}
                  onUpdate={() => window.location.reload()}
                />
              </CardContent>
            </Card>

            {/* Origem do Lead */}
            <Card className="backdrop-blur-md bg-background/60 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link className="h-4 w-4 text-primary" />
                  Origem do Lead
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Via:</span>
                  <OrigemAgendamentoBadge
                    origem={agendamento.origem}
                    criadoPorFuncionarioBotId={agendamento.criado_por_funcionario_bot}
                    criadoManualmente={agendamento.criado_manualmente}
                    parceiroCodigo={agendamento.parceiro_codigo}
                    canalOrigem={agendamento.canal_origem}
                  />
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Tipo: </span>
                  <span className="font-medium">{origemInfo.tipo}</span>
                </div>
                <p className="text-xs text-muted-foreground">{origemInfo.descricao}</p>
              </CardContent>
            </Card>
          </div>

          {/* Row 5: Histórico */}
          <AgendamentoTimeline agendamentoId={agendamento.id} collapsibleOnMobile={isMobile} />
        </div>

        {/* Modal de Edição */}
        <EditarAgendamentoModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          agendamento={agendamento}
          onSuccess={() => {
            setShowEditModal(false);
            window.location.reload();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
