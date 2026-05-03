import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import RoleBadge from './RoleBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMember } from '@/hooks/useTeamMembers';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
  isAdmin: boolean;
  currentUserId?: string;
}

export default function TeamMemberCard({
  member,
  onEdit,
  onRemove,
  isAdmin,
  currentUserId,
}: TeamMemberCardProps) {
  const initials = member.nome_completo
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = formatDistanceToNow(new Date(member.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const isCurrentUser = currentUserId === member.id;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate">
                  {member.nome_completo}
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground ml-2">(Você)</span>
                  )}
                </p>
              </div>
              <p className="text-xs text-muted-foreground truncate mb-2">
                {member.email}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <RoleBadge role={member.role} />
                {member.telefone_whatsapp && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Smartphone className="h-3 w-3" />
                    WhatsApp
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  • Membro {memberSince}
                </span>
              </div>
            </div>
          </div>

          {isAdmin && !isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(member)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Permissão
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRemove(member)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Acesso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
