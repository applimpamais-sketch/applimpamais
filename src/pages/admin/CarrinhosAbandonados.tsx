import { useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/admin/PageHeader";
import AdminContainer from "@/components/admin/AdminContainer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, TrendingUp, DollarSign, Calendar, Bot, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCarrinhosAbandonados, useCarrinhosAbandonadosStats, CarrinhoAbandonado } from "@/hooks/useCarrinhosAbandonados";
import { useRealtimeCarrinhos } from "@/hooks/useRealtimeCarrinhos";
import { CarrinhoAbandonadoCard } from "@/components/admin/CarrinhoAbandonadoCard";
import { RecoveryWhatsAppModal } from "@/components/admin/RecoveryWhatsAppModal";
import { CarrinhoAbandonadoModal } from "@/components/admin/CarrinhoAbandonadoModal";
import { RecuperarCarrinhoModal, DadosRecuperacao } from "@/components/admin/RecuperarCarrinhoModal";
import * as format from "@/utils/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

export default function CarrinhosAbandonados() {
  const [etapaFiltro, setEtapaFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('abandonado');
  const [periodoFiltro, setPeriodoFiltro] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('todos');
  
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [recuperarModalOpen, setRecuperarModalOpen] = useState(false);
  const [selectedCarrinho, setSelectedCarrinho] = useState<CarrinhoAbandonado | null>(null);

  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useCarrinhosAbandonadosStats();
  const { data: carrinhos, isLoading, refetch } = useCarrinhosAbandonados({
    status: statusFiltro,
    etapa: etapaFiltro,
    periodo: periodoFiltro,
  });

  // Realtime para atualização automática
  const handleRealtimeUpdate = useCallback(() => {
    refetch();
    refetchStats();
  }, [refetch, refetchStats]);
  
  useRealtimeCarrinhos(handleRealtimeUpdate);

  const handleSendWhatsApp = (carrinho: CarrinhoAbandonado) => {
    setSelectedCarrinho(carrinho);
    setWhatsappModalOpen(true);
  };

  const handleSendWhatsAppMessage = async (message: string) => {
    if (!selectedCarrinho) return;

    try {
      const { error } = await supabase.functions.invoke('send-recovery-whatsapp', {
        body: {
          telefone: selectedCarrinho.telefone,
          mensagem: message,
          carrinhoId: selectedCarrinho.id,
        },
      });

      if (error) throw error;

      // Atualizar tentativas de contato
      await supabase
        .from('carrinhos_abandonados')
        .update({
          tentativas_contato: selectedCarrinho.tentativas_contato + 1,
          ultima_tentativa_contato: new Date().toISOString(),
        })
        .eq('id', selectedCarrinho.id);

      toast.success('WhatsApp enviado com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      toast.error('Erro ao enviar WhatsApp');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('carrinhos_abandonados')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success('Status atualizado!');
      refetch();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleRecuperar = (carrinho: CarrinhoAbandonado) => {
    setSelectedCarrinho(carrinho);
    setRecuperarModalOpen(true);
  };

  const handleConfirmRecuperar = async (dadosCompletos: DadosRecuperacao) => {
    if (!selectedCarrinho) return;
    
    try {
      // 1. Criar agendamento com TODOS os dados do formulário
      const { error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert({
          nome_cliente: dadosCompletos.nome_cliente,
          telefone: dadosCompletos.telefone,
          endereco: dadosCompletos.endereco,
          bairro: dadosCompletos.bairro,
          cidade: dadosCompletos.cidade,
          cep: dadosCompletos.cep,
          data_agendamento: dadosCompletos.data_agendamento,
          horario: null,
          itens_carrinho: selectedCarrinho.itens_carrinho,
          valor_total: selectedCarrinho.valor_total,
          valor_desconto: selectedCarrinho.valor_desconto,
          cupom_codigo: selectedCarrinho.cupom_codigo,
          cupom_desconto_percentual: selectedCarrinho.cupom_desconto_percentual,
          genero_cliente: null,
          status: 'confirmado',
        });

      if (agendamentoError) throw agendamentoError;

      // 2. Atualizar status do carrinho para recuperado
      const { error: updateError } = await supabase
        .from('carrinhos_abandonados')
        .update({ status: 'recuperado' })
        .eq('id', selectedCarrinho.id);

      if (updateError) throw updateError;

      toast.success('Carrinho recuperado com sucesso!');
      setRecuperarModalOpen(false);
      setSelectedCarrinho(null);
      refetch();
    } catch (error) {
      console.error('Erro ao recuperar carrinho:', error);
      toast.error('Erro ao recuperar carrinho');
    }
  };

  const handleViewDetails = (carrinho: CarrinhoAbandonado) => {
    setSelectedCarrinho(carrinho);
    setDetailsModalOpen(true);
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Carrinhos Abandonados"
        subtitle="Gerencie e recupere carrinhos abandonados pelos clientes"
      />

        {/* KPIs */}
        {loadingStats ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="p-4 sm:p-6" data-tour="carrinhos-total">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats?.total || 0}</p>
                </div>
                <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>

            <Card className="p-4 sm:p-6" data-tour="carrinhos-recuperacao">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Taxa Recuperação</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats?.taxaRecuperacao || 0}%</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>

            <Card className="p-4 sm:p-6" data-tour="carrinhos-valor">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Valor em Risco</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{format.formatCurrency(stats?.valorEmRisco || 0)}</p>
                </div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Recuperados</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{format.formatCurrency(stats?.valorRecuperado || 0)}</p>
                </div>
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          </div>
        )}

        {/* Card de Status da Automação */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800" data-tour="carrinhos-automacao">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-green-900 dark:text-green-100 flex items-center gap-2">
                  <span className="truncate">Automação de Recuperação</span>
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                </h3>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-0.5 sm:mt-1">
                  <span className="hidden sm:inline">WhatsApp automático enviado 2 minutos após abandono • Seg-Sáb, 8h-20h</span>
                  <span className="sm:hidden">WhatsApp automático • Seg-Sáb, 8h-20h</span>
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
              Ativo
            </Badge>
          </div>
        </Card>

        {/* Filtros */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div data-tour="carrinhos-tabs">
              <p className="text-xs sm:text-sm font-medium mb-2">Status</p>
              <Tabs value={statusFiltro} onValueChange={setStatusFiltro}>
                <TabsList className="h-auto flex-wrap">
                  <TabsTrigger value="abandonado" className="text-xs sm:text-sm px-2 sm:px-3">Abandonado</TabsTrigger>
                  <TabsTrigger value="contatado" className="text-xs sm:text-sm px-2 sm:px-3">Contatado</TabsTrigger>
                  <TabsTrigger value="recuperado" className="text-xs sm:text-sm px-2 sm:px-3">Recuperado</TabsTrigger>
                  <TabsTrigger value="perdido" className="text-xs sm:text-sm px-2 sm:px-3">Perdido</TabsTrigger>
                  <TabsTrigger value="todos" className="text-xs sm:text-sm px-2 sm:px-3">Todos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium mb-2">Etapa</p>
              <Tabs value={etapaFiltro} onValueChange={setEtapaFiltro}>
                <TabsList className="h-auto">
                  <TabsTrigger value="todos" className="text-xs sm:text-sm px-2 sm:px-3">Todos</TabsTrigger>
                  <TabsTrigger value="carrinho" className="text-xs sm:text-sm px-2 sm:px-3">Carrinho</TabsTrigger>
                  <TabsTrigger value="agendamento" className="text-xs sm:text-sm px-2 sm:px-3">Agendamento</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium mb-2">Período</p>
              <Tabs value={periodoFiltro} onValueChange={(v) => setPeriodoFiltro(v as any)}>
                <TabsList className="h-auto flex-wrap">
                  <TabsTrigger value="hoje" className="text-xs sm:text-sm px-2 sm:px-3">24h</TabsTrigger>
                  <TabsTrigger value="semana" className="text-xs sm:text-sm px-2 sm:px-3">Semana</TabsTrigger>
                  <TabsTrigger value="mes" className="text-xs sm:text-sm px-2 sm:px-3">Mês</TabsTrigger>
                  <TabsTrigger value="todos" className="text-xs sm:text-sm px-2 sm:px-3">Todos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </Card>

        {/* Lista de Carrinhos */}
        {isLoading ? (
          <LoadingSpinner />
        ) : carrinhos && carrinhos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {carrinhos.map((carrinho) => (
              <CarrinhoAbandonadoCard
                key={carrinho.id}
                carrinho={carrinho}
                onSendWhatsApp={handleSendWhatsApp}
                onUpdateStatus={handleUpdateStatus}
                onRecuperar={handleRecuperar}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum carrinho abandonado</h3>
            <p className="text-muted-foreground">
              Não há carrinhos abandonados com os filtros selecionados.
            </p>
          </Card>
        )}
      {/* Modais */}
      <RecoveryWhatsAppModal
        open={whatsappModalOpen}
        onOpenChange={setWhatsappModalOpen}
        carrinho={selectedCarrinho}
        onSend={handleSendWhatsAppMessage}
      />

      <CarrinhoAbandonadoModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        carrinho={selectedCarrinho}
      />

      <RecuperarCarrinhoModal
        open={recuperarModalOpen}
        onOpenChange={setRecuperarModalOpen}
        carrinho={selectedCarrinho}
        onConfirm={handleConfirmRecuperar}
      />
    </AdminContainer>
  );
}
