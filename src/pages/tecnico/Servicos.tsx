import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMeusServicos } from '@/hooks/useMeusServicos';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PageHeader from '@/components/admin/PageHeader';
import ServicoTecnicoStats from '@/components/admin/ServicoTecnicoStats';
import ServicoTecnicoCard from '@/components/admin/ServicoTecnicoCard';
import TecnicoCalendario from '@/components/tecnico/TecnicoCalendario';
import ComandosWhatsAppCard from '@/components/shared/ComandosWhatsAppCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, List, CalendarDays } from 'lucide-react';

export default function Servicos() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [filtroData, setFiltroData] = useState<'hoje' | 'semana' | 'todos'>('semana');
  const [busca, setBusca] = useState('');
  const [visualizacao, setVisualizacao] = useState<'lista' | 'calendario'>('calendario');
  const { data: servicos = [], isLoading, refetch } = useMeusServicos(filtroData);

  // Toast de boas-vindas no primeiro login
  useEffect(() => {
    if (location.state?.showWelcomeMessage) {
      toast.success('🔧 Bem-vindo à equipe de técnicos!', {
        description: 'Por segurança, recomendamos alterar sua senha.',
        action: {
          label: 'Alterar Senha',
          onClick: () => navigate('/change-password')
        },
        duration: 10000,
      });
      
      // Limpar state para não mostrar novamente
      window.history.replaceState({}, document.title);
    }
  }, [location.state, navigate]);

  // Realtime updates com notificação visual
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`tecnico-servicos-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos',
        },
        (payload: any) => {
          const novoTecnico = payload.new?.tecnico_id;
          const antigoTecnico = payload.old?.tecnico_id;
          
          // Novo serviço atribuído a mim
          if (novoTecnico === user.id && antigoTecnico !== user.id) {
            const nomeCliente = payload.new?.nome_cliente || 'Cliente';
            const dataServico = payload.new?.data_agendamento;
            const horario = payload.new?.horario;
            
            toast.success('🔔 Novo serviço atribuído!', {
              description: `${nomeCliente} - ${dataServico ? new Date(dataServico).toLocaleDateString('pt-BR') : ''} ${horario || ''}`,
              duration: 8000,
              action: {
                label: 'Ver detalhes',
                onClick: () => {
                  setFiltroData('todos');
                }
              }
            });
            refetch();
          }
          // Serviço removido de mim (reatribuído para outro)
          else if (antigoTecnico === user.id && novoTecnico !== user.id) {
            const nomeCliente = payload.old?.nome_cliente || 'Cliente';
            toast.info('📋 Serviço reatribuído', {
              description: `O serviço de ${nomeCliente} foi transferido para outro técnico.`,
              duration: 5000,
            });
            refetch();
          }
          // Atualização de um serviço já meu (mudança de status, etc)
          else if (novoTecnico === user.id && antigoTecnico === user.id) {
            const statusNovo = payload.new?.status;
            const statusAntigo = payload.old?.status;
            
            // Só notifica se o status mudou
            if (statusNovo !== statusAntigo) {
              refetch();
            } else {
              refetch();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const servicosFiltrados = servicos.filter((servico) => {
    if (!busca) return true;
    const buscaLower = busca.toLowerCase();
    return (
      servico.nome_cliente.toLowerCase().includes(buscaLower) ||
      servico.telefone.includes(buscaLower) ||
      servico.endereco.toLowerCase().includes(buscaLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="🧑‍🔧 Meus Serviços"
        description="Gerencie seus serviços atribuídos"
        showHelpButton={false}
      />

      <ServicoTecnicoStats servicos={servicos} />

      {/* Bot WhatsApp Card */}
      <ComandosWhatsAppCard tipo="tecnico" />

      {/* Filtros - Versão compacta */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Filtros de data */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          <Button
            variant={filtroData === 'hoje' ? 'default' : 'ghost'}
            onClick={() => setFiltroData('hoje')}
            size="sm"
            className="h-8 px-3 text-xs sm:text-sm"
          >
            Hoje
          </Button>
          <Button
            variant={filtroData === 'semana' ? 'default' : 'ghost'}
            onClick={() => setFiltroData('semana')}
            size="sm"
            className="h-8 px-3 text-xs sm:text-sm"
          >
            Semana
          </Button>
          <Button
            variant={filtroData === 'todos' ? 'default' : 'ghost'}
            onClick={() => setFiltroData('todos')}
            size="sm"
            className="h-8 px-3 text-xs sm:text-sm"
          >
            Todos
          </Button>
        </div>

        {/* Toggle Visualização - ícones apenas no mobile */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg ml-auto">
          <Button
            variant={visualizacao === 'calendario' ? 'default' : 'ghost'}
            onClick={() => setVisualizacao('calendario')}
            size="sm"
            className="h-8 w-8 p-0 sm:w-auto sm:px-3"
            title="Calendário"
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Calendário</span>
          </Button>
          <Button
            variant={visualizacao === 'lista' ? 'default' : 'ghost'}
            onClick={() => setVisualizacao('lista')}
            size="sm"
            className="h-8 w-8 p-0 sm:w-auto sm:px-3"
            title="Lista"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Lista</span>
          </Button>
        </div>
      </div>

      {/* Busca - só aparece em modo lista */}
      {visualizacao === 'lista' && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, telefone ou endereço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      )}

      {/* Conteúdo */}
      {visualizacao === 'calendario' ? (
        <TecnicoCalendario 
          servicos={servicos} 
          onUpdate={refetch}
        />
      ) : (
        <div className="space-y-4">
          {servicosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {busca
                ? 'Nenhum serviço encontrado com esse filtro'
                : 'Nenhum serviço atribuído'}
            </div>
          ) : (
            servicosFiltrados.map((servico) => (
              <ServicoTecnicoCard
                key={servico.id}
                servico={servico}
                onUpdate={refetch}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
