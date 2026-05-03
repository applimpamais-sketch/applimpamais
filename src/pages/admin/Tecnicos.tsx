import { useState } from 'react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { useTecnicos } from '@/hooks/useTecnicos';
import { useServicosHoje } from '@/hooks/useServicosHoje';
import TecnicoCard from '@/components/admin/TecnicoCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserPlus, Users, CheckCircle2, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import InviteTecnicoModal from '@/components/admin/InviteTecnicoModal';

export default function Tecnicos() {
  const { data: tecnicos, isLoading } = useTecnicos();
  const { data: servicosHojeData } = useServicosHoje();
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const filteredTecnicos = tecnicos?.filter((tecnico) =>
    tecnico.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tecnico.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tecnico.telefone?.includes(searchTerm)
  );

  // Calcular KPIs
  const totalTecnicos = tecnicos?.length || 0;
  const tecnicosAtivos = tecnicos?.length || 0;
  const servicosHoje = servicosHojeData?.total || 0;

  if (isLoading) return <LoadingSpinner />;

  return (
    <AdminContainer>
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Técnicos"
          description="Gerencie a equipe de técnicos e acompanhe a produtividade"
        />

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Técnicos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTecnicos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Técnicos Ativos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tecnicosAtivos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{servicosHoje}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar técnico por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Técnico
          </Button>
        </div>

        {/* Technicians Grid */}
        {filteredTecnicos && filteredTecnicos.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTecnicos.map((tecnico) => (
              <TecnicoCard key={tecnico.id} tecnico={tecnico} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum técnico encontrado</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {searchTerm 
                  ? 'Não encontramos técnicos com esse termo de busca.'
                  : 'Comece adicionando técnicos à sua equipe.'}
              </p>
              {!searchTerm && (
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Técnico
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <InviteTecnicoModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen}
      />
    </AdminContainer>
  );
}
