import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TeamMember } from '@/hooks/useTeamMembers';

interface ConfirmDeleteDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({
  member,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Membro da Equipe</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover <strong>{member.nome_completo}</strong> da equipe?
            <br />
            <br />
            <span className="text-destructive font-semibold">⚠️ Esta ação é permanente!</span>
            <br />
            O usuário será completamente removido do sistema, incluindo:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Conta de acesso</li>
              <li>Perfil e dados pessoais</li>
              <li>Todas as permissões e roles</li>
            </ul>
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Sim, Remover Permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
