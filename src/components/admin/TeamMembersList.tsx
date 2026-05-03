import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TeamMemberCard from './TeamMemberCard';
import { TeamMember } from '@/hooks/useTeamMembers';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamMembersListProps {
  members: TeamMember[];
  isLoading: boolean;
  onEdit: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
  isAdmin: boolean;
  currentUserId?: string;
}

export default function TeamMembersList({
  members,
  isLoading,
  onEdit,
  onRemove,
  isAdmin,
  currentUserId,
}: TeamMembersListProps) {
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter(
    member =>
      member.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum membro encontrado
            </p>
          ) : (
            filteredMembers.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onEdit={onEdit}
                onRemove={onRemove}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
