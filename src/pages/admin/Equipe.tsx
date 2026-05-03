import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import TeamStatsCards from '@/components/admin/TeamStatsCards';
import TeamMembersList from '@/components/admin/TeamMembersList';
import InviteMemberModal from '@/components/admin/InviteMemberModal';
import EditRoleModal from '@/components/admin/EditRoleModal';
import ConfirmDeleteDialog from '@/components/admin/ConfirmDeleteDialog';
import { useTeamMembers, useRemoveMember, TeamMember } from '@/hooks/useTeamMembers';
import { useTeamStats } from '@/hooks/useTeamStats';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, Wrench, MessageSquare, UserPlus } from 'lucide-react';
import AdminContainer from '@/components/admin/AdminContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTecnicos } from '@/hooks/useTecnicos';
import TecnicoCard from '@/components/admin/TecnicoCard';
import InviteTecnicoModal from '@/components/admin/InviteTecnicoModal';
import FuncionariosBotList from '@/components/admin/FuncionariosBotList';
import InviteFuncionarioBotModal from '@/components/admin/InviteFuncionarioBotModal';
import { useFuncionariosBot } from '@/hooks/useFuncionariosBot';
import { Button } from '@/components/ui/button';

export default function Equipe() {
  const { user } = useAuth();
  const { data: members, isLoading: loadingMembers } = useTeamMembers();
  const { data: stats, isLoading: loadingStats } = useTeamStats();
  const { data: tecnicos, isLoading: loadingTecnicos } = useTecnicos();
  const { data: funcionariosBot, isLoading: loadingFuncionariosBot } = useFuncionariosBot();
  const removeMember = useRemoveMember();

  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [removingMember, setRemovingMember] = useState<TeamMember | null>(null);
  const [showTecnicoModal, setShowTecnicoModal] = useState(false);

  // Check if current user is admin
  const currentUserMember = members?.find(m => m.id === user?.id);
  const isAdmin = currentUserMember?.role === 'admin';

  const handleRemoveConfirm = async () => {
    if (!removingMember) return;
    await removeMember.mutateAsync(removingMember.id);
    setRemovingMember(null);
  };

  return (
    <AdminContainer>
      <PageHeader
        title="Equipe"
        subtitle="Gerenciamento completo da equipe: membros, técnicos e funcionários bot"
      />

      {!isAdmin && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você tem permissão apenas para visualizar a equipe. Entre em contato
            com um administrador para gerenciar membros.
          </AlertDescription>
        </Alert>
      )}

      <div data-tour="equipe-stats">
        <TeamStatsCards 
          stats={stats} 
          isLoading={loadingStats}
          tecnicosCount={tecnicos?.length || 0}
          funcionariosBotCount={funcionariosBot?.length || 0}
        />
      </div>

      <Tabs defaultValue="membros" className="mt-6">
        <TabsList className="grid w-full grid-cols-3" data-tour="equipe-membros">
          <TabsTrigger value="membros" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Membros do Dashboard</span>
            <span className="sm:hidden">Membros</span>
          </TabsTrigger>
          <TabsTrigger value="tecnicos" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Técnicos</span>
            <span className="sm:hidden">Técnicos</span>
          </TabsTrigger>
          <TabsTrigger value="bot" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Funcionários Bot</span>
            <span className="sm:hidden">Bot</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="membros" className="mt-6">
          <div className="flex justify-end mb-4">
            {isAdmin && <InviteMemberModal />}
          </div>
          <TeamMembersList
            members={members || []}
            isLoading={loadingMembers}
            onEdit={setEditingMember}
            onRemove={setRemovingMember}
            isAdmin={isAdmin}
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="tecnicos" className="mt-6" data-tour="equipe-tecnicos">
          <div className="flex justify-end mb-4">
            {isAdmin && (
              <Button onClick={() => setShowTecnicoModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Técnico
              </Button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingTecnicos ? (
              <p className="text-muted-foreground">Carregando técnicos...</p>
            ) : tecnicos && tecnicos.length > 0 ? (
              tecnicos.map((tecnico) => (
                <TecnicoCard key={tecnico.id} tecnico={tecnico} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">
                Nenhum técnico cadastrado ainda
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bot" className="mt-6">
          <div className="flex justify-end mb-4">
            {isAdmin && <InviteFuncionarioBotModal />}
          </div>
          <FuncionariosBotList />
        </TabsContent>
      </Tabs>

      <EditRoleModal
        member={editingMember}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
      />

      <ConfirmDeleteDialog
        member={removingMember}
        open={!!removingMember}
        onOpenChange={(open) => !open && setRemovingMember(null)}
        onConfirm={handleRemoveConfirm}
      />

      <InviteTecnicoModal
        open={showTecnicoModal}
        onOpenChange={setShowTecnicoModal}
      />
    </AdminContainer>
  );
}
